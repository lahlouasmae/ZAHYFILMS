package com.example.server.repository;

import com.example.server.entity.UserHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserHistoryRepository extends MongoRepository<UserHistory, String> {
    List<UserHistory> findByUserIdOrderByDateViewedDesc(Long userId);
    Optional<UserHistory> findByUserIdAndVideoId(Long userId, String videoId);
}