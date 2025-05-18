package org.example.service_commentaire.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    private ObjectId commentId;
    private String videoId;
    private String userId;
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();
    private Set<String> likes = new HashSet<>();
    private Set<String> dislikes = new HashSet<>();
    private ObjectId parentCommentId;//pour faire une sous commentaire du coment parent
    private int depth = 0; // 0 = commentaire principal(pour faire architecture a 1 niveau)

}
