import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  currentUser: any;

  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.tokenService.getUser();
    
    // Vérifier si l'utilisateur est un administrateur
    if (!this.currentUser || !this.hasAdminRole(this.currentUser)) {
      this.router.navigate(['/login']);
    }
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