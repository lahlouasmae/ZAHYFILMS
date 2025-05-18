package com.example.server.controller;

import com.example.server.dto.VideoDTO;
import com.example.server.dto.VideoProgressDTO;
import com.example.server.dto.VideoUploadResponse;
import com.example.server.entity.UserHistory;
import com.example.server.entity.Video;
import com.example.server.repository.VideoRepository;
import com.example.server.security.JwtUtils;
import com.example.server.service.UserFavoriteService;
import com.example.server.service.UserHistoryService;
import com.example.server.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;
    @Autowired
    private UserFavoriteService favoriteService;
    @Autowired
    private UserHistoryService historyService;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private VideoRepository videoRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VideoUploadResponse> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("niveauAbonnementRequis") String niveauAbonnementRequis,
            @RequestParam(value = "genre", required = false) List<String> genre,
            @RequestParam(value = "description", required = false) String description) {

        try {
            VideoUploadResponse response = videoService.uploadVideo(file, title, description, niveauAbonnementRequis, genre);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();  // Pour le débogage
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new VideoUploadResponse(null, null, "Erreur: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVideo(@PathVariable String id) {
        try {
            return ResponseEntity.ok(videoService.getVideoById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllVideos() {
        try {
            return ResponseEntity.ok(videoService.getAllVideos());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Nouveau endpoint pour récupérer les vidéos par genre
    @GetMapping("/by-genre/{genre}")
    public ResponseEntity<?> getVideosByGenre(@PathVariable String genre) {
        try {
            return ResponseEntity.ok(videoService.getVideosByGenre(genre));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Nouveau endpoint pour récupérer tous les genres disponibles
    @GetMapping("/genres")
    public ResponseEntity<?> getAllGenres() {
        try {
            return ResponseEntity.ok(videoService.getAllGenres());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Endpoint de test simple pour vérifier que l'API est accessible
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("L'API vidéo fonctionne correctement!");
    }

    @GetMapping("/user-videos")
    public ResponseEntity<?> getVideosForUser(@RequestHeader("Authorization") String token) {
        try {
            // Utiliser getUserIdFromJwtToken au lieu de getUserIdFromToken
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            List<VideoDTO> videos = videoService.getVideosByUserAbonnement(userId, token);
            return ResponseEntity.ok(videos);
        } catch (Exception e) {
            e.printStackTrace(); // Ajoutez ceci pour avoir plus de détails sur l'erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Endpoint pour récupérer les vidéos par genre pour un utilisateur spécifique
    @GetMapping("/user-videos/by-genre/{genre}")
    public ResponseEntity<?> getVideosForUserByGenre(
            @PathVariable String genre,
            @RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            List<VideoDTO> videos = videoService.getVideosByUserAbonnementAndGenre(userId, token, genre);
            return ResponseEntity.ok(videos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Endpoints pour les favoris
    @GetMapping("/favorites")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserFavorites(@RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            // Récupérer les vidéos favorites
            List<Video> favorites = favoriteService.getUserFavorites(userId);

            // Convertir en DTO avec URLs présignées pour les miniatures
            List<VideoDTO> favoriteDTOs = videoService.convertVideosToDTO(favorites);

            // Enrichir avec les informations utilisateur
            favoriteDTOs = videoService.enrichVideosWithUserInfo(favoriteDTOs, userId);

            return ResponseEntity.ok(favoriteDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/favorites/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addToFavorites(@PathVariable String videoId,
                                            @RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            favoriteService.addToFavorites(userId, videoId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/favorites/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> removeFromFavorites(@PathVariable String videoId,
                                                 @RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            favoriteService.removeFromFavorites(userId, videoId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/favorites/check/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> checkFavorite(@PathVariable String videoId,
                                                 @RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            boolean isFavorite = favoriteService.isFavorite(userId, videoId);
            return ResponseEntity.ok(isFavorite);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    // Endpoints pour l'historique
    @GetMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserHistory(@RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            // Récupérer l'historique
            List<Video> history = historyService.getUserHistory(userId);

            // Convertir en DTO avec URLs présignées pour les miniatures
            List<VideoDTO> historyDTOs = videoService.convertVideosToDTO(history);

            // Enrichir avec les informations utilisateur
            historyDTOs = videoService.enrichVideosWithUserInfo(historyDTOs, userId);

            return ResponseEntity.ok(historyDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/history/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateHistory(@PathVariable String videoId,
                                           @RequestBody VideoProgressDTO progressDTO,
                                           @RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            historyService.addToHistory(userId, videoId,
                    progressDTO.getWatchDuration(),
                    progressDTO.getCompleted());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> clearHistory(@RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            historyService.clearHistory(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/history/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getVideoProgress(@PathVariable String videoId,
                                              @RequestHeader("Authorization") String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "");
            Long userId = jwtUtils.getUserIdFromJwtToken(tokenWithoutBearer);

            UserHistory progress = historyService.getVideoProgress(userId, videoId);
            if (progress != null) {
                VideoProgressDTO progressDTO = new VideoProgressDTO(
                        progress.getWatchDuration(),
                        progress.getCompleted()
                );
                return ResponseEntity.ok(progressDTO);
            } else {
                return ResponseEntity.ok(new VideoProgressDTO(0, false));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVideo(@PathVariable String id) {
        try {
            videoService.deleteVideo(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Vidéo supprimée avec succès");
            return ResponseEntity.ok(response);  // Renvoie un objet JSON valide
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVideo(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "niveauAbonnementRequis", required = false) String niveauAbonnementRequis) {

        try {
            Map<String, Object> metadata = new HashMap<>();
            if (title != null) metadata.put("title", title);
            if (description != null) metadata.put("description", description);
            if (niveauAbonnementRequis != null) metadata.put("niveauAbonnementRequis", niveauAbonnementRequis);
            if (genre != null) metadata.put("genre", genre);

            VideoDTO updatedVideo;

            if (file != null) {
                // Mise à jour du fichier et des métadonnées
                updatedVideo = videoService.updateVideo(id, file, metadata);
            } else {
                // Mise à jour des métadonnées uniquement
                updatedVideo = videoService.updateVideoMetadata(id, metadata);
            }

            return ResponseEntity.ok(updatedVideo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour: " + e.getMessage());
        }
    }
    @GetMapping("/{id}/exists")
    public boolean videoExists(@PathVariable String id) {
        // Vérifie si une vidéo avec l'ID spécifié existe dans la base de données
        return videoRepository.existsById(id);
    }
}