package com.example.server.dto;

public class VideoProgressDTO {
    private Integer watchDuration;
    private Boolean completed;

    public VideoProgressDTO() {
    }

    public VideoProgressDTO(Integer watchDuration, Boolean completed) {
        this.watchDuration = watchDuration;
        this.completed = completed;
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