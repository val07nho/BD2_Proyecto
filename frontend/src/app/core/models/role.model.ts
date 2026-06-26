export type UserRole = "ADMIN" | "CLIENTE" | "GERENTE";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}
