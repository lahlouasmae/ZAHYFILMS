import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Ajout du CommonModule
import { HomComponent } from './acceuil/acceuil';
// Composants
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { HistoryComponent } from './history/history.component';
import { VideoCardComponent } from './shared/video-card/video-card.component';

// Services et modules
import { AppRoutingModule } from './app-routing.module';
import { authInterceptorProviders } from './_helpers/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HomComponent,
    ProfileComponent,
    FavoritesComponent,
    HistoryComponent,
    VideoCardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule, // Ajout du CommonModule ici
    HttpClientModule,
    RouterModule,
    FormsModule,
    AppRoutingModule,
    // Ne pas importer AdminModule ici car nous utilisons le lazy loading
  ],
  providers: [authInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }