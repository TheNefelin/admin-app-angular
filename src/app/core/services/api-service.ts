import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class ApiService {
  private http = inject(HttpClient);

  getAll<T>(namespace: string, resource: string) {
    return this.http.get<T>(`/ssr-api/${namespace}/${resource}`);
  }

  getById<T>(namespace: string, resource: string, id: number) {
    return this.http.get<T>(`/ssr-api/${namespace}/${resource}/${id}`);
  }

  create<T, TBody>(namespace: string, resource: string, body: TBody) {
    return this.http.post<T>(`/ssr-api/${namespace}/${resource}`, body);
  }

  update<T, TBody>(namespace: string, resource: string, id: number, body: TBody) {
    return this.http.put<T>(`/ssr-api/${namespace}/${resource}/${id}`, body);
  } 

  delete<T>(namespace: string, resource: string, id: number) {
    return this.http.delete<T>(`/ssr-api/${namespace}/${resource}/${id}`);
  } 

  upload<T>(namespace: string, resource: string, id: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<T>(`/ssr-api/${namespace}/${resource}/${id}/upload-image`, formData);
  }

  deleteResource<T>(namespace: string, resource: string, id: number) {
    return this.http.delete<T>(`/ssr-api/${namespace}/${resource}/${id}/image`);
  }
}
