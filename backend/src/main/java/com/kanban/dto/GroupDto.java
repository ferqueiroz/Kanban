package com.kanban.dto;

import com.kanban.entity.Card;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class GroupDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(max = 100)
        private String name;
        private String color;
    }

    @Data
    public static class UpdateRequest {
        @NotBlank
        @Size(max = 100)
        private String name;
        private String color;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String color;
        private Integer positionOrder;
        private LocalDateTime createdAt;
        private Map<String, List<CardDto.Response>> columns;
    }

    @Data
    public static class SimpleResponse {
        private Long id;
        private String name;
        private String color;
        private Integer positionOrder;
        private LocalDateTime createdAt;
    }
}
