package org.example.servicenotification.proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "service-commentaire",url = "http://localhost:8085")
public interface CommentServiceClient {
    @GetMapping("/comments/video/{videoId}/users")
    List<String> getUserIdsWhoCommented(@PathVariable String videoId);
}


