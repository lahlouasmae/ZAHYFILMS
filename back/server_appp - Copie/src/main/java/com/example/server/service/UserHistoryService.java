package com.example.server.service;

import com.example.server.entity.UserHistory;
import com.example.server.entity.Video;
import com.example.server.repository.UserHistoryRepository;
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
public class UserHistoryService {

    @Autowired
    private UserHistoryRepository historyRepository;

    @Autowired
    private VideoRepository videoRepository;

    public List<Video> getUserHistory(Long userId) {
        List<UserHistory> history = historyRepository.findByUserIdOrderByDateViewedDesc(userId);

        if (history.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> videoIds = history.stream()
                .map(UserHistory::getVideoId)
                .collect(Collectors.toList());

        List<Video> videos = videoRepository.findAllById(videoIds);

        // Préserver l'ordre basé sur la date de visionnage
        Map<String, Video> videoMap = videos.stream()
                .collect(Collectors.toMap(Video::getId, Function.identity()));

        return history.stream()
                .map(h -> {
                    Video video = videoMap.get(h.getVideoId());
                    if (video != null) {
                        video.setProgress(h.getWatchDuration());
                        video.setCompleted(h.getCompleted());
                        video.setLastViewed(h.getDateViewed());
                        // thumbnailUrl est déjà présent dans l'objet video
                    }
                    return video;
                })
                .filter(video -> video != null)
                .collect(Collectors.toList());
    }

    public void addToHistory(Long userId, String videoId, Integer watchDuration, Boolean completed) {
        Optional<UserHistory> existingEntry = historyRepository.findByUserIdAndVideoId(userId, videoId);

        UserHistory history;
        if (existingEntry.isPresent()) {
            history = existingEntry.get();
            history.setDateViewed(LocalDateTime.now());
            history.setWatchDuration(watchDuration);
            history.setCompleted(completed);
        } else {
            history = new UserHistory();
            history.setUserId(userId);
            history.setVideoId(videoId);
            history.setDateViewed(LocalDateTime.now());
            history.setWatchDuration(watchDuration);
            history.setCompleted(completed);
        }

        historyRepository.save(history);
    }

    public void clearHistory(Long userId) {
        List<UserHistory> history = historyRepository.findByUserIdOrderByDateViewedDesc(userId);
        historyRepository.deleteAll(history);
    }

    public UserHistory getVideoProgress(Long userId, String videoId) {
        return historyRepository.findByUserIdAndVideoId(userId, videoId).orElse(null);
    }
}