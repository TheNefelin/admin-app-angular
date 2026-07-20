export interface GameModel {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  release_year: number | null;
  rating: number | null;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  platforms: { id: number; name: string }[];
  genres: { id: number; name: string }[];
}

export interface SaveGameModel {
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  release_year: number | null;
  rating: number | null;
  is_enabled: boolean;
  sort_order: number;
  platform_ids: number[];
  genre_ids: number[];
}
