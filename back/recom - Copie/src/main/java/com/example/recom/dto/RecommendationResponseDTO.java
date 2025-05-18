package com.example.recom.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponseDTO {
    private String videoId;
    private String title;

    private String description;
    private String thumbnailUrl;
    private List<String> genre; // Modifié de String à List<String>
    private double score;
    private double duration;
    private String niveauAbonnementRequis;
}