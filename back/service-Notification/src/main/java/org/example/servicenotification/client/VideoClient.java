package org.example.servicenotification.client;

import org.example.servicenotification.dto.VideoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "video-service", url = "http://localhost:8089",contextId = "videoClient") // adapte l'URL
public interface VideoClient {
    @GetMapping("/videos/{id}")
    VideoDTO getVideoById(@PathVariable String id);
}

