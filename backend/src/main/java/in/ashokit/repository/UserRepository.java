package in.ashokit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import in.ashokit.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmailIgnoreCase(String email);

    User findByResetToken(String resetToken);

    User findByVerificationToken(String verificationToken);
}