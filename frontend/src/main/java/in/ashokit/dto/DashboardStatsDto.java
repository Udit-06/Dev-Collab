package in.ashokit.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long activeTeams;
    private Map<String, Long> taskStatusData;
    private Map<String, Long> productivityByMember;
    private List<Map<String, Object>> projectProgress;

    public DashboardStatsDto(long totalProjects,
                             long totalTasks,
                             long completedTasks,
                             long activeTeams,
                             Map<String, Long> taskStatusData,
                             Map<String, Long> productivityByMember,
                             List<Map<String, Object>> projectProgress) {
        this.totalProjects = totalProjects;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.activeTeams = activeTeams;
        this.taskStatusData = taskStatusData;
        this.productivityByMember = productivityByMember;
        this.projectProgress = projectProgress;
    }

    public long getTotalProjects() { return totalProjects; }
    public long getTotalTasks() { return totalTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public long getActiveTeams() { return activeTeams; }
    public Map<String, Long> getTaskStatusData() { return taskStatusData; }
    public Map<String, Long> getProductivityByMember() { return productivityByMember; }
    public List<Map<String, Object>> getProjectProgress() { return projectProgress; }
}