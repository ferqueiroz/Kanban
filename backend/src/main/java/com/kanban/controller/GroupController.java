package com.kanban.controller;

import com.kanban.dto.GroupDto;
import com.kanban.security.UserPrincipal;
import com.kanban.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupDto.Response>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(groupService.getAllGroups(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<GroupDto.SimpleResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GroupDto.CreateRequest request) {
        return ResponseEntity.ok(groupService.createGroup(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDto.SimpleResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody GroupDto.UpdateRequest request) {
        return ResponseEntity.ok(groupService.updateGroup(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        groupService.deleteGroup(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
