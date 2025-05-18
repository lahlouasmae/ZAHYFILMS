package org.example.service_commentaire.repository;

import org.bson.types.ObjectId;
import org.example.service_commentaire.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, ObjectId> {
    List<Comment> findByVideoId(String videoId);
    List<Comment> findByParentCommentId(ObjectId parentCommentId);

}

