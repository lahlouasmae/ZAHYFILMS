package com.example.recom.repository;


import com.example.recom.entity.CommentSentiment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentSentimentRepository extends MongoRepository<CommentSentiment, String> {
    List<CommentSentiment> findByUserIdAndSentiment(String userId, String sentiment);
    List<CommentSentiment> findByVideoIdAndSentiment(String videoId, String sentiment);
    List<CommentSentiment> findByUserIdAndVideoGenre(String userId, String videoGenre);
    List<CommentSentiment> findByUserId(String userId);
}