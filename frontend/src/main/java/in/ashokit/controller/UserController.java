package in.ashokit.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import in.ashokit.dto.ChangePassword;
import in.ashokit.dto.ForgotPasswordRequest;
import in.ashokit.dto.LoginRequest;
import in.ashokit.dto.ResetPasswordRequest;
import in.ashokit.dto.UpdateProfileRequest;
import in.ashokit.entity.User;
import in.ashokit.service.UserService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user, HttpServletRequest request) {
        return Map.of("message", userService.register(user, request));
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest requestBody, HttpServletRequest request) {
        String token = userService.login(
                requestBody.getEmail(),
                requestBody.getPassword(),
                request
        );

        return Map.of("token", token);
    }

    @GetMapping("/verify-email")
    public String verifyEmail(@RequestParam String token, HttpServletRequest request) {
        return userService.verifyEmail(token, request);
    }

    @GetMapping("/profile")
    public User getProfile(Authentication authentication) {
        return userService.getProfile(authentication.getName());
    }

    @PutMapping("/profile")
    public User updateProfile(Authentication authentication,
                              @RequestBody UpdateProfileRequest req,
                              HttpServletRequest request) {
        return userService.updateProfile(authentication.getName(), req, request);
    }

    @PostMapping(value = "/profile/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public User uploadProfilePicture(Authentication authentication,
                                     @RequestParam("file") MultipartFile file,
                                     HttpServletRequest request) throws Exception {
        return userService.uploadProfilePicture(authentication.getName(), file, request);
    }

    @PostMapping("/change-password")
    public String changePassword(Authentication authentication,
                                 @RequestBody ChangePassword req,
                                 HttpServletRequest request) {
        return userService.changePassword(
                authentication.getName(),
                req.getOldPassword(),
                req.getNewPassword(),
                request
        );
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest req, HttpServletRequest request) {
        return userService.forgotPassword(req.getEmail(), request);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest req, HttpServletRequest request) {
        return userService.resetPassword(req.getToken(), req.getNewPassword(), request);
    }

    @DeleteMapping("/delete-account")
    public String deleteOwnAccount(Authentication authentication, HttpServletRequest request) {
        userService.deleteOwnAccount(authentication.getName(), request);
        return "Account deleted successfully";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id,
                           @RequestBody User user,
                           HttpServletRequest request) {
        return userService.updateUser(id, user, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id,
                             Authentication authentication,
                             HttpServletRequest request) {
        userService.deleteUser(id, authentication.getName(), request);
        return "User deleted successfully";
    }
}