package in.ashokit.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import in.ashokit.dto.CalendarEventDto;
import in.ashokit.service.CalendarService;

@RestController
@RequestMapping("/calendar")
@CrossOrigin(origins = "http://localhost:3000")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/events")
    public List<CalendarEventDto> getEvents(Authentication authentication) {
        return calendarService.getCalendarEvents(authentication.getName());
    }
}