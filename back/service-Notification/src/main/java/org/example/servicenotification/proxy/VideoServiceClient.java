package org.example.servicenotification.proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "video-service",url = "http://localhost:8089",contextId = "videoServiceClient")
public interface VideoServiceClient {
    @GetMapping("/api/videos/{videoId}/title")
    String getVideoTitle(@PathVariable String videoId);
}

