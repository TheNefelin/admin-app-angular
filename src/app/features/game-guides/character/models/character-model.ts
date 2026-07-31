export interface SaveCharacterModel {
  game_id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  is_playable: boolean;
  sort_order: number;
}

export interface CharacterModel extends SaveCharacterModel {
  id: number;
  created_at: string;
  updated_at: string;
}
