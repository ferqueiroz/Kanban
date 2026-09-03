package com.kanban.service;

import com.kanban.dto.CardDto;
import com.kanban.dto.GroupDto;
import com.kanban.entity.Card;
import com.kanban.entity.Group;
import com.kanban.entity.User;
import com.kanban.repository.GroupRepository;
import com.kanban.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<GroupDto.Response> getAllGroups(Long userId) {
        List<Group> groups = groupRepository.findByUserIdWithCards(userId);
        return groups.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public GroupDto.SimpleResponse createGroup(Long userId, GroupDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Group> existing = groupRepository.findByUserIdOrderByPositionOrderAsc(userId);
        int nextOrder = existing.size();

        Group group = Group.builder()
                .name(request.getName())
                .color(request.getColor() != null ? request.getColor() : "#60A5FA")
                .positionOrder(nextOrder)
                .user(user)
                .build();

        group = groupRepository.save(group);
        return toSimpleResponse(group);
    }

    @Transactional
    public GroupDto.SimpleResponse updateGroup(Long userId, Long groupId, GroupDto.UpdateRequest request) {
        Group group = groupRepository.findByIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        group.setName(request.getName());
        if (request.getColor() != null) {
            group.setColor(request.getColor());
        }

        group = groupRepository.save(group);
        return toSimpleResponse(group);
    }

    @Transactional
    public void deleteGroup(Long userId, Long groupId) {
        Group group = groupRepository.findByIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        groupRepository.delete(group);
    }

    private GroupDto.Response toResponse(Group group) {
        GroupDto.Response response = new GroupDto.Response();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setColor(group.getColor());
        response.setPositionOrder(group.getPositionOrder());
        response.setCreatedAt(group.getCreatedAt());

        Map<String, List<CardDto.Response>> columns = new LinkedHashMap<>();
        columns.put("TODO", new ArrayList<>());
        columns.put("IN_PROGRESS", new ArrayList<>());
        columns.put("DONE", new ArrayList<>());

        if (group.getCards() != null) {
            for (Card card : group.getCards()) {
                CardDto.Response cardResponse = toCardResponse(card);
                String statusKey = card.getStatus().name();
                columns.get(statusKey).add(cardResponse);
            }
        }

        response.setColumns(columns);
        return response;
    }

    private GroupDto.SimpleResponse toSimpleResponse(Group group) {
        GroupDto.SimpleResponse response = new GroupDto.SimpleResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setColor(group.getColor());
        response.setPositionOrder(group.getPositionOrder());
        response.setCreatedAt(group.getCreatedAt());
        return response;
    }

    private CardDto.Response toCardResponse(Card card) {
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
