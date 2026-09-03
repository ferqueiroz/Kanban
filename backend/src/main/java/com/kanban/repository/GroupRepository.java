package com.kanban.repository;

import com.kanban.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT g FROM Group g LEFT JOIN FETCH g.cards WHERE g.user.id = :userId ORDER BY g.positionOrder ASC")
    List<Group> findByUserIdWithCards(Long userId);

    List<Group> findByUserIdOrderByPositionOrderAsc(Long userId);

    Optional<Group> findByIdAndUserId(Long id, Long userId);
}
