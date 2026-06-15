import { LanguageModel } from "@features/language/models/language-model";
import { TechnologyModel } from "@features/technology/models/technology-model";

export interface SaveProjectModel {
  name: string;
  repo_url: string | null;
  app_url: string | null;
  is_enable: boolean;
}

export interface ProjectModel extends SaveProjectModel {
  id_project: number;
  img_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetailModel extends ProjectModel {
  languages: LanguageModel[];
  technologies: TechnologyModel[];
}
