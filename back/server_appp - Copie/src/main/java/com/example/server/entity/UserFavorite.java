// 1. Modèle pour les favoris
package com.example.server.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_favorites")
public class UserFavorite {
    @Id
    private String id;
    private Long userId;
    private String videoId;
    private LocalDateTime dateAdded;

    // Constructeurs
    public UserFavorite() {
    }

    public UserFavorite(Long userId, String videoId) {
        this.userId = userId;
        this.videoId = videoId;
        this.dateAdded = LocalDateTime.now();
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }
}