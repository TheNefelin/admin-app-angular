export interface SaveUrlGrpModel {
  name: string;
  is_enable: boolean;
}

export interface UrlGrpModel extends SaveUrlGrpModel {
  id_urlgrp: number;
  created_at: string;
  updated_at: string;
}
