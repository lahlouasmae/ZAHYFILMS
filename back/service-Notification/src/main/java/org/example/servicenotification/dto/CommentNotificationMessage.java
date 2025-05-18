package org.example.servicenotification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentNotificationMessage implements Serializable {
    private static final long serialVersionUID = 1L;
    private String commentId;
    private String videoId;
    @JsonProperty("userId")
    private String username; // L'ID de l'utilisateur qui a commenté
}

