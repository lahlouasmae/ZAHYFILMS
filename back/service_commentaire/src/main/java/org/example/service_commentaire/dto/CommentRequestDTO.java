package org.example.service_commentaire.dto;



import lombok.Data;
import lombok.Getter;


@Data
public class CommentRequestDTO {
    private String content;
    private String parentCommentId;

}

