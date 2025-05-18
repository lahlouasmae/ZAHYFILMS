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