package in.ashokit.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import in.ashokit.entity.Task;
import in.ashokit.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping("/project/{projectId}")
    public Task createTask(@PathVariable Long projectId,
                           @RequestBody Task task,
                           Authentication authentication,
                           HttpServletRequest request) {
        return taskService.createTask(task, projectId, authentication.getName(), request);
    }

    @GetMapping
    public List<Task> getAllTasks(Authentication authentication) {
        return taskService.getAllTasks(authentication.getName());
    }

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Long projectId,
                                        Authentication authentication) {
        return taskService.getTasksByProject(projectId, authentication.getName());
    }

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id, Authentication authentication) {
        return taskService.getTaskById(id, authentication.getName());
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id,
                           @RequestBody Task task,
                           Authentication authentication,
                           HttpServletRequest request) {
        return taskService.updateTask(id, task, authentication.getName(), request);
    }

    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id,
                             Authentication authentication,
                             HttpServletRequest request) {
        taskService.deleteTask(id, authentication.getName(), request);
        return "Task deleted successfully";
    }
}