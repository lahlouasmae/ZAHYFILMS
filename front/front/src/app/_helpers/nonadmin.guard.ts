import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class NonAdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {}

  canActivate(): boolean {
    // Vérifier si l'utilisateur est connecté
    if (!this.tokenStorage.getToken()) {
      // S'il n'est pas connecté, rediriger vers login
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier si l'utilisateur est un admin
    const user = this.tokenStorage.getUser();
    const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

    if (isAdmin) {
      // Si c'est un admin, rediriger vers le panneau d'administration
      this.router.navigate(['/admin']);
      return false;
    }

    // Si ce n'est pas un admin, autoriser l'accès
    return true;
  }
}