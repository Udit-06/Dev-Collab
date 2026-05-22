package in.ashokit.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import in.ashokit.entity.Notification;
import in.ashokit.entity.User;
import in.ashokit.repository.UserRepository;
import in.ashokit.service.NotificationService;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Notification> getMyNotifications(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName());
        return notificationService.getUserNotifications(user.getId());
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName());
        return notificationService.getUnreadCount(user.getId());
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmailIgnoreCase(authentication.getName());
        return notificationService.markAsRead(id, user.getId());
    }
}