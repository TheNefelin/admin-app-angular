export interface ScreenshotModel {
  id: number;
  game_id: number;
  image_url: string;
  alt_text: string;
  created_at: string;
}

export interface SaveScreenshotModel {
  game_id: number;
  alt_text?: string;
  file?: File;
}
