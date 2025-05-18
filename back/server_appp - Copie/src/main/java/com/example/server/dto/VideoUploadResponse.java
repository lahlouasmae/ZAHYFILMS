package com.example.server.dto;

public class VideoUploadResponse {
    private String id;
    private String url;
    private String message;

    public VideoUploadResponse(String id, String url, String message) {
        this.id = id;
        this.url = url;
        this.message = message;
    }

    // Getters
    public String getId() { return id; }
    public String getUrl() { return url; }
    public String getMessage() { return message; }
}

