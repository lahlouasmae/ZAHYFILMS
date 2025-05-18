package org.example.service_commentaire.controller;

import lombok.RequiredArgsConstructor;
import org.example.service_commentaire.client.VideoServiceClient;
import org.example.service_commentaire.dto.CommentRequestDTO;
import org.example.service_commentaire.dto.CommentResponseDTO;
import org.example.service_commentaire.entity.Comment;
import org.example.service_commentaire.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final VideoServiceClient videoServiceClient;  // Injection du FeignClient

    @PostMapping("/{videoId}")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable String videoId,
            @RequestBody CommentRequestDTO commentRequestDTO,
            @RequestHeader("Authorization") String token) {

        if (!videoServiceClient.videoExists(videoId, token)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Comment comment = commentService.addComment(
                token,
                videoId,
                commentRequestDTO.getContent(),
                commentRequestDTO.getParentCommentId()  // <-- nouveau paramètre
        );
        return ResponseEntity.ok(commentService.mapToDTO(comment));
    }


    @GetMapping("/{videoId}")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable String videoId) {
        List<Comment> comments = commentService.getCommentsByVideo(videoId);
        List<CommentResponseDTO> response = comments.stream()
                .map(commentService::mapToDTO)
                .toList();
        return ResponseEntity.ok(response);
    }


    @PostMapping("/{commentId}/like")
    public ResponseEntity<String> like(@PathVariable String commentId, @RequestHeader("Authorization") String token) {
        try {
            commentService.likeComment(token, commentId);
            return ResponseEntity.ok("Comment liked");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @PostMapping("/{commentId}/dislike")
    public ResponseEntity<String> dislike(@PathVariable String commentId, @RequestHeader("Authorization") String token) {
        try {
            commentService.dislikeComment(token, commentId);
            return ResponseEntity.ok("Comment disliked");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/replies/{parentCommentId}")
    public ResponseEntity<List<CommentResponseDTO>> getReplies(@PathVariable String parentCommentId) {
        List<Comment> replies = commentService.getReplies(parentCommentId);
        List<CommentResponseDTO> response = replies.stream()
                .map(commentService::mapToDTO)
                .toList();
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Comment> update(@RequestHeader("Authorization") String token,
                                          @PathVariable String id,
                                          @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(commentService.updateComment(token, id, body.get("content")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@RequestHeader("Authorization") String token,
                                       @PathVariable String id) {
        commentService.deleteComment(token, id);
        return ResponseEntity.noContent().build();
    }
}
