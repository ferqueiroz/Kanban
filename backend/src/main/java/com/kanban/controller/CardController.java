package com.kanban.controller;

import com.kanban.dto.CardDto;
import com.kanban.security.UserPrincipal;
import com.kanban.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @GetMapping("/{id}")
    public ResponseEntity<CardDto.Response> getCard(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(cardService.getCard(principal.getId(), id));
    }

    @PostMapping
    public ResponseEntity<CardDto.Response> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CardDto.CreateRequest request) {
        return ResponseEntity.ok(cardService.createCard(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardDto.Response> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CardDto.UpdateRequest request) {
        return ResponseEntity.ok(cardService.updateCard(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/move")
    public ResponseEntity<CardDto.Response> move(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CardDto.MoveRequest request) {
        return ResponseEntity.ok(cardService.moveCard(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        cardService.deleteCard(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
