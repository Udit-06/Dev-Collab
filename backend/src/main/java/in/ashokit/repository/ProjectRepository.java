package in.ashokit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import in.ashokit.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("""
        select distinct p
        from Project p
        join p.team t
        left join t.memberIds m
        where t.ownerId = :userId or m = :userId
    """)
    List<Project> findAccessibleProjects(@Param("userId") Long userId);

    @Query("""
        select distinct p
        from Project p
        join p.team t
        left join t.memberIds m
        where p.id = :id and (t.ownerId = :userId or m = :userId)
    """)
    Optional<Project> findAccessibleProjectById(@Param("id") Long id,
                                                @Param("userId") Long userId);
}