package in.ashokit.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import in.ashokit.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
        select distinct task
        from Task task
        join task.project p
        join p.team t
        left join t.memberIds m
        where task.deleted = false
          and (t.ownerId = :userId or m = :userId)
    """)
    List<Task> findAccessibleTasks(@Param("userId") Long userId);

    @Query("""
        select distinct task
        from Task task
        join task.project p
        join p.team t
        left join t.memberIds m
        where task.deleted = false
          and p.id = :projectId
          and (t.ownerId = :userId or m = :userId)
    """)
    List<Task> findAccessibleTasksByProjectId(@Param("projectId") Long projectId,
                                              @Param("userId") Long userId);

    @Query("""
        select distinct task
        from Task task
        join task.project p
        join p.team t
        left join t.memberIds m
        where task.deleted = false
          and task.id = :id
          and (t.ownerId = :userId or m = :userId)
    """)
    Optional<Task> findAccessibleTaskById(@Param("id") Long id,
                                          @Param("userId") Long userId);

    List<Task> findByProjectIdAndDeletedFalse(Long projectId);

    List<Task> findByDueDateAndDeletedFalse(LocalDate dueDate);
}