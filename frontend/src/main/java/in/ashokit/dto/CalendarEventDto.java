package in.ashokit.dto;

import java.time.LocalDate;

public class CalendarEventDto {
    private Long id;
    private String title;
    private LocalDate date;
    private String type;
    private Long projectId;

    public CalendarEventDto(Long id, String title, LocalDate date, String type, Long projectId) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.type = type;
        this.projectId = projectId;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDate getDate() { return date; }
    public String getType() { return type; }
    public Long getProjectId() { return projectId; }
}