import { Video } from '../_services/video.service';

/**
 * Extended video object with recommendation specific properties
 */
export interface RecommendationVideo {
  // Base video properties
  videoData: Video;
  
  // Recommendation specific properties
  score?: number;
  reason?: string;
  category?: string;
}

/**
 * Group of recommendations with a category and description
 */
export interface RecommendationGroup {
  category: string;
  description: string;
  videos: RecommendationVideo[];
}