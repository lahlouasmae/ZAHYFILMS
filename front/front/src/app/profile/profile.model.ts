export interface Profile {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  image: string;
  typeAbonnementId?: number | null;
  typeAbonnementNom: string | null;
  imageUrl: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  image?: string;
  typeAbonnementId?: number;
}


export interface TypeAbonnement {
  id: number;
  nom: string;
  prix: number;
  duree?: number;
  nombreEcrans: number;
  qualiteHD: boolean;
  qualite4K: boolean;
  description?: string;
}
 
