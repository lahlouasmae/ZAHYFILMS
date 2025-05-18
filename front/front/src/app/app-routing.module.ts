import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { HistoryComponent } from './history/history.component';
import { AuthGuard } from './_helpers/auth.guard';
import { AdminGuard } from './_helpers/admin.guard';
import { NonAdminGuard } from './_helpers/nonadmin.guard';
import { HomComponent } from './acceuil/acceuil';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { PaymentComponent } from './payment/payment.component';
import { RecommendationsComponent } from './recommendation/recommendation.component';

const routes: Routes = [
  // Redirection par défaut pour les utilisateurs non connectés
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Routes publiques
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'connexion', component: LoginComponent },  // Version française
  { path: 'inscription', component: RegisterComponent },
  { path: 'acceuil', component: HomComponent }, 
  { path: 'bp-webchat', component:  ChatbotComponent  },  // Version française

  // Routes pour utilisateurs normaux uniquement
  { 
    path: 'home', 
    component: HomeComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'payment', 
    component: PaymentComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'accueil', 
    component: HomComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'profil', 
    component: ProfileComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'Films', 
    component: HomeComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'Favoris', 
    component: FavoritesComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'History', 
    component: HistoryComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },
  { 
    path: 'recommendations', 
    component: RecommendationsComponent, 
    canActivate: [AuthGuard, NonAdminGuard] 
  },

  // Module admin avec lazy loading, uniquement pour les admins
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },

  // Route wildcard - redirection conditionnelle
  { 
    path: '**', 
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// Exporter également les routes pour les applications standalone
export const appRoutes = routes;