import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    // Effacer les deux stockages pour éviter les conflits
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
  }

  public saveToken(token: string): void {
    // Stocker le token dans localStorage pour la persistance
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    // Vérifier d'abord localStorage, puis sessionStorage si besoin
    return window.localStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    // Stocker l'utilisateur dans localStorage pour la persistance
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    // Vérifier d'abord localStorage, puis sessionStorage si besoin
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }
}