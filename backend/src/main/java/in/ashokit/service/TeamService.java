package in.ashokit.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.ashokit.entity.NotificationType;
import in.ashokit.entity.Team;
import in.ashokit.entity.User;
import in.ashokit.repository.TeamRepository;
import in.ashokit.repository.UserRepository;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Team createTeam(Team team, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);

        team.setOwnerId(owner.getId());

        if (team.getMemberIds() == null) {
            team.setMemberIds(new ArrayList<>());
        }

        if (!team.getMemberIds().contains(owner.getId())) {
            team.getMemberIds().add(owner.getId());
        }

        return teamRepository.save(team);
    }

    public List<Team> getMyTeams(String email) {
        User user = getUserByEmail(email);
        return teamRepository.findMyTeams(user.getId());
    }

    public Team getTeamForUser(Long id, String email) {
        Team team = getTeam(id);
        User user = getUserByEmail(email);

        Long userId = user.getId();

        boolean isOwner = userId.equals(team.getOwnerId());
        boolean isMember = team.getMemberIds() != null && team.getMemberIds().contains(userId);

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }

        return team;
    }

    public Team inviteMember(Long teamId, String invitedEmail, String inviterEmail) {
        Team team = getTeam(teamId);

        User inviter = getUserByEmail(inviterEmail);
        User invitedUser = getUserByEmail(invitedEmail);

        if (!inviter.getId().equals(team.getOwnerId())) {
            throw new RuntimeException("Only owner can invite members");
        }

        if (team.getMemberIds() == null) {
            team.setMemberIds(new ArrayList<>());
        }

        boolean newlyAdded = false;
        if (!team.getMemberIds().contains(invitedUser.getId())) {
            team.getMemberIds().add(invitedUser.getId());
            newlyAdded = true;
        }

        Team saved = teamRepository.save(team);

        if (newlyAdded) {
            notificationService.createNotification(
                    invitedUser.getId(),
                    NotificationType.PROJECT_INVITE,
                    inviter.getName() + " invited you to team: " + team.getTeamName(),
                    null,
                    null
            );
        }

        return saved;
    }

    public Team addMember(Long teamId, Long userId, String requesterEmail) {
        Team team = getTeam(teamId);
        User requester = getUserByEmail(requesterEmail);

        if (!requester.getId().equals(team.getOwnerId())) {
            throw new RuntimeException("Only owner can add members");
        }

        if (team.getMemberIds() == null) {
            team.setMemberIds(new ArrayList<>());
        }

        boolean newlyAdded = false;
        if (!team.getMemberIds().contains(userId)) {
            team.getMemberIds().add(userId);
            newlyAdded = true;
        }

        Team saved = teamRepository.save(team);

        if (newlyAdded) {
            User addedUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            notificationService.createNotification(
                    addedUser.getId(),
                    NotificationType.PROJECT_INVITE,
                    requester.getName() + " added you to team: " + team.getTeamName(),
                    null,
                    null
            );
        }

        return saved;
    }

    public void deleteTeam(Long id, String requesterEmail) {
        Team team = getTeam(id);
        User requester = getUserByEmail(requesterEmail);

        if (!requester.getId().equals(team.getOwnerId())) {
            throw new RuntimeException("Only owner can delete team");
        }

        teamRepository.deleteById(id);
    }

    public Team getTeam(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    private User getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }

        return user;
    }
}