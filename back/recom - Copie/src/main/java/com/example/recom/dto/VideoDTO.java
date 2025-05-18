package com.example.recom.dto;

import java.time.LocalDateTime;
import java.util.List;

public class VideoDTO {
    private String id;
    private String title;
    private String description;
    private String url;
    private String thumbnailUrl;
    private List<String> genre;
    private double duration;
    private LocalDateTime uploadDate;

    public String getNiveauAbonnementRequis() {
        return niveauAbonnementRequis;
    }

    public void setNiveauAbonnementRequis(String niveauAbonnementRequis) {
        this.niveauAbonnementRequis = niveauAbonnementRequis;
    }

    private String niveauAbonnementRequis;
    // Getters & Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public List<String> getGenre() {
        return genre;
    }

    public void setGenre(List<String> genre) {
        this.genre = genre;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
}
