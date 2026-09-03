package com.kanban.service;

import com.kanban.dto.CardDto;
import com.kanban.entity.Card;
import com.kanban.entity.Group;
import com.kanban.repository.CardRepository;
import com.kanban.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public CardDto.Response createCard(Long userId, CardDto.CreateRequest request) {
        Group group = groupRepository.findByIdAndUserId(request.getGroupId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        List<Card> existing = cardRepository.findByGroupIdOrderByPositionOrderAsc(group.getId());
        int nextOrder = existing.size();

        Card card = Card.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .positionOrder(nextOrder)
                .group(group)
                .build();

        card = cardRepository.save(card);
        return toResponse(card);
    }

    @Transactional
    public CardDto.Response updateCard(Long userId, Long cardId, CardDto.UpdateRequest request) {
        Card card = cardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));

        card.setTitle(request.getTitle());
        card.setContent(request.getContent());
        if (request.getStatus() != null) card.setStatus(request.getStatus());
        card.setDueDate(request.getDueDate());

        card = cardRepository.save(card);
        return toResponse(card);
    }

    @Transactional
    public CardDto.Response moveCard(Long userId, Long cardId, CardDto.MoveRequest request) {
        Card card = cardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));

        card.setStatus(request.getStatus());
        if (request.getPositionOrder() != null) {
            card.setPositionOrder(request.getPositionOrder());
        }
        if (request.getGroupId() != null && !request.getGroupId().equals(card.getGroup().getId())) {
            Group newGroup = groupRepository.findByIdAndUserId(request.getGroupId(), userId)
                    .orElseThrow(() -> new IllegalArgumentException("Group not found"));
            card.setGroup(newGroup);
        }

        card = cardRepository.save(card);
        return toResponse(card);
    }

    @Transactional
    public void deleteCard(Long userId, Long cardId) {
        Card card = cardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        cardRepository.delete(card);
    }

    @Transactional(readOnly = true)
    public CardDto.Response getCard(Long userId, Long cardId) {
        Card card = cardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        return toResponse(card);
    }

    private CardDto.Response toResponse(Card card) {
        CardDto.Response response = new CardDto.Response();
        response.setId(card.getId());
        response.setTitle(card.getTitle());
        response.setContent(card.getContent());
        response.setStatus(card.getStatus());
        response.setDueDate(card.getDueDate());
        response.setPositionOrder(card.getPositionOrder());
        response.setGroupId(card.getGroup().getId());
        response.setGroupName(card.getGroup().getName());
        response.setCreatedAt(card.getCreatedAt());
        response.setUpdatedAt(card.getUpdatedAt());
        return response;
    }
}
