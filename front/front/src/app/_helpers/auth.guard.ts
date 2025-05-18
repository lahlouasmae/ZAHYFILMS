// _helpers/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private tokenService: TokenStorageService, private router: Router) {}
  
  canActivate(): boolean {
    if (this.tokenService.getToken()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}