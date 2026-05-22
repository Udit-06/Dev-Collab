package in.ashokit.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import in.ashokit.dto.ChatMessageResponse;
import in.ashokit.dto.ChatUserDto;
import in.ashokit.entity.User;
import in.ashokit.repository.UserRepository;
import in.ashokit.service.PrivateChatService;

@RestController
@RequestMapping("/chat")
public class PrivateChatController {

    @Autowired
    private PrivateChatService privateChatService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/conversation/{otherUserId}")
    public List<ChatMessageResponse> getConversation(
            @PathVariable Long otherUserId,
            Principal principal
    ) {
        User currentUser = userRepository.findByEmailIgnoreCase(principal.getName());
        if (currentUser == null) {
            throw new RuntimeException("User not found");
        }

        return privateChatService.getConversation(currentUser.getId(), otherUserId);
    }

    @GetMapping("/users")
    public List<ChatUserDto> getChatUsers(Principal principal) {
        User currentUser = userRepository.findByEmailIgnoreCase(principal.getName());
        if (currentUser == null) {
            throw new RuntimeException("User not found");
        }

        return privateChatService.getChatUsers(currentUser.getId());
    }
}