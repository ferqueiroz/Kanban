package com.kanban.dto;

import com.kanban.entity.Card;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CardDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(max = 200)
        private String title;

        private String content;

        @NotNull
        private Card.CardStatus status;

        private LocalDate dueDate;

        @NotNull
        private Long groupId;
    }

    @Data
    public static class UpdateRequest {
        @NotBlank
        @Size(max = 200)
        private String title;

        private String content;

        private Card.CardStatus status;

        private LocalDate dueDate;
    }

    @Data
    public static class MoveRequest {
        @NotNull
        private Card.CardStatus status;

        private Long groupId;

        private Integer positionOrder;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private Card.CardStatus status;
        private LocalDate dueDate;
        private Integer positionOrder;
        private Long groupId;
        private String groupName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
