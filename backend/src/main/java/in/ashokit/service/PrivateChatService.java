package in.ashokit.service;

import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import in.ashokit.dto.ChatMessageResponse;
import in.ashokit.dto.ChatUserDto;
import in.ashokit.dto.PrivateChatRequest;
import in.ashokit.entity.ChatMessage;
import in.ashokit.entity.User;
import in.ashokit.repository.ChatMessageRepository;
import in.ashokit.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class PrivateChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AuditLogService auditLogService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public ChatMessageResponse sendPrivateMessage(Principal principal, PrivateChatRequest request) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Long senderId = Long.valueOf(principal.getName());
        Long receiverId = request.getReceiverId();

        if (receiverId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Receiver is required");
        }

        if (senderId.equals(receiverId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        }

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content is required");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        ChatMessage message = new ChatMessage();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(request.getContent().trim());

        ChatMessage saved = chatMessageRepository.save(message);

        ChatMessageResponse payload = new ChatMessageResponse(
                saved.getId(),
                saved.getSenderId(),
                saved.getReceiverId(),
                saved.getContent(),
                saved.getSentAt()
        );

        messagingTemplate.convertAndSendToUser(String.valueOf(receiverId), "/queue/messages", payload);
        messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/messages", payload);

        auditLogService.log(
                sender.getEmail(),
                "PRIVATE_MESSAGE_SENT",
                "CHAT_MESSAGE",
                saved.getId(),
                "Message sent to user id " + receiverId
        );

        return payload;
    }

    public List<ChatMessageResponse> getConversation(Long currentUserId, Long otherUserId) {
        if (!userRepository.existsById(otherUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return chatMessageRepository
                .findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
                        currentUserId, otherUserId,
                        otherUserId, currentUserId
                )
                .stream()
                .map(msg -> new ChatMessageResponse(
                        msg.getId(),
                        msg.getSenderId(),
                        msg.getReceiverId(),
                        msg.getContent(),
                        msg.getSentAt()
                ))
                .toList();
    }

    public List<ChatUserDto> getChatUsers(Long currentUserId) {
        List<ChatMessage> allMessages = chatMessageRepository
                .findBySenderIdOrReceiverIdOrderBySentAtDesc(currentUserId, currentUserId);

        Map<Long, ChatUserDto> recentChats = new LinkedHashMap<>();

        for (ChatMessage msg : allMessages) {
            Long otherUserId = msg.getSenderId().equals(currentUserId)
                    ? msg.getReceiverId()
                    : msg.getSenderId();

            if (recentChats.containsKey(otherUserId)) {
                continue;
            }

            User otherUser = userRepository.findById(otherUserId).orElse(null);
            if (otherUser == null) {
                continue;
            }

            recentChats.put(otherUserId, new ChatUserDto(
                    otherUser.getId(),
                    otherUser.getName(),
                    otherUser.getEmail(),
                    otherUser.getProfileImage(),
                    msg.getContent(),
                    msg.getSentAt() != null ? msg.getSentAt().format(FORMATTER) : null
            ));
        }

        if (recentChats.isEmpty()) {
            List<User> users = userRepository.findAll().stream()
                    .filter(user -> !user.getId().equals(currentUserId))
                    .toList();

            List<ChatUserDto> fallback = new ArrayList<>();
            for (User user : users) {
                fallback.add(new ChatUserDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getProfileImage(),
                        null,
                        null
                ));
            }
            return fallback;
        }

        return new ArrayList<>(recentChats.values());
    }
}