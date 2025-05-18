package org.example.servicenotification.client;

import org.example.servicenotification.config.FeignTokenInterceptor;
import org.example.servicenotification.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "user-service", url = "http://localhost:8083",contextId = "userClient",configuration = FeignTokenInterceptor.class) // adapte le port si besoin
public interface UserClient {
    @GetMapping("/api/profile/eligible")
    List<UserDTO> getEligibleUsers(@RequestParam("abonnementType") String type);
}
