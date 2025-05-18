import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';
import { Observable, throwError } from 'rxjs';

export interface CommentRequestDTO {
  content: string;
  parentCommentId?: string; // Ajout du paramètre pour les réponses
}

export interface CommentResponseDTO {
  commentId: string; 
  content: string;
  userId: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userHasLiked: boolean;
  userHasDisliked: boolean;
  likedByUsers: string[];
  dislikedByUsers: string[];
  parentCommentId?: string; // Ajout pour identifier les réponses
  hasReplies?: boolean;     // Pour savoir si le commentaire a des réponses
  replies?: CommentResponseDTO[]; // Pour stocker les réponses chargées
  showReplies?: boolean;    // Pour contrôler l'affichage des réponses
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8085/comments';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  // Récupérer les commentaires d'une vidéo
  getCommentsByVideo(videoId: string): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${this.apiUrl}/${videoId}`);
  }

  // Ajouter un commentaire ou une réponse
  addComment(videoId: string, content: string, parentCommentId?: string): Observable<CommentResponseDTO> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const commentRequest: CommentRequestDTO = { 
      content,
      parentCommentId
    };
    
    return this.http.post<CommentResponseDTO>(
      `${this.apiUrl}/${videoId}`, 
      commentRequest,
      { headers }
    );
  }

  // Récupérer les réponses d'un commentaire
  getReplies(commentId: string): Observable<CommentResponseDTO[]> {
    return this.http.get<CommentResponseDTO[]>(`${this.apiUrl}/replies/${commentId}`);
  }

  // Mettre à jour un commentaire
  updateComment(commentId: string, content: string): Observable<any> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.put<any>(
      `${this.apiUrl}/${commentId}`,
      { content },
      { headers }
    );
  }

  // Supprimer un commentaire
  deleteComment(commentId: string): Observable<any> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete<any>(
      `${this.apiUrl}/${commentId}`,
      { headers }
    );
  }

  // Liker un commentaire
  likeComment(commentId: string): Observable<any> {
    if (!commentId) {
      console.error('ID du commentaire non défini');
      return throwError(() => new Error('ID du commentaire non défini'));
    }
    
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post<any>(
      `${this.apiUrl}/${commentId}/like`,
      {},
      { headers }
    );
  }

  // Disliker un commentaire
  dislikeComment(commentId: string): Observable<any> {
    if (!commentId) {
      console.error('ID du commentaire non défini');
      return throwError(() => new Error('ID du commentaire non défini'));
    }
    
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post<any>(
      `${this.apiUrl}/${commentId}/dislike`,
      {},
      { headers }
    );
  }
}