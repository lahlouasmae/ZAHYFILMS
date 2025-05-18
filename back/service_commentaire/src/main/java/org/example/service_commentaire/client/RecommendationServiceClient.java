package org.example.service_commentaire.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "recommendation-service", url = "http://localhost:8082/")
public interface RecommendationServiceClient {
    @PostMapping("/analyze-comment")
    Map<String, Object> analyzeComment(@RequestBody Map<String, String> commentData,
                                       @RequestHeader("Authorization") String token);
}