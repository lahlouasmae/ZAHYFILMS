package com.example.recom.client;

import com.example.recom.dto.SentimentAnalysisRequestDTO;
import com.example.recom.dto.SentimentAnalysisResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "sentiment-service", url = "http://localhost:5000/")
public interface SentimentAnalysisClient {
    @PostMapping("/analyze")
    SentimentAnalysisResponseDTO analyzeSentiment(@RequestBody SentimentAnalysisRequestDTO request);
}