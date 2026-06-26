import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly apiBase = "http://localhost:4000/api";

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string) {
    return this.http.get<T>(`${this.apiBase}${path}`);
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${this.apiBase}${path}`, body);
  }

  put<T>(path: string, body: unknown) {
    return this.http.put<T>(`${this.apiBase}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.apiBase}${path}`);
  }
}
