import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Profile, UpdateProfileRequest, TypeAbonnement } from '../profile/profile.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  // Headers avec le token d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.warn('Attention: Token d\'authentification non trouvé');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  // Récupérer le profil utilisateur
  getUserProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du profil:', error);
        // Retourner un objet profil vide plutôt que de propager l'erreur
        return of({} as Profile);
      })
    );
  }

  // Mettre à jour le profil utilisateur
  updateUserProfile(updateRequest: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, updateRequest, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return throwError(() => error);
      })
    );
  }

  // Récupérer tous les types d'abonnements
   getAllAbonnements(): Observable<TypeAbonnement[]> {
    const token = this.tokenStorage.getToken();
    
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Changement de l'URL pour ne plus inclure '/admin'
    return this.http.get<TypeAbonnement[]>(`${this.apiUrl}/abonnements`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching subscriptions:', error);
          return throwError(() => error);
        })
      );
  }

  // Récupérer un abonnement par ID
  getAbonnementById(id: number): Observable<TypeAbonnement> {
    return this.http.get<TypeAbonnement>(`${this.apiUrl}/admin/abonnements/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.error(`Erreur 401: Non autorisé à récupérer l'abonnement ID ${id}`, error);
        } else {
          console.error(`Erreur lors de la récupération de l'abonnement ID ${id}:`, error);
        }
        return of({} as TypeAbonnement);
      })
    );
  }

  // Créer un nouvel abonnement (admin seulement)
  createAbonnement(abonnement: TypeAbonnement): Observable<any> {
    // Vérification du token avant l'appel pour mieux diagnostiquer
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.error('Impossible de créer un abonnement: pas de token d\'authentification');
      return throwError(() => new Error('Authentification requise'));
    }
    
    return this.http.post(`${this.apiUrl}/admin/abonnements`, abonnement, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.error('Erreur 401: Non autorisé à créer un abonnement', error);
          return throwError(() => new Error('Vous n\'avez pas les droits administrateur requis'));
        }
        console.error('Erreur lors de la création de l\'abonnement:', error);
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour un abonnement existant (admin seulement)
  updateAbonnement(id: number, abonnement: TypeAbonnement): Observable<any> {
    // Vérification du token avant l'appel pour mieux diagnostiquer
    const token = this.tokenStorage.getToken();  
    if (!token) {
      console.error('Impossible de modifier un abonnement: pas de token d\'authentification');
      return throwError(() => new Error('Authentification requise'));
    }
    
    return this.http.put(`${this.apiUrl}/admin/abonnements/${id}`, abonnement, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.error(`Erreur 401: Non autorisé à modifier l'abonnement ID ${id}`, error);
          return throwError(() => new Error('Vous n\'avez pas les droits administrateur requis'));
        }
        console.error(`Erreur lors de la mise à jour de l'abonnement ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Supprimer un abonnement (admin seulement)
  deleteAbonnement(id: number): Observable<any> {
    // Vérification du token avant l'appel pour mieux diagnostiquer
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.error('Impossible de supprimer un abonnement: pas de token d\'authentification');
      return throwError(() => new Error('Authentification requise'));
    }
    
    return this.http.delete(`${this.apiUrl}/admin/abonnements/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.error(`Erreur 401: Non autorisé à supprimer l'abonnement ID ${id}`, error);
          return throwError(() => new Error('Vous n\'avez pas les droits administrateur requis'));
        }
        console.error(`Erreur lors de la suppression de l'abonnement ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Télécharger une image de profil
  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload/image`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.tokenStorage.getToken() || ''}`
      })
    }).pipe(
      catchError(error => {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtenir l'URL complète pour une image
  getFullImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    // Remplacer le chemin relatif par l'URL complète du serveur
    if (relativePath.startsWith('/uploads/')) {
      return `http://localhost:8083${relativePath}`;
    }
    return `http://localhost:8083/uploads/${relativePath}`;
  }

  getImage(fileName: string): Observable<Blob> {
    // Si le nom du fichier contient déjà un chemin complet, extraire uniquement le nom du fichier
    const fileNameOnly = fileName.includes('/') ? fileName.split('/').pop() : fileName;
    
    // Nettoyer les paramètres de requête s'il y en a déjà (pour éviter ?t=1234?t=5678)
    const cleanFileName = fileNameOnly?.split('?')[0] || '';
    
    return this.http.get(`${this.apiUrl}/upload/images/${cleanFileName}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.tokenStorage.getToken() || ''}`
      }),
      params: {
        t: new Date().getTime().toString() // Ajouter le timestamp comme paramètre de requête
      }
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'image:', error);
        // Retourner un Blob vide plutôt que de propager l'erreur
        return of(new Blob());
      })
    );
  }

  // Créer une URL de Blob à partir d'une image
  createImageFromBlob(image: Blob): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        observer.next(reader.result as string);
        observer.complete();
      }, false);
      
      if (image) {
        reader.readAsDataURL(image);
      } else {
        observer.next('');
        observer.complete();
      }
    });
  }
  
  // Vérifier si un nom d'utilisateur est disponible
  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/auth/check-username?username=${username}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la vérification du nom d\'utilisateur:', error);
        // Par défaut, on considère que le nom d'utilisateur n'est pas disponible en cas d'erreur
        return of(false);
      })
    );
  }
  
  // Vérifier si un email est disponible
  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/auth/check-email?email=${email}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la vérification de l\'email:', error);
        // Par défaut, on considère que l'email n'est pas disponible en cas d'erreur
        return of(false);
      })
    );
  }
}