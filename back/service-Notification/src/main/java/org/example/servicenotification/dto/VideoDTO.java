package org.example.servicenotification.dto;

import lombok.Data;

import java.util.List;

@Data
public class VideoDTO {
    private String title;
    private String description;
    private List<String> genre;
    private String videoUrl;
}
