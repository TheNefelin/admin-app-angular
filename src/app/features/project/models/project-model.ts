import { LanguageModel } from "@features/language/models/language-model";
import { TechnologyModel } from "@features/technology/models/technology-model";

export interface SaveProjectModel {
  name: string;
  repo_url: string | null;
  app_url: string | null;
  is_enabled: boolean;
  language_ids: number[];
  technology_ids: number[];
}

export interface ProjectModel extends SaveProjectModel {
  id_project: number;
  name: string;
  app_url: string | null;
  img_url: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  languages: LanguageModel[];
  technologies: TechnologyModel[];
}
