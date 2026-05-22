package in.ashokit.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import in.ashokit.dto.PrivateChatRequest;
import in.ashokit.service.PrivateChatService;

@Controller
public class PrivateChatWebSocketController {

    @Autowired
    private PrivateChatService privateChatService;

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(PrivateChatRequest request, Principal principal) {
        privateChatService.sendPrivateMessage(principal, request);
    }
}