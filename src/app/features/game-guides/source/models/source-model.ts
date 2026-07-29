export interface SaveSourceModel {
  game_id: number;
  name: string;
  url: string;
  sort_order?: number;
}

export interface SourceModel extends SaveSourceModel {
  id: number;
  created_at: string;
  updated_at: string;
}
