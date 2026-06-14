export interface FilterByUrlGrp {
  id_urlgrp: number;
}

export interface SaveUrlModel {
  name: string;
  link: string;
  is_enable: boolean;
  id_urlgrp: number;
}

export interface UrlModel extends SaveUrlModel {
  id_url: number;
  created_at: string;
  updated_at: string;
}

export interface UrlModelDetail extends UrlModel {
  urlgrp_name: string;
}

export interface UrlModelDetail extends UrlModel {
  urlgrp_name: string;
}
