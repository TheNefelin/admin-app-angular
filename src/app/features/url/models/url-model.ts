export interface FilterByUrlGrp {
  id_urlgrp: number;
}

export interface CreateUrlModel extends FilterByUrlGrp {
  name: string;
  link: string;
  is_enable: boolean;
}

export interface UpdateUrlModel extends CreateUrlModel {
  id_url: number;
}

export interface UrlModel extends UpdateUrlModel {
  created_at: string;
  updated_at: string;
}

export interface UrlModelDetail extends UrlModel {
  urlgrp_name: string;
}
