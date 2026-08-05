import { AdventureImageModel } from "@features/game-guides/adventure-image/models/adventure-image-model";

export interface SaveAdventureModel {
  guide_id: number;
  description: string;
  sort_order?: number;
  is_important: boolean;
  is_optional: boolean;
}

export interface AdventureModel extends SaveAdventureModel {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface AdventureDetailModel extends AdventureModel {
  images: AdventureImageModel[];
}