export interface MapModel {
  id: number;
  game_id: number;
  image_url: string;
  alt_text: string;
  created_at: string;
}

export interface SaveMapModel {
  game_id: number;
  alt_text?: string;
  file?: File;
}