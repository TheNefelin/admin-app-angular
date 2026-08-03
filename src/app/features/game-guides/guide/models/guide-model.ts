export interface SaveGuideModel {
  game_id: number;
  title: string;
  summary: string | null;
  sort_order?: number;
  is_enabled: boolean;
}

export interface GuideModel extends SaveGuideModel {
  id: number;
  created_at: string;
  updated_at: string;
}