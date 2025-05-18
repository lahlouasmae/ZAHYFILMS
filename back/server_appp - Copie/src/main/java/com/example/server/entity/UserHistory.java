package com.example.server.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_history")
public class UserHistory {
    @Id
    private String id;
    private Long userId;
    private String videoId;
    private LocalDateTime dateViewed;
    private Integer watchDuration; // en secondes
    private Boolean completed;

    // Constructeurs
    public UserHistory() {
    }

    public UserHistory(Long userId, String videoId, Integer watchDuration, Boolean completed) {
        this.userId = userId;
        this.videoId = videoId;
        this.dateViewed = LocalDateTime.now();
        this.watchDuration = watchDuration;
        this.completed = completed;
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

    public LocalDateTime getDateViewed() {
        return dateViewed;
    }

    public void setDateViewed(LocalDateTime dateViewed) {
        this.dateViewed = dateViewed;
    }

    public Integer getWatchDuration() {
        return watchDuration;
    }

    public void setWatchDuration(Integer watchDuration) {
        this.watchDuration = watchDuration;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}