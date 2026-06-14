export interface SaveLanguageModel {
  name: string;
}

export interface LanguageModel extends SaveLanguageModel {
  id_language: number;
  img_url: string | null;
  created_at: string;
  updated_at: string;
}
