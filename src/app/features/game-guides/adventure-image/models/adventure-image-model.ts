export interface AdventureImageModel {
  id: number;
  adventure_id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface SaveAdventureImageModel {
  adventure_id: number;
  alt_text: string;
  sort_order?: number;
  file: File | null;
}
