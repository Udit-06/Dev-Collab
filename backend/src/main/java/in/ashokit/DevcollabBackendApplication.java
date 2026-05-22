package in.ashokit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"in.ashokit", "com.devcollab"})
@EnableScheduling
public class DevcollabBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DevcollabBackendApplication.class, args);
	}

}
