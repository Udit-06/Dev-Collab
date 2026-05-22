package in.ashokit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import in.ashokit.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    @Query("""
        select distinct t
        from Team t
        left join t.memberIds m
        where t.ownerId = :userId or m = :userId
    """)
    List<Team> findMyTeams(@Param("userId") Long userId);
}