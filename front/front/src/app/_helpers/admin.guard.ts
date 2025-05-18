// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.tokenService.getUser();
    
    // Vérifier si l'utilisateur est connecté et a le rôle d'administrateur
    if (user && this.hasAdminRole(user)) {
      return true;
    }
    
    // Rediriger vers la page de connexion si non autorisé
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  private hasAdminRole(user: any): boolean {
    if (!user.roles) return false;
    return user.roles.some((role: any) => 
      role === 'ROLE_ADMIN' || 
      role === 'admin' || 
      (typeof role === 'object' && (role.name === 'ROLE_ADMIN' || role.name === 'admin'))
    );
  }
}