package com.example.recom.client;


import com.example.recom.dto.VideoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "video-service" ,url = "http://localhost:8089/api/videos")
public interface VideoClient {

    @GetMapping("/user-videos") // À adapter selon votre API
    List<VideoDTO> getVideosForUser(@RequestHeader("Authorization") String token);
    @GetMapping("/history")
    List<VideoDTO> getUserHistory(@RequestHeader("Authorization") String token);
    @GetMapping("/favorites")
    List<VideoDTO> getUserFavorites(@RequestHeader("Authorization") String token);
    @GetMapping("/{id}")
    VideoDTO getVideo(@PathVariable String id);

    @GetMapping("/by-genre/{genre}")
    List<VideoDTO> getVideosByGenre(@PathVariable String genre);

    @GetMapping("/all")
    List<VideoDTO> getAllVideos();
}

