package in.ashokit.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import in.ashokit.entity.Project;
import in.ashokit.entity.User;
import in.ashokit.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public Project createProject(@RequestBody Project project,
                                 Authentication authentication,
                                 HttpServletRequest request) {
        return projectService.createProject(project, authentication.getName(), request);
    }

    @GetMapping
    public List<Project> getAllProjects(Authentication authentication) {
        return projectService.getAllProjects(authentication.getName());
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id, Authentication authentication) {
        return projectService.getProjectById(id, authentication.getName());
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id,
                                 @RequestBody Project project,
                                 Authentication authentication,
                                 HttpServletRequest request) {
        return projectService.updateProject(id, project, authentication.getName(), request);
    }

    @DeleteMapping("/{id}")
    public String deleteProject(@PathVariable Long id,
                                Authentication authentication,
                                HttpServletRequest request) {
        projectService.deleteProject(id, authentication.getName(), request);
        return "Project deleted successfully";
    }

    @GetMapping("/{id}/members")
    public List<User> getProjectMembers(@PathVariable Long id, Authentication authentication) {
        return projectService.getProjectMembers(id, authentication.getName());
    }
}