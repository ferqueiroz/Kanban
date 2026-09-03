package com.kanban.repository;

import com.kanban.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByGroupIdOrderByPositionOrderAsc(Long groupId);

    @Query("SELECT c FROM Card c WHERE c.group.id = :groupId AND c.group.user.id = :userId")
    List<Card> findByGroupIdAndUserId(Long groupId, Long userId);

    @Query("SELECT c FROM Card c WHERE c.id = :id AND c.group.user.id = :userId")
    Optional<Card> findByIdAndUserId(Long id, Long userId);
}
