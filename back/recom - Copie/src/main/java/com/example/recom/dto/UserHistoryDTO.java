package com.example.recom.dto;


import java.time.LocalDateTime;

public class UserHistoryDTO {
    private String videoId;
    private LocalDateTime watchedAt;

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public LocalDateTime getWatchedAt() {
        return watchedAt;
    }

    public void setWatchedAt(LocalDateTime watchedAt) {
        this.watchedAt = watchedAt;
    }
// Getters & Setters
}

