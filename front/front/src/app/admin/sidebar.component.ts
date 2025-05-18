// sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isAdmin = false;
  isDarkMode = false;

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminRole();
    // Check if dark mode preference is stored
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      this.isDarkMode = storedDarkMode === 'true';
    }
  }

  checkAdminRole(): void {
    const user = this.tokenStorage.getUser();
    this.isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');
  }

  navigateToVideoUpload(): void {
    this.router.navigate(['/admin/upload']);
  }

  navigateToVideoManagement(): void {
    this.router.navigate(['/admin/videos']);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.router.navigate(['/login']);
  }
}