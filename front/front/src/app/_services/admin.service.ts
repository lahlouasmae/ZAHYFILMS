import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService
  ) { }

  // Méthode privée pour créer les headers avec le token
  private getAuthHeaders() {
    const token = this.tokenService.getToken();
    // Vérifiez si le token est disponible
    if (!token) {
      throw new Error('Token non disponible');
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Méthode privée pour créer les headers avec le token pour les images
  private getImageAuthHeaders() {
    const token = this.tokenService.getToken();
    // Vérifiez si le token est disponible
    if (!token) {
      throw new Error('Token non disponible');
    }
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }),
      responseType: 'blob' as 'json'
    };
  }

  // Gestion des utilisateurs
  getAllUsers(): Observable<any> {
    return this.http.get(API_URL + 'admin/users', this.getAuthHeaders());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(API_URL + `admin/users/${id}`, this.getAuthHeaders());
  }

  // Gestion des abonnements
  getAllSubscriptions(): Observable<any> {
    return this.http.get(API_URL + 'admin/abonnements', this.getAuthHeaders());
  }

  getSubscriptionById(id: number): Observable<any> {
    return this.http.get(API_URL + `admin/abonnements/${id}`, this.getAuthHeaders());
  }

  createSubscription(subscription: any): Observable<any> {
    return this.http.post(API_URL + 'admin/abonnements', subscription, this.getAuthHeaders());
  }

  updateSubscription(id: number, subscription: any): Observable<any> {
    return this.http.put(API_URL + `admin/abonnements/${id}`, subscription, this.getAuthHeaders());
  }

  deleteSubscription(id: number): Observable<any> {
    return this.http.delete(API_URL + `admin/abonnements/${id}`, this.getAuthHeaders());
  }
  
 // Dans AdminService.ts
getImage(fileName: string): Observable<Blob> {
    // Si le nom du fichier contient déjà un chemin complet, extraire uniquement le nom du fichier
    const fileNameOnly = fileName.includes('/') ? fileName.split('/').pop() : fileName;
    
    return this.http.get(`${API_URL}upload/images/${fileNameOnly}`, {
      responseType: 'blob'
    });
  }
  
}