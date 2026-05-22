package in.ashokit.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import in.ashokit.entity.User;
import in.ashokit.repository.UserRepository;
import in.ashokit.security.JwtUtil;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new MessageDeliveryException("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7).trim();

            if (token.isEmpty()) {
                throw new MessageDeliveryException("Missing JWT token");
            }

            String email;
            try {
                email = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                throw new MessageDeliveryException("Invalid JWT token");
            }

            if (email == null || email.isBlank()) {
                throw new MessageDeliveryException("Invalid JWT token");
            }

            User user = userRepository.findByEmailIgnoreCase(email);
            if (user == null) {
                throw new MessageDeliveryException("User not found");
            }

            if (!jwtUtil.validateToken(token, user.getEmail())) {
                throw new MessageDeliveryException("Expired or invalid JWT token");
            }

            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.name()))
                    .toList();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            String.valueOf(user.getId()),
                            null,
                            authorities
                    );

            accessor.setUser(authentication);
        }

        return message;
    }
}