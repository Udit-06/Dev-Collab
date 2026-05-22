package in.ashokit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String name, String token) {
        String link = "http://localhost:8080/users/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Verify your DevCollab account");
        message.setText("Hi " + name + ",\n\nVerify your email using this link:\n" + link + "\n\nThis link will expire soon.");
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Reset your DevCollab password");
        message.setText("Hi " + name + ",\n\nReset your password using this link:\n" + link + "\n\nIf you did not request this, ignore this email.");
        mailSender.send(message);
    }

    public void sendInvitationEmail(String to, String inviterName, String targetName, String token) {
        String link = frontendUrl + "/accept-invitation?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("You have been invited to DevCollab");
        message.setText("Hi,\n\n" + inviterName + " invited you to join " + targetName + ".\n\nAccept invitation:\n" + link);
        mailSender.send(message);
    }
}