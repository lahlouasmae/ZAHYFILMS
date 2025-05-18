package com.example.recom.controller;

import com.example.recom.dto.RecommendationResponseDTO;
import com.example.recom.entity.CommentSentiment;
import com.example.recom.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/api/recommendations/favorites")
    public List<RecommendationResponseDTO> getRecommendationsFav(@RequestHeader("Authorization") String token) {
        return recommendationService.getRecommendationsFav(token);
    }

    @GetMapping("/api/recommendations/history")
    public List<RecommendationResponseDTO> getRecommendations(@RequestHeader("Authorization") String token) {
        return recommendationService.getRecommendations(token);
    }

    @PostMapping("/analyze-comment")
    public ResponseEntity<CommentSentiment> analyzeComment(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {

        String commentId = request.get("commentId");
        String videoId = request.get("videoId");
        String content = request.get("content");

        CommentSentiment result = recommendationService.analyzeComment(token, commentId, videoId, content);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/recommendations")
    public ResponseEntity<List<RecommendationResponseDTO>> getRecommendationsBasedOnComments(
            @RequestHeader("Authorization") String token) {

        List<RecommendationResponseDTO> recommendations =
                recommendationService.getRecommendationsBasedOnComments(token);

        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/api/recommendations/combined")
    public ResponseEntity<List<RecommendationResponseDTO>> getCombinedRecommendations(
            @RequestHeader("Authorization") String token) {

        List<RecommendationResponseDTO> recommendations =
                recommendationService.getCombinedRecommendations(token);

        return ResponseEntity.ok(recommendations);
    }
}