package com.example.server.dto;
import java.time.LocalDateTime;
import java.util.List;

public class VideoDTO {
    private String id;
    private String title;
    private String description;
    private String url;
    private String thumbnailUrl;
    private long size;
    private LocalDateTime uploadDate;
    private String niveauAbonnementRequis;
    private List<String> genre; // Nouvel attribut genre
    private double duration;
    private boolean isFavorite;
    private double progress;
    private boolean completed;
    private LocalDateTime lastViewed;

    public VideoDTO() {
    }

    // Constructeur avec genre
    public VideoDTO(String id, String title, String description, String url, String thumbnailUrl,
                    long size, LocalDateTime uploadDate, String niveauAbonnementRequis,
                    List<String> genre, double duration) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.size = size;
        this.uploadDate = uploadDate;
        this.niveauAbonnementRequis = niveauAbonnementRequis;
        this.genre = genre;
        this.duration = duration;
        this.isFavorite = false;
        this.progress = 0;
        this.completed = false;
    }

    // Constructeur existant maintenu pour compatibilité
    public VideoDTO(String id, String title, String description, String url, String thumbnailUrl,
                    long size, LocalDateTime uploadDate, String niveauAbonnementRequis, double duration) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.size = size;
        this.uploadDate = uploadDate;
        this.niveauAbonnementRequis = niveauAbonnementRequis;
        this.duration = duration;
        this.isFavorite = false;
        this.progress = 0;
        this.completed = false;
    }

    // Ancien constructeur maintenu pour compatibilité
    public VideoDTO(String id, String title, String description, String url, String thumbnailUrl,
                    long size, LocalDateTime uploadDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.size = size;
        this.uploadDate = uploadDate;
        this.isFavorite = false;
        this.progress = 0;
        this.completed = false;
    }

    public List<String> getGenre() {
        return genre;
    }

    public void setGenre(List<String> genre) {
        this.genre = genre;
    }

    // Getters et Setters existants
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

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getNiveauAbonnementRequis() {
        return niveauAbonnementRequis;
    }

    public void setNiveauAbonnementRequis(String niveauAbonnementRequis) {
        this.niveauAbonnementRequis = niveauAbonnementRequis;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public boolean isIsFavorite() {
        return isFavorite;
    }

    public void setIsFavorite(boolean isFavorite) {
        this.isFavorite = isFavorite;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getLastViewed() {
        return lastViewed;
    }

    public void setLastViewed(LocalDateTime lastViewed) {
        this.lastViewed = lastViewed;
    }
}