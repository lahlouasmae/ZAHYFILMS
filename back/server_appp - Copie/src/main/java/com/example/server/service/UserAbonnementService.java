package com.example.server.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class UserAbonnementService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String authServiceUrl;

    public Map<String, Object> getUserAbonnement(Long userId, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                authServiceUrl + "/api/auth/user/" + userId + "/abonnement",
                HttpMethod.GET,
                entity,
                Map.class
        );

        return response.getBody();
    }
}
