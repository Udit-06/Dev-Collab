package in.ashokit.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import in.ashokit.entity.Project;
import in.ashokit.entity.Team;
import in.ashokit.entity.User;
import in.ashokit.repository.ProjectRepository;
import in.ashokit.repository.TeamRepository;
import in.ashokit.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private AuditLogService auditLogService;

    @CacheEvict(value = {"projects", "projectMembers"}, allEntries = true)
    public Project createProject(Project project, String email, HttpServletRequest request) {
        User user = getUserByEmail(email);

        if (project.getTeam() == null || project.getTeam().getTeamId() == null) {
            throw new RuntimeException("Team is required");
        }

        Team team = teamRepository.findById(project.getTeam().getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Long userId = user.getId();
        boolean hasAccess = userId.equals(team.getOwnerId())
                || (team.getMemberIds() != null && team.getMemberIds().contains(userId));

        if (!hasAccess) {
            throw new RuntimeException("You are not allowed to create a project in this team");
        }

        project.setUser(user);
        project.setTeam(team);

        Project saved = projectRepository.save(project);

        auditLogService.log(email, "PROJECT_CREATED", "PROJECT", saved.getId(),
                "Project created: " + saved.getTitle(), request);

        return saved;
    }

    @Cacheable(value = "projects", key = "#email")
    public List<Project> getAllProjects(String email) {
        User user = getUserByEmail(email);
        return projectRepository.findAccessibleProjects(user.getId());
    }

    public Project getProjectById(Long id, String email) {
        User user = getUserByEmail(email);

        return projectRepository.findAccessibleProjectById(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @CacheEvict(value = {"projects", "projectMembers"}, allEntries = true)
    public Project updateProject(Long id, Project project, String email, HttpServletRequest request) {
        User user = getUserByEmail(email);

        Project existing = projectRepository.findAccessibleProjectById(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        existing.setTitle(project.getTitle());
        existing.setDescription(project.getDescription());
        existing.setStatus(project.getStatus());
        existing.setDeadline(project.getDeadline());

        Project saved = projectRepository.save(existing);

        auditLogService.log(email, "PROJECT_UPDATED", "PROJECT", saved.getId(),
                "Project updated: " + saved.getTitle(), request);

        return saved;
    }

    @CacheEvict(value = {"projects", "projectMembers", "tasksByProject"}, allEntries = true)
    public void deleteProject(Long id, String email, HttpServletRequest request) {
        User user = getUserByEmail(email);

        Project existing = projectRepository.findAccessibleProjectById(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        projectRepository.delete(existing);

        auditLogService.log(email, "PROJECT_DELETED", "PROJECT", id,
                "Project deleted: " + existing.getTitle(), request);
    }

    @Cacheable(value = "projectMembers", key = "#projectId + ':' + #email")
    public List<User> getProjectMembers(Long projectId, String email) {
        User currentUser = getUserByEmail(email);

        Project project = projectRepository.findAccessibleProjectById(projectId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        Set<Long> uniqueUserIds = new LinkedHashSet<>();
        if (team.getOwnerId() != null) {
            uniqueUserIds.add(team.getOwnerId());
        }
        if (team.getMemberIds() != null) {
            uniqueUserIds.addAll(team.getMemberIds());
        }

        if (uniqueUserIds.isEmpty()) {
            return List.of();
        }

        return new ArrayList<>(userRepository.findAllById(uniqueUserIds));
    }

    private User getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }
}