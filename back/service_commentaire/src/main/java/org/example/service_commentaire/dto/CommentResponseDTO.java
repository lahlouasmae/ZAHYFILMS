package org.example.service_commentaire.dto;


import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class CommentResponseDTO {
    private String commentId;
    private String videoId;
    private String userId;
    private String content;
    private LocalDateTime createdAt;
    private Set<String> likes;
    private Set<String> dislikes;
    private String parentCommentId;
}

