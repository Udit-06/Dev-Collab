package in.ashokit.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import in.ashokit.dto.DashboardStatsDto;
import in.ashokit.service.AnalyticsService;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public DashboardStatsDto getDashboard(Authentication authentication) {
        return analyticsService.getDashboardStats(authentication.getName());
    }
}