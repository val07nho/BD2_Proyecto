import { AuthUser } from "./role.model";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: "CLIENTE" | "ADMIN" | "GERENTE";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
