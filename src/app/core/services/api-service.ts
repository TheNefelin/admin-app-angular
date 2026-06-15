import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class ApiService {
  private http = inject(HttpClient);
  
  getAll<T>(resource: string) {
    return this.http.get<T>(`/ssr-api/${resource}`);
  }

  getById<T>(resource: string, id: number) {
    return this.http.get<T>(`/ssr-api/${resource}/${id}`);
  }

  create<T, TBody>(resource: string, body: TBody) {
    return this.http.post<T>(`/ssr-api/${resource}`, body);
  }

  update<T, TBody>(resource: string, id: number, body: TBody) {
    return this.http.put<T>(`/ssr-api/${resource}/${id}`, body);
  } 

  delete<T>(resource: string, id: number) {
    return this.http.delete<T>(`/ssr-api/${resource}/${id}`);
  } 

  upload<T>(resource: string, id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<T>(`/ssr-api/${resource}/${id}/upload-image`, formData);
  }

  deleteResource<T>(resource: string, id: number) {
    return this.http.delete<T>(`/ssr-api/${resource}/${id}/image`);
  }
}
