package com.example.recom.service;

import com.example.recom.client.VideoClient;
import com.example.recom.client.SentimentAnalysisClient;
import com.example.recom.dto.VideoDTO;
import com.example.recom.dto.SentimentAnalysisRequestDTO;
import com.example.recom.dto.SentimentAnalysisResponseDTO;
import com.example.recom.dto.RecommendationResponseDTO;
import com.example.recom.entity.CommentSentiment;
import com.example.recom.repository.CommentSentimentRepository;
import com.example.recom.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final CommentSentimentRepository commentSentimentRepository;
    private final SentimentAnalysisClient sentimentAnalysisClient;
    private final VideoClient videoClient;
    private final JwtUtil jwtUtil;

    public CommentSentiment analyzeComment(String token, String commentId, String videoId, String commentContent) {
        String userId = jwtUtil.extractUserId(token);

        // Obtenir les infos de la vidéo pour récupérer le genre
        VideoDTO video = videoClient.getVideo(videoId);

        // Appeler le service d'analyse de sentiment
        SentimentAnalysisRequestDTO request = new SentimentAnalysisRequestDTO(commentContent);
        SentimentAnalysisResponseDTO sentiment = sentimentAnalysisClient.analyzeSentiment(request);

        // Sauvegarder le résultat pour recommandations futures
        CommentSentiment commentSentiment = new CommentSentiment(
                null,
                userId,
                videoId,
                commentId,
                sentiment.getSentiment(),
                sentiment.getPolarity(),
                LocalDateTime.now(),
                video.getGenre()
        );

        return commentSentimentRepository.save(commentSentiment);
    }

    public List<RecommendationResponseDTO> getRecommendationsBasedOnComments(String token) {
        String userId = jwtUtil.extractUserId(token);

        // Récupérer les commentaires positifs de l'utilisateur
        List<CommentSentiment> positiveSentiments = commentSentimentRepository
                .findByUserIdAndSentiment(userId, "positive");

        if (positiveSentiments.isEmpty()) {
            // S'il n'y a pas de commentaires positifs, retourner une liste vide
            return Collections.emptyList();
        }

        // Collecter tous les genres des vidéos ayant reçu des commentaires positifs
        Set<String> likedGenres = new HashSet<>();
        for (CommentSentiment sentiment : positiveSentiments) {
            likedGenres.addAll(sentiment.getVideoGenre());
        }

        // Récupérer toutes les vidéos
        List<VideoDTO> allVideos = videoClient.getAllVideos();

        // Set pour garder la trace des vidéos déjà commentées
        Set<String> commentedVideoIds = positiveSentiments.stream()
                .map(CommentSentiment::getVideoId)
                .collect(Collectors.toSet());

        // Filtrer les vidéos ayant au moins un genre en commun avec les vidéos aimées
        return allVideos.stream()
                .filter(video -> !commentedVideoIds.contains(video.getId())) // Exclure les vidéos déjà commentées
                .filter(video -> video.getGenre().stream().anyMatch(likedGenres::contains)) // Filtrer par genres aimés
                .map(video -> {
                    // Calculer un score basé sur le nombre de genres correspondants
                    long matchingGenres = video.getGenre().stream()
                            .filter(likedGenres::contains)
                            .count();

                    double score = matchingGenres * 1.0; // 1 point par genre correspondant

                    return new RecommendationResponseDTO(
                            video.getId(),
                            video.getTitle(),
                            video.getDescription(),
                            video.getThumbnailUrl(),
                            video.getGenre(),
                            score,
                            video.getDuration(),
                            video.getNiveauAbonnementRequis()
                    );
                })
                .sorted(Comparator.comparing(RecommendationResponseDTO::getScore).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<RecommendationResponseDTO> getGeneralRecommendations() {
        List<VideoDTO> videos = videoClient.getAllVideos();

        return videos.stream()
                .map(video -> new RecommendationResponseDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        video.getThumbnailUrl(),
                        video.getGenre(),
                        1.0,
                        video.getDuration(),
                        video.getNiveauAbonnementRequis()
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<RecommendationResponseDTO> getRecommendations(String token) {
        List<VideoDTO> history = videoClient.getUserHistory(token);
        if (history.isEmpty()) return Collections.emptyList();

        // Compter les genres vus
        Map<String, Long> genreFrequency = history.stream()
                .flatMap(video -> video.getGenre().stream())
                .collect(Collectors.groupingBy(genre -> genre, Collectors.counting()));

        // Trier les genres par popularité
        List<String> topGenres = genreFrequency.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .limit(3)
                .toList();

        List<VideoDTO> allVideos = videoClient.getVideosForUser(token);

        // Exclure les vidéos déjà vues
        Set<String> viewedIds = history.stream().map(VideoDTO::getId).collect(Collectors.toSet());

        return allVideos.stream()
                .filter(video -> !viewedIds.contains(video.getId()))
                .filter(video -> video.getGenre().stream().anyMatch(topGenres::contains))
                .map(video -> new RecommendationResponseDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        video.getThumbnailUrl(),
                        video.getGenre(),
                        1.0,
                        video.getDuration(),
                        video.getNiveauAbonnementRequis()
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<RecommendationResponseDTO> getRecommendationsFav(String token) {
        List<VideoDTO> fav = videoClient.getUserFavorites(token);
        if (fav.isEmpty()) return Collections.emptyList();

        // Compter les genres vus
        Map<String, Long> genreFrequency = fav.stream()
                .flatMap(video -> video.getGenre().stream())
                .collect(Collectors.groupingBy(genre -> genre, Collectors.counting()));

        // Trier les genres par popularité
        List<String> topGenres = genreFrequency.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .limit(3)
                .toList();

        List<VideoDTO> allVideos = videoClient.getVideosForUser(token);

        // Exclure les vidéos déjà vues
        Set<String> viewedIds = fav.stream().map(VideoDTO::getId).collect(Collectors.toSet());

        return allVideos.stream()
                .filter(video -> !viewedIds.contains(video.getId()))
                .filter(video -> video.getGenre().stream().anyMatch(topGenres::contains))
                .map(video -> new RecommendationResponseDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        video.getThumbnailUrl(),
                        video.getGenre(),
                        1.0,
                        video.getDuration(),
                        video.getNiveauAbonnementRequis()
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<RecommendationResponseDTO> getCombinedRecommendations(String token) {
        String userId = jwtUtil.extractUserId(token);

        // Récupérer les recommandations de chaque source sans limitation
        List<RecommendationResponseDTO> historyBasedRecommendations = getRecommendations(token);
        List<RecommendationResponseDTO> favoritesBasedRecommendations = getRecommendationsFav(token);
        List<RecommendationResponseDTO> commentBasedRecommendations = getRecommendationsBasedOnComments(token);

        // Si aucune recommandation n'est disponible, retourner les recommandations générales
        if (historyBasedRecommendations.isEmpty() && favoritesBasedRecommendations.isEmpty() && commentBasedRecommendations.isEmpty()) {
            return getGeneralRecommendations();
        }

        // Créer une map pour stocker toutes les vidéos avec leurs scores
        Map<String, RecommendationResponseDTO> combinedRecommendations = new HashMap<>();

        // Ajouter les recommandations basées sur l'historique (score de base: 1.0)
        for (RecommendationResponseDTO rec : historyBasedRecommendations) {
            combinedRecommendations.put(rec.getVideoId(), rec);
        }

        // Ajouter les recommandations basées sur les favoris (score de base: 2.0)
        for (RecommendationResponseDTO rec : favoritesBasedRecommendations) {
            if (combinedRecommendations.containsKey(rec.getVideoId())) {
                // La vidéo existe déjà, augmenter son score
                RecommendationResponseDTO existing = combinedRecommendations.get(rec.getVideoId());
                existing.setScore(existing.getScore() + 2.0);
            } else {
                // Nouvelle vidéo
                rec.setScore(2.0);  // Définir le score à 2.0 pour favoris
                combinedRecommendations.put(rec.getVideoId(), rec);
            }
        }

        // Ajouter les recommandations basées sur les commentaires (utiliser le score existant)
        for (RecommendationResponseDTO rec : commentBasedRecommendations) {
            if (combinedRecommendations.containsKey(rec.getVideoId())) {
                // La vidéo existe déjà, augmenter son score
                RecommendationResponseDTO existing = combinedRecommendations.get(rec.getVideoId());
                existing.setScore(existing.getScore() + 1.5);
            } else {
                // Nouvelle vidéo - utiliser le score de base + un facteur multiplicateur (1.5)
                rec.setScore(rec.getScore() * 1.5);
                combinedRecommendations.put(rec.getVideoId(), rec);
            }
        }

        // Convertir la map en liste et trier par score décroissant
        return combinedRecommendations.values().stream()
                .sorted(Comparator.comparing(RecommendationResponseDTO::getScore).reversed())
                .collect(Collectors.toList());
    }
}