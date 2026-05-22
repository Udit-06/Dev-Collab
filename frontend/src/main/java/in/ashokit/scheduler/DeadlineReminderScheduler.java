package in.ashokit.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import in.ashokit.entity.NotificationType;
import in.ashokit.entity.Task;
import in.ashokit.repository.TaskRepository;
import in.ashokit.service.NotificationService;

@Component
public class DeadlineReminderScheduler {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public DeadlineReminderScheduler(TaskRepository taskRepository,
                                     NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 9 * * *")
    public void sendDueTomorrowNotifications() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Task> tasks = taskRepository.findByDueDateAndDeletedFalse(tomorrow);

        for (Task task : tasks) {
            if (task.getAssignedUser() != null) {
                notificationService.createNotification(
                        task.getAssignedUser().getId(),
                        NotificationType.DEADLINE_APPROACHING,
                        "Deadline tomorrow for task: " + task.getTitle(),
                        task.getProject() != null ? task.getProject().getId() : null,
                        task.getId()
                );
            }
        }
    }
}