package in.ashokit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import in.ashokit.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtAsc(
            Long senderId1, Long receiverId1,
            Long senderId2, Long receiverId2
    );

    List<ChatMessage> findBySenderIdOrReceiverIdOrderBySentAtDesc(Long senderId, Long receiverId);
}