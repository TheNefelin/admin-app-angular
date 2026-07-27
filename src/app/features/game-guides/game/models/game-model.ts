import { GenreModel } from "@features/game-guides/genre/models/genre-model";
import { MapModel } from "@features/game-guides/map/models/map-model";
import { PlatformModel } from "@features/game-guides/platform/models/platform-model";
import { ScreenshotModel } from "@features/game-guides/screenshot/models/screenshot-model";

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
  platforms: PlatformModel[];
  genres: GenreModel[];
  screenshots: ScreenshotModel[];
  maps: MapModel[];
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
