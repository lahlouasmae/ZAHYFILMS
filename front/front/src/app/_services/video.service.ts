import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

const API_URL = 'http://localhost:8089/api/videos';

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  fileName?: string;
  contentType?: string;
  size: number;
  uploadDate: Date;
  niveauAbonnementRequis: string;
  subscriptionType?: string; // Ajouté pour compatibilité
  duration: number;
  isFavorite?: boolean;
  progress?: number;
  completed?: boolean;
  thumbnailUrl: string;
  lastViewed?: Date;
  genre: string[];
}

export interface VideoProgressDTO {
  watchDuration: number;
  completed: boolean;
}

export interface VideoUploadResponse {
  id?: string;
  url?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Méthode pour normaliser les objets vidéo
  normalizeVideo(video: any): Video {
    let genreArray: string[];
    if (typeof video.genre === 'string') {
      genreArray = [video.genre];
    } else if (Array.isArray(video.genre)) {
      genreArray = video.genre;
    } else {
      genreArray = [];
    }
  
    // Conserver explicitement le niveau d'abonnement d'origine
    // Vérifier toutes les variantes possibles du nom de propriété
    const niveauAbonnement = 
      video.niveauAbonnementRequis ?? 
      video.subscriptionType ?? 
      video.niveau_abonnement_requis ?? 
      'Standard';
    
    console.log('Normalisation - niveauAbonnement source:', video.niveauAbonnementRequis);
    console.log('Normalisation - niveau final:', niveauAbonnement);
    
    return {
      ...video,
      title: video.title || 'Sans titre',
      description: video.description || 'Aucune description',
      url: video.url || '',
      size: video.size || 0,
      uploadDate: video.uploadDate ? new Date(video.uploadDate) : new Date(),
      niveauAbonnementRequis: niveauAbonnement,
      subscriptionType: niveauAbonnement, // Assurer la cohérence entre les deux propriétés
      duration: video.duration || 0,
      isFavorite: video.isFavorite || false,
      progress: video.progress || 0,
      completed: video.completed || false,
      thumbnailUrl: video.thumbnailUrl || '',
      
      lastViewed: video.lastViewed ? new Date(video.lastViewed) : undefined,
      genre: genreArray,
    };
  }

  getUserVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${API_URL}/user-videos`, { 
      headers: this.getAuthHeaders() 
    });
  }
  
  // Obtenir les vidéos par genre
  getVideosByGenre(genre: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${API_URL}/genre/${genre}`, {
      headers: this.getAuthHeaders()
    });
  }
  
  // Obtenir tous les genres disponibles
  getAllGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/genres`, {
      headers: this.getAuthHeaders()
    });
  }
    
  // Obtenir une vidéo spécifique par ID
  getVideoById(id: string): Observable<Video> {
    return this.http.get<Video>(`${API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getFavorites(): Observable<Video[]> {
    return this.http.get<Video[]>(`${API_URL}/favorites`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Ajouter une vidéo aux favoris
  addToFavorites(videoId: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/favorites/${videoId}`, {}, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Retirer une vidéo des favoris
  removeFromFavorites(videoId: string): Observable<any> {
    return this.http.delete<any>(`${API_URL}/favorites/${videoId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Vérifier si une vidéo est dans les favoris
  checkFavorite(videoId: string): Observable<boolean> {
    return this.http.get<boolean>(`${API_URL}/favorites/check/${videoId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getHistory(): Observable<Video[]> {
    return this.http.get<Video[]>(`${API_URL}/history`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Mettre à jour la progression d'une vidéo
  updateProgress(videoId: string, progress: VideoProgressDTO): Observable<any> {
    return this.http.post<any>(`${API_URL}/history/${videoId}`, progress, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Obtenir la progression d'une vidéo
  getVideoProgress(videoId: string): Observable<VideoProgressDTO> {
    return this.http.get<VideoProgressDTO>(`${API_URL}/history/${videoId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Effacer l'historique
  clearHistory(): Observable<any> {
    return this.http.delete(`${API_URL}/history`, {
      headers: this.getAuthHeaders()
    });
  }

  // Upload a new video
  uploadVideo(formData: FormData): Observable<any> {
    return this.http.post(`${API_URL}/upload`, formData, {
      headers: this.getAuthHeaders(),
      reportProgress: true,
      observe: 'events'
    });
  }

  // Method to get all videos - Admin only
  getAllVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${API_URL}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  // Method to delete a video - Admin only
  deleteVideo(videoId: string): Observable<any> {
    return this.http.delete(`${API_URL}/${videoId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Method to update a video's metadata - Admin only
  updateVideoMetadata(videoId: string, metadata: any): Observable<Video> {
    // Créer un FormData pour l'envoi au backend
    const formData = new FormData();
    
    // Ajouter chaque champ à FormData s'il est défini
    if (metadata.title !== undefined) {
      formData.append('title', metadata.title);
    }
    
    if (metadata.description !== undefined) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.niveauAbonnementRequis !== undefined) {
      formData.append('niveauAbonnementRequis', metadata.niveauAbonnementRequis);
    }
    if (metadata.genre !== undefined && Array.isArray(metadata.genre)) {
      metadata.genre.forEach((genree: string) => {
        formData.append('genre', genree); // les champs du même nom seront reçus sous forme de liste
      });
    }
    
    
    // Effectuer l'appel PUT avec FormData
    return this.http.put<Video>(`${API_URL}/${videoId}`, formData, {
      headers: this.getAuthHeaders()
    });
  }
  
  // Obtenir les vidéos recommandées pour l'utilisateur
  getRecommendations(): Observable<Video[]> {
    return this.http.get<Video[]>(`http://localhost:8082/api/recommendations/history`, {
      headers: this.getAuthHeaders()
    });
  }
  
  // Obtenir les vidéos recommandées pour l'utilisateur
  getRecommendationsFav(): Observable<Video[]> {
    return this.http.get<Video[]>(`http://localhost:8082/api/recommendations/favorites`, {
      headers: this.getAuthHeaders()
    });
  }

  // Method to update both video file and metadata - Admin only
  updateVideo(videoId: string, file: File, metadata: any): Observable<Video> {
    const formData = new FormData();
    
    // Ajouter le fichier vidéo
    formData.append('file', file);
    
    // Ajouter les métadonnées
    if (metadata.title !== undefined) {
      formData.append('title', metadata.title);
    }
    
    if (metadata.description !== undefined) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.niveauAbonnementRequis !== undefined) {
      formData.append('niveauAbonnementRequis', metadata.niveauAbonnementRequis);
    }
    
    if (metadata.genre !== undefined) {
      formData.append('genre', metadata.genre);
    }
    
    // Effectuer l'appel PUT avec FormData
    return this.http.put<Video>(`${API_URL}/${videoId}`, formData, {
      headers: this.getAuthHeaders()
    });
  }
}