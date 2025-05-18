import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

// Interface pour la réponse de l'API
interface AuthResponse {
  token: string;          // Changé de accessToken à token
  isAdmin?: boolean;      // Ajout de la propriété isAdmin
  username?: string;
  email?: string;
  roles?: string[];
  // Autres propriétés si nécessaire
}

const AUTH_API = 'http://localhost:8083/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) { }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(AUTH_API + 'signin', {
      username,
      password
    }, httpOptions).pipe(
      tap(response => {
        // Utiliser TokenStorageService au lieu de méthodes dupliquées
        this.tokenStorage.signOut(); // Effacer les données précédentes
        this.tokenStorage.saveToken(response.token);
        this.tokenStorage.saveUser(response);
      })
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signup', {
      username,
      email,
      password
    }, httpOptions);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }
}