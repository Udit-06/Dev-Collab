package in.ashokit.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import in.ashokit.dto.UpdateProfileRequest;
import in.ashokit.entity.Role;
import in.ashokit.entity.User;
import in.ashokit.repository.UserRepository;
import in.ashokit.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class UserService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MailService mailService;

    @Autowired
    private AuditLogService auditLogService;

    public String register(User user, HttpServletRequest request) {
        if (userRepository.findByEmailIgnoreCase(user.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        user.setEmail(user.getEmail());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Set.of(Role.ROLE_USER));
        user.setEmailVerified(false);

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        User saved = userRepository.save(user);

        mailService.sendVerificationEmail(saved.getEmail(), saved.getName(), verificationToken);
        auditLogService.log(saved.getEmail(), "USER_REGISTERED", "USER", saved.getId(), "User registered", request);

        return "Registration successful. Verification email sent to your inbox.";
    }

    public User updateUser(Long id, User user, HttpServletRequest request) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getName() != null && !user.getName().isBlank()) {
            existing.setName(user.getName());
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            if (!existing.getEmail().equalsIgnoreCase(user.getEmail())) {
                User duplicate = userRepository.findByEmailIgnoreCase(user.getEmail());

                if (duplicate != null && !duplicate.getId().equals(existing.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
                }

                existing.setEmail(user.getEmail());
                existing.setEmailVerified(false);

                String verificationToken = UUID.randomUUID().toString();
                existing.setVerificationToken(verificationToken);
                existing.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

                mailService.sendVerificationEmail(existing.getEmail(), existing.getName(), verificationToken);
            }
        }

        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            existing.setRoles(user.getRoles());
        }

        User saved = userRepository.save(existing);
        auditLogService.log(saved.getEmail(), "USER_UPDATED_BY_ADMIN", "USER", saved.getId(), "User updated by admin", request);

        return saved;
    }

    public void deleteUser(Long id, String actorEmail, HttpServletRequest request) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userRepository.delete(existing);
        auditLogService.log(actorEmail, "USER_DELETED_BY_ADMIN", "USER", id, "User deleted by admin", request);
    }

    public String login(String email, String password, HttpServletRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            auditLogService.log(email, "LOGIN_FAILED", "USER", null, "User not found", request);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            auditLogService.log(email, "LOGIN_FAILED", "USER", user.getId(), "Invalid credentials", request);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email before login");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        auditLogService.log(email, "LOGIN_SUCCESS", "USER", user.getId(), "Login successful", request);

        return jwtUtil.generateToken(user.getEmail());
    }

    public User getProfile(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return user;
    }

    public User updateProfile(String email, UpdateProfileRequest req, HttpServletRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            if (!user.getEmail().equalsIgnoreCase(req.getEmail())) {
                User existing = userRepository.findByEmailIgnoreCase(req.getEmail());

                if (existing != null && !existing.getId().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
                }

                user.setEmail(req.getEmail());
                user.setEmailVerified(false);

                String verificationToken = UUID.randomUUID().toString();
                user.setVerificationToken(verificationToken);
                user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

                mailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationToken);
            }
        }

        User saved = userRepository.save(user);
        auditLogService.log(saved.getEmail(), "PROFILE_UPDATED", "USER", saved.getId(), "Profile updated", request);

        return saved;
    }

    public String changePassword(String email, String oldPassword, String newPassword, HttpServletRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (oldPassword == null || oldPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is required");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from old password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditLogService.log(email, "PASSWORD_CHANGED", "USER", user.getId(), "Password changed", request);

        return "Password changed successfully";
    }

    public User uploadProfilePicture(String email, MultipartFile file, HttpServletRequest request) throws IOException {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";

        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + extension;

        Path uploadPath = Paths.get(System.getProperty("user.dir"), uploadDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(fileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        user.setProfileImage("/uploads/" + fileName);
        User saved = userRepository.save(user);

        auditLogService.log(email, "PROFILE_IMAGE_UPLOADED", "USER", saved.getId(), "Profile image uploaded", request);

        return saved;
    }

    public String forgotPassword(String email, HttpServletRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            return "If the email exists, a reset link has been sent";
        }

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        mailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        auditLogService.log(email, "PASSWORD_RESET_REQUESTED", "USER", user.getId(), "Password reset requested", request);

        return "If the email exists, a reset link has been sent";
    }

    public String resetPassword(String token, String newPassword, HttpServletRequest request) {
        User user = userRepository.findByResetToken(token);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token");
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        auditLogService.log(user.getEmail(), "PASSWORD_RESET_COMPLETED", "USER", user.getId(), "Password reset completed", request);

        return "Password reset successful";
    }

    public String verifyEmail(String token, HttpServletRequest request) {
        User user = userRepository.findByVerificationToken(token);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token");
        }

        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        auditLogService.log(user.getEmail(), "EMAIL_VERIFIED", "USER", user.getId(), "Email verified", request);

        return "Email verified successfully";
    }

    public void deleteOwnAccount(String email, HttpServletRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        userRepository.delete(user);
        auditLogService.log(email, "ACCOUNT_DELETED", "USER", user.getId(), "Own account deleted", request);
    }
}