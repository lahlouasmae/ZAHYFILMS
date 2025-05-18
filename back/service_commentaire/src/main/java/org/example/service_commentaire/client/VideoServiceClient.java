package org.example.service_commentaire.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

// Déclare un client Feign pour l'API du service vidéo
@FeignClient(name = "video-service",url = "http://localhost:8089/api/videos")
public interface VideoServiceClient {

    // Déclare une méthode pour vérifier si une vidéo existe
    @GetMapping("/{id}/exists")
    boolean videoExists(@PathVariable("id") String videoId,@RequestHeader("Authorization") String token);
}

