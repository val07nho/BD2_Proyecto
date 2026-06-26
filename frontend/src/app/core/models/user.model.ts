export type UserRole = "CLIENTE" | "ADMIN" | "GERENTE";

export interface AuthUser {
  id?: number | string;
  nombre?: string;
  email?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user?: Partial<AuthUser> & { role?: string; rol?: string };
}
