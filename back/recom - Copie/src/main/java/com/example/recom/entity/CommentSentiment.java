package com.example.recom.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "comment_sentiments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentSentiment {
    @Id
    private String id;
    private String userId;
    private String videoId;
    private String commentId;
    private String sentiment;  // "positive", "negative", "neutral"
    private double polarity;
    private LocalDateTime createdAt;
    private List<String> videoGenre; // Changé de String à List<String>
}