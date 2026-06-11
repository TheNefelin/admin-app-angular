import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class ApiService {
  private http = inject(HttpClient);
  
  getAll<T>(resource: string) {
    return this.http.get<T>(`/api/${resource}`);
  }

  getById<T>(resource: string, id: number) {
    return this.http.get<T>(`/api/${resource}/${id}`);
  }

  create<T, TBody>(resource: string, body: TBody) {
    return this.http.post<T>(`/api/${resource}`, body);
  }

  update<T, TBody>(resource: string, id: number, body: TBody) {
    return this.http.put<T>(`/api/${resource}/${id}`, body);
  } 

  delete<T>(resource: string, id: number) {
    return this.http.delete<T>(`/api/${resource}/${id}`);
  } 
}
