import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { map, tap } from "rxjs/operators";

import { ApiService } from "./api.service";
import { AuthResponse, UserRole } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "hrms_token";

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  login(payload: { email: string; password: string }) {
    return this.api.post<AuthResponse>("/auth/login", payload).pipe(
      tap((response) => this.saveAuth(response)),
      map(() => this.getRole())
    );
  }

  register(payload: { nombre: string; email: string; password: string; role: string }) {
    return this.api.post<AuthResponse>("/auth/register", payload).pipe(
      tap((response) => this.saveAuth(response)),
      map(() => this.getRole())
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(["/auth/login"]);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): UserRole | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    const rawRole = payload?.["role"] ?? payload?.["rol"];
    return this.normalizeRole(rawRole);
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    const sub = payload?.["sub"];
    const id = Number(sub);
    return Number.isFinite(id) ? id : null;
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    const username = payload?.["username"];
    return typeof username === "string" ? username : null;
  }

  navigateByRole(role: UserRole | null) {
    if (role === "ADMIN") {
      this.router.navigate(["/administrador"]);
      return;
    }

    if (role === "GERENTE") {
      this.router.navigate(["/gerente"]);
      return;
    }

    this.router.navigate(["/cliente"]);
  }

  private saveAuth(response: AuthResponse) {
    if (!response?.token) return;

    localStorage.setItem(this.tokenKey, response.token);
  }

  private normalizeRole(rawRole: string | undefined): UserRole | null {
    if (!rawRole) return null;

    const role = rawRole.toUpperCase();
    if (role === "CLIENTE") return "CLIENTE";
    if (role === "ADMIN" || role === "ADMINISTRADOR") return "ADMIN";
    if (role === "GERENTE") return "GERENTE";
    return null;
  }

  private decodeToken(token: string): Record<string, any> | null {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return null;
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
