package com.example.server.repository;

import com.example.server.entity.UserFavorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends MongoRepository<UserFavorite, String> {
    List<UserFavorite> findByUserId(Long userId);
    Optional<UserFavorite> findByUserIdAndVideoId(Long userId, String videoId);
    void deleteByUserIdAndVideoId(Long userId, String videoId);
}