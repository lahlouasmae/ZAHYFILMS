// src/app/_services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8083/api/';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  // Récupérer le profil utilisateur
  getProfile(): Observable<any> {
    return this.http.get(API_URL + 'profile');
  }

  // Mettre à jour le profil utilisateur
  updateProfile(formData: any): Observable<any> {
    return this.http.put(API_URL + 'profile', formData);
  }

  // Uploader une image de profil
  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(API_URL + 'upload/image', formData);
  }

  // Récupérer les types d'abonnements
  getAbonnements(): Observable<any> {
    return this.http.get(API_URL + 'abonnements');
  }
  
}