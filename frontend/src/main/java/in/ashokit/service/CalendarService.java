package in.ashokit.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import in.ashokit.dto.CalendarEventDto;
import in.ashokit.entity.Project;
import in.ashokit.entity.Task;
import in.ashokit.entity.User;
import in.ashokit.repository.ProjectRepository;
import in.ashokit.repository.TaskRepository;
import in.ashokit.repository.UserRepository;

@Service
public class CalendarService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public CalendarService(TaskRepository taskRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<CalendarEventDto> getCalendarEvents(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);
        List<Project> projects = projectRepository.findAccessibleProjects(user.getId());

        List<CalendarEventDto> events = new ArrayList<>();

        for (Project project : projects) {
            if (project.getDeadline() != null) {
                events.add(new CalendarEventDto(
                        project.getId(),
                        project.getTitle(),
                        project.getDeadline(),
                        "PROJECT_DEADLINE",
                        project.getId()
                ));
            }

            List<Task> tasks = taskRepository.findAccessibleTasksByProjectId(project.getId(), user.getId());
            for (Task task : tasks) {
                if (task.getDueDate() != null) {
                    events.add(new CalendarEventDto(
                            task.getId(),
                            task.getTitle(),
                            task.getDueDate(),
                            "TASK_DEADLINE",
                            project.getId()
                    ));
                }
            }
        }

        return events;
    }
}