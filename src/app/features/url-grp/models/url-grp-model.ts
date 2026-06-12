export interface CreateUrlGrpModel {
  name: string;
  is_enable: boolean;
}

export interface UpdateUrlGrpModel extends CreateUrlGrpModel {
  id_urlgrp: number;
}

export interface UrlGrpModel extends UpdateUrlGrpModel {
  created_at: string;
  updated_at: string;
}
