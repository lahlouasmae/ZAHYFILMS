package org.example.service_commentaire.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.example.service_commentaire.client.RecommendationServiceClient;
import org.example.service_commentaire.dto.CommentResponseDTO;
import org.example.service_commentaire.entity.Comment;
import org.example.service_commentaire.repository.CommentRepository;
import org.example.service_commentaire.security.JwtUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final JwtUtil jwtUtil;
    private final RecommendationServiceClient recommendationServiceClient;

    public Comment addComment(String token, String videoId, String content, String parentCommentIdStr) {
        String userId = jwtUtil.extractUserId(token);

        ObjectId parentCommentId = null;
        int depth = 0;

        if (parentCommentIdStr != null && !parentCommentIdStr.isEmpty()) {
            parentCommentId = new ObjectId(parentCommentIdStr);
            Comment parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));

            if (parentComment.getDepth() >= 1) {
                throw new RuntimeException("You cannot reply to a reply (depth limit reached)");
            }

            depth = parentComment.getDepth() + 1; // donc ici depth = 1
        }

        Comment comment = new Comment(
                null,
                videoId,
                userId,
                content,
                LocalDateTime.now(),
                new HashSet<>(),
                new HashSet<>(),
                parentCommentId,
                depth
        );
        comment.setDepth(depth); // n'oublie pas d'affecter la profondeur

        Comment savedComment = commentRepository.save(comment);

        // Notifier le service de recommandation du nouveau commentaire
        try {
            Map<String, String> commentData = new HashMap<>();
            commentData.put("commentId", savedComment.getCommentId().toHexString());
            commentData.put("videoId", videoId);
            commentData.put("content", content);

            recommendationServiceClient.analyzeComment(commentData, token);
        } catch (Exception e) {
            // En cas d'erreur avec le service de recommandation,
            // on ne bloque pas le traitement principal
            System.out.println("Erreur lors de l'analyse du sentiment: " + e.getMessage());
        }

        return savedComment;
    }




    public List<Comment> getCommentsByVideo(String videoId) {
        return commentRepository.findByVideoId(videoId);
    }

    public void likeComment(String token, String commentId) {
        String userId = jwtUtil.extractUserId(token);

        // Conversion de commentId en ObjectId
        ObjectId objectId = new ObjectId(commentId);
  // Recherche du commentaire dans la base de données avec l'ObjectId
        Comment comment = commentRepository.findById(objectId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Vérifier si l'utilisateur a déjà liké le commentaire
        if (comment.getLikes().contains(userId)) {
            throw new RuntimeException("User has already liked this comment");
        }

        comment.getDislikes().remove(userId); // Supprimer un éventuel dislike
        comment.getLikes().add(userId);       // Ajouter le like
        commentRepository.save(comment);
    }


    public void dislikeComment(String token, String commentId) {
        String userId = jwtUtil.extractUserId(token);
        ObjectId objectId = new ObjectId(commentId);
        Comment comment = commentRepository.findById(objectId)

                .orElseThrow(() -> new RuntimeException("Comment not found"));
        // Vérifier si l'utilisateur a déjà liké le commentaire
        if (comment.getDislikes().contains(userId)) {
            throw new RuntimeException("User has already disliked this comment");
        }
        comment.getLikes().remove(userId); // Supprime un éventuel "like"
        comment.getDislikes().add(userId);
        commentRepository.save(comment);
    }
    public CommentResponseDTO mapToDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setCommentId(comment.getCommentId().toHexString());
        dto.setVideoId(comment.getVideoId());
        dto.setUserId(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setLikes(comment.getLikes());
        dto.setDislikes(comment.getDislikes());
        dto.setParentCommentId(comment.getParentCommentId() != null ? comment.getParentCommentId().toHexString() : null);

        return dto;
    }
    public List<Comment> getReplies(String parentCommentId) {
        return commentRepository.findByParentCommentId(new ObjectId(parentCommentId));
    }

    public Comment updateComment(String token, String commentId, String newContent) {
        String userId = jwtUtil.extractUserId(token);
        ObjectId objectId = new ObjectId(commentId);

        Comment comment = commentRepository.findById(objectId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to edit this comment");
        }

        comment.setContent(newContent);
        return commentRepository.save(comment);
    }
    public void deleteComment(String token, String commentId) {
        String userId = jwtUtil.extractUserId(token);
        ObjectId objectId = new ObjectId(commentId);

        Comment comment = commentRepository.findById(objectId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }




}
