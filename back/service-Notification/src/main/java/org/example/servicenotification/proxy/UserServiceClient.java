package org.example.servicenotification.proxy;

import org.example.servicenotification.config.FeignTokenInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "user-service",url = "http://localhost:8083",contextId = "userServiceClient",configuration = FeignTokenInterceptor.class)
public interface UserServiceClient {
    @PostMapping("/api/profile/emails/by-usernames")
    ResponseEntity<List<String>>getEmailsByUsernames(@RequestBody List<String> usernames);

}

