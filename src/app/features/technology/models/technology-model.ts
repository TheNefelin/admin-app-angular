export interface SaveTechnologyModel {
  name: string;
}

export interface TechnologyModel extends SaveTechnologyModel {
  id_technology: number;
  img_url: string | null;
  created_at: string;
  updated_at: string;
}
