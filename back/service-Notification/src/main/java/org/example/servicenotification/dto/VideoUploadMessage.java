package org.example.servicenotification.dto;

import java.util.List;

public class VideoUploadMessage{

    private String title;
    private String description;
    private String niveauAbonnementRequis;
    private List<String> genre;
    private String url;


    public VideoUploadMessage() {}

    public VideoUploadMessage(String title, String description,
                              String niveauAbonnementRequis, List<String> genre,String url
    ) {
        this.title = title;
        this.description = description;

        this.niveauAbonnementRequis = niveauAbonnementRequis;
        this.genre = genre;
        this.url = url;

    }

    // Getters et setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getNiveauAbonnementRequis() {
        return niveauAbonnementRequis;
    }

    public void setNiveauAbonnementRequis(String niveauAbonnementRequis) {
        this.niveauAbonnementRequis = niveauAbonnementRequis;
    }

    public List<String> getGenre() {
        return genre;
    }

    public void setGenre(List<String> genre) {
        this.genre = genre;
    }
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

}
