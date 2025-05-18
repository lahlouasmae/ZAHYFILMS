import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { VideoService } from './video.service';

export interface RecommendationDTO {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  genre: string[];
  score: number;
  duration?: number; // Ajout de la propriété duration
  niveauAbonnementRequis?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:8082/api/recommendations';

  constructor(
    private http: HttpClient,
    private tokenStorageService: TokenStorageService,
    private videoService: VideoService // Injection du service vidéo pour pouvoir récupérer les détails manquants
  ) {}

  getCombinedRecommendations(): Observable<RecommendationDTO[]> {
    // Récupération du token d'authentification
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<RecommendationDTO[]>(`${this.apiUrl}/combined`, { headers })
      .pipe(
        switchMap(recommendations => {
          // Si les recommandations sont vides, retourner un tableau vide
          if (!recommendations || recommendations.length === 0) {
            return of([]);
          }

          // Vérifier si la durée est déjà présente dans les recommandations
          const needsVideoDetails = recommendations.some(rec => rec.duration === undefined);
          
          // Si toutes les recommandations ont déjà la durée, les retourner directement
          if (!needsVideoDetails) {
            return of(recommendations);
          }

          // Sinon, récupérer les détails des vidéos manquants
          const videoIds = recommendations
            .filter(rec => rec.duration === undefined)
            .map(rec => rec.videoId);

          if (videoIds.length === 0) {
            return of(recommendations);
          }

          // Récupérer les détails des vidéos pour obtenir les durées manquantes
          return forkJoin(
            videoIds.map(id => 
              this.videoService.getVideoById(id).pipe(
                catchError(() => of(null))
              )
            )
          ).pipe(
            map(videosDetails => {
              // Compléter les recommandations avec les durées récupérées
              return recommendations.map(rec => {
                if (rec.duration !== undefined) {
                  return rec;
                }
                
                const videoDetail = videosDetails.find(v => v && v.id === rec.videoId);
                return {
                  ...rec,
                  duration: videoDetail ? videoDetail.duration : 0
                };
              });
            })
          );
        })
      );
  }
  
  // Appliquer la même logique aux autres méthodes de recommandation
  getHistoryBasedRecommendations(): Observable<RecommendationDTO[]> {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<RecommendationDTO[]>(`${this.apiUrl}/history`, { headers })
      .pipe(
        switchMap(recommendations => this.enrichWithVideoDetails(recommendations))
      );
  }
  
  getGenreBasedRecommendations(genre: string): Observable<RecommendationDTO[]> {
    const token = this.tokenStorageService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<RecommendationDTO[]>(`${this.apiUrl}/genre/${genre}`, { headers })
      .pipe(
        switchMap(recommendations => this.enrichWithVideoDetails(recommendations))
      );
  }

  // Méthode utilitaire pour ajouter les détails manquants (comme la durée) aux recommandations
  private enrichWithVideoDetails(recommendations: RecommendationDTO[]): Observable<RecommendationDTO[]> {
    if (!recommendations || recommendations.length === 0) {
      return of([]);
    }

    // Vérifier si la durée est déjà présente dans les recommandations
    const needsVideoDetails = recommendations.some(rec => 
      rec.duration === undefined || 
      rec.niveauAbonnementRequis === undefined // Vérifier aussi le niveau d'abonnement
    );
    
    if (!needsVideoDetails) {
      return of(recommendations);
    }
  
    const videoIds = recommendations
      .filter(rec => rec.duration === undefined || rec.niveauAbonnementRequis === undefined)
      .map(rec => rec.videoId);
  
    if (videoIds.length === 0) {
      return of(recommendations);
    }
  
    return forkJoin(
      videoIds.map(id => 
        this.videoService.getVideoById(id).pipe(
          catchError(() => of(null))
        )
      )
    ).pipe(
      map(videosDetails => {
        return recommendations.map(rec => {
          const videoDetail = videosDetails.find(v => v && v.id === rec.videoId);
          
          if (!videoDetail) {
            return rec;
          }
          
          return {
            ...rec,
            duration: rec.duration !== undefined ? rec.duration : (videoDetail.duration || 0),
            niveauAbonnementRequis: rec.niveauAbonnementRequis || videoDetail.niveauAbonnementRequis
          };
        });
      })
    );
  }
}