package com.example.server.service;

import com.example.server.entity.UserFavorite;
import com.example.server.entity.Video;
import com.example.server.repository.UserFavoriteRepository;
import com.example.server.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserFavoriteService {

    @Autowired
    private UserFavoriteRepository favoriteRepository;

    @Autowired
    private VideoRepository videoRepository;

    public List<Video> getUserFavorites(Long userId) {
        List<UserFavorite> favorites = favoriteRepository.findByUserId(userId);

        if (favorites.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> videoIds = favorites.stream()
                .map(UserFavorite::getVideoId)
                .collect(Collectors.toList());

        List<Video> videos = videoRepository.findAllById(videoIds);

        // Préserver l'ordre basé sur la date d'ajout aux favoris
        Map<String, Video> videoMap = videos.stream()
                .collect(Collectors.toMap(Video::getId, Function.identity()));

        return favorites.stream()
                .map(favorite -> {
                    Video video = videoMap.get(favorite.getVideoId());
                    if (video != null) {
                        video.setIsFavorite(true);
                        // S'assurer que la propriété thumbnailUrl est préservée
                    }
                    return video;
                })
                .filter(video -> video != null)
                .collect(Collectors.toList());
    }

    public void addToFavorites(Long userId, String videoId) {
        Optional<UserFavorite> existingFavorite = favoriteRepository.findByUserIdAndVideoId(userId, videoId);
        if (existingFavorite.isPresent()) {
            return; // Déjà dans les favoris
        }

        UserFavorite favorite = new UserFavorite();
        favorite.setUserId(userId);
        favorite.setVideoId(videoId);
        favorite.setDateAdded(LocalDateTime.now());
        favoriteRepository.save(favorite);
    }

    public void removeFromFavorites(Long userId, String videoId) {
        favoriteRepository.deleteByUserIdAndVideoId(userId, videoId);
    }

    public boolean isFavorite(Long userId, String videoId) {
        return favoriteRepository.findByUserIdAndVideoId(userId, videoId).isPresent();
    }
}