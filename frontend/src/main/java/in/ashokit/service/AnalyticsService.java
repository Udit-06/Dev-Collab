package in.ashokit.service;

import java.util.*;

import org.springframework.stereotype.Service;

import in.ashokit.dto.DashboardStatsDto;
import in.ashokit.entity.Project;
import in.ashokit.entity.Task;
import in.ashokit.entity.Team;
import in.ashokit.entity.User;
import in.ashokit.repository.ProjectRepository;
import in.ashokit.repository.TaskRepository;
import in.ashokit.repository.TeamRepository;
import in.ashokit.repository.UserRepository;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;

    public AnalyticsService(UserRepository userRepository,
                            ProjectRepository projectRepository,
                            TaskRepository taskRepository,
                            TeamRepository teamRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.teamRepository = teamRepository;
    }

    public DashboardStatsDto getDashboardStats(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        List<Project> projects = projectRepository.findAccessibleProjects(user.getId());
        List<Team> teams = teamRepository.findMyTeams(user.getId());

        long totalProjects = projects.size();
        long totalTasks = 0;
        long completedTasks = 0;

        Map<String, Long> taskStatusData = new LinkedHashMap<>();
        taskStatusData.put("Pending", 0L);
        taskStatusData.put("In Progress", 0L);
        taskStatusData.put("Completed", 0L);

        Map<String, Long> productivityByMember = new LinkedHashMap<>();
        List<Map<String, Object>> projectProgress = new ArrayList<>();

        for (Project project : projects) {
            List<Task> tasks = taskRepository.findAccessibleTasksByProjectId(project.getId(), user.getId());

            totalTasks += tasks.size();

            long pending = tasks.stream()
                    .filter(t -> t.getStatus() == null || "Pending".equalsIgnoreCase(t.getStatus()))
                    .count();

            long progress = tasks.stream()
                    .filter(t -> "In Progress".equalsIgnoreCase(t.getStatus()))
                    .count();

            long completed = tasks.stream()
                    .filter(t -> "Completed".equalsIgnoreCase(t.getStatus()))
                    .count();

            completedTasks += completed;

            taskStatusData.put("Pending", taskStatusData.get("Pending") + pending);
            taskStatusData.put("In Progress", taskStatusData.get("In Progress") + progress);
            taskStatusData.put("Completed", taskStatusData.get("Completed") + completed);

            Map<String, Object> projectMap = new HashMap<>();
            projectMap.put("projectName", project.getTitle());
            projectMap.put("totalTasks", tasks.size());
            projectMap.put("completedTasks", completed);
            projectMap.put("progressPercent", tasks.isEmpty() ? 0 : (completed * 100 / tasks.size()));
            projectProgress.add(projectMap);

            for (Task task : tasks) {
                if (task.getAssignedUser() != null && "Completed".equalsIgnoreCase(task.getStatus())) {
                    String memberName = task.getAssignedUser().getName();
                    productivityByMember.put(
                            memberName,
                            productivityByMember.getOrDefault(memberName, 0L) + 1
                    );
                }
            }
        }

        return new DashboardStatsDto(
                totalProjects,
                totalTasks,
                completedTasks,
                teams.size(),
                taskStatusData,
                productivityByMember,
                projectProgress
        );
    }
}