// admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { VideoManagementComponent } from './video-management/video-management.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { AbonnementSidebarComponent } from '../admin/abonnement-sidebar.component';
const routes: Routes = [
  {
    path: '', // Le préfixe 'admin' est déjà dans app-routing
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'videos', component: VideoManagementComponent },
      { path: 'upload', component: VideoUploadComponent },
      { path: 'abonnements', component: AbonnementSidebarComponent 
      },
      
      // Redirection par défaut
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }