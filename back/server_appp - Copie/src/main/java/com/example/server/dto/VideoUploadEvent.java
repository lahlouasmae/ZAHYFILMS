package com.example.server.dto;

public class VideoUploadEvent {
    private String videoId;
    private String fileName;
    private String url;
    private String contentType;

    public VideoUploadEvent(String videoId, String fileName, String url, String contentType) {
        this.videoId = videoId;
        this.fileName = fileName;
        this.url = url;
        this.contentType = contentType;
    }

    // Getters
    public String getVideoId() { return videoId; }
    public String getFileName() { return fileName; }
    public String getUrl() { return url; }
    public String getContentType() { return contentType; }
}