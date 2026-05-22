package in.ashokit.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import in.ashokit.entity.NotificationType;
import in.ashokit.entity.Project;
import in.ashokit.entity.Task;
import in.ashokit.entity.User;
import in.ashokit.repository.ProjectRepository;
import in.ashokit.repository.TaskRepository;
import in.ashokit.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;


@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @CacheEvict(value = {"tasksByProject", "projects"}, allEntries = true)
    public Task createTask(Task task, Long projectId, String email, HttpServletRequest request) {
        User user = getUserByEmail(email);

        Project project = projectRepository.findAccessibleProjectById(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        task.setUser(user);
        task.setProject(project);
        task.setDeleted(false);

        if (task.getAssignedUser() != null && task.getAssignedUser().getId() != null) {
            User assignedUser = userRepository.findById(task.getAssignedUser().getId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            task.setAssignedUser(assignedUser);
        } else {
            task.setAssignedUser(null);
        }

        Task saved = taskRepository.save(task);

        if (saved.getAssignedUser() != null && !saved.getAssignedUser().getId().equals(user.getId())) {
            notificationService.createNotification(
                    saved.getAssignedUser().getId(),
                    NotificationType.TASK_ASSIGNED,
                    "You were assigned task: " + saved.getTitle(),
                    project.getId(),
                    saved.getId()
            );
        }

        auditLogService.log(email, "TASK_CREATED", "TASK", saved.getId(),
                "Task created: " + saved.getTitle(), request);

        return saved;
    }

    public List<Task> getAllTasks(String email) {
        User user = getUserByEmail(email);
        return taskRepository.findAccessibleTasks(user.getId());
    }

    @Cacheable(value = "tasksByProject", key = "#projectId + ':' + #email")
    public List<Task> getTasksByProject(Long projectId, String email) {
        User user = getUserByEmail(email);

        projectRepository.findAccessibleProjectById(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        return taskRepository.findAccessibleTasksByProjectId(projectId, user.getId());
    }

    public Task getTaskById(Long id, String email) {
        User user = getUserByEmail(email);

        return taskRepository.findAccessibleTaskById(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @CacheEvict(value = {"tasksByProject", "projects"}, allEntries = true)
    public Task updateTask(Long id, Task task, String email, HttpServletRequest request) {
        User user = getUserByEmail(email);

        Task existing = taskRepository.findAccessibleTaskById(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Long oldAssignedUserId = existing.getAssignedUser() != null ? existing.getAssignedUser().getId() : null;

        existing.setTitle(task.getTitle());
        existing.setDescription(task.getDescription());
        existing.setPriority(task.getPriority());
        existing.setStatus(task.getStatus());
        existing.setDueDate(task.getDueDate());

        if (task.getAssignedUser() != null && task.getAssignedUser().getId() != null) {
            User assignedUser = userRepository.findById(task.getAssignedUser().getId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            existing.setAssignedUser(assignedUser);
        } else {
            existing.setAssignedUser(null);
        }

        Task saved = taskRepository.save(existing);

        Long newAssignedUserId = saved.getAssignedUser() != null ? saved.getAssignedUser().getId() : null;

        if (newAssignedUserId != null
                && !newAssignedUserId.equals(user.getId())
                && (oldAssignedUserId == null || !oldAssignedUserId.equals(newAssignedUserId))) {

            notificationService.createNotification(
                    newAssignedUserId,
                    NotificationType.TASK_ASSIGNED,
                    "You were assigned task: " + saved.getTitle(),
                    saved.getProject() != null ? saved.getProject().getId() : null,
                    saved.getId()
            );
        }

        auditLogService.log(email, "TASK_UPDATED", "TASK", saved.getId(),
                "Task updated: " + saved.getTitle(), request);

        return saved;
    }

    @CacheEvict(value = {"tasksByProject", "projects"}, allEntries = true)
    public void deleteTask(Long id, String email, HttpServletRequest request) {
        User user = getUserByEmail(email);

        Task existing = taskRepository.findAccessibleTaskById(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        existing.setDeleted(true);
        existing.setDeletedAt(LocalDateTime.now());
        existing.setDeletedBy(user.getId());

        taskRepository.save(existing);

        auditLogService.log(email, "TASK_DELETED", "TASK", existing.getId(),
                "Task deleted: " + existing.getTitle(), request);
    }

    private User getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }
}