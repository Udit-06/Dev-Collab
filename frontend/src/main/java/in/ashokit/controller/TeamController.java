package in.ashokit.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import in.ashokit.dto.InviteRequest;
import in.ashokit.entity.Team;
import in.ashokit.service.TeamService;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = "http://localhost:3000")
public class TeamController {

    @Autowired
    private TeamService teamService;

    // CREATE TEAM
    @PostMapping
    public Team createTeam(@RequestBody Team team, Authentication authentication) {
        String email = authentication.getName();
        return teamService.createTeam(team, email);
    }

    // GET MY TEAMS
    @GetMapping
    public List<Team> getMyTeams(Authentication authentication) {
        String email = authentication.getName();
        return teamService.getMyTeams(email);
    }

    // GET TEAM BY ID
    @GetMapping("/{id}")
    public Team getTeam(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return teamService.getTeamForUser(id, email);
    }

    // INVITE MEMBER BY EMAIL
    @PostMapping("/{teamId}/invite")
    public Team inviteMember(
            @PathVariable Long teamId,
            @RequestBody InviteRequest request,
            Authentication authentication) {

        String inviterEmail = authentication.getName();
        return teamService.inviteMember(teamId, request.getEmail(), inviterEmail);
    }

    // OPTIONAL: KEEP OLD ADD MEMBER API IF YOU STILL WANT IT
    @PutMapping("/{teamId}/add-member/{userId}")
    public Team addMember(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            Authentication authentication) {

        String email = authentication.getName();
        return teamService.addMember(teamId, userId, email);
    }

    // DELETE TEAM
    @DeleteMapping("/{id}")
    public String deleteTeam(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        teamService.deleteTeam(id, email);
        return "Team deleted successfully";
    }
}