import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";

export const appRoutes: Routes = [
  {
    path: "",
    loadChildren: () => import("./landing/landing.routes").then((m) => m.landingRoutes)
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.routes").then((m) => m.authRoutes)
  },
  {
    path: "cliente",
    canActivate: [authGuard, roleGuard],
    data: { roles: ["CLIENTE"] },
    loadChildren: () => import("./cliente/cliente.routes").then((m) => m.clienteRoutes)
  },
  {
    path: "administrador",
    canActivate: [authGuard, roleGuard],
    data: { roles: ["ADMIN"] },
    loadChildren: () => import("./administrador/administrador.routes").then((m) => m.administradorRoutes)
  },
  {
    path: "gerente",
    canActivate: [authGuard, roleGuard],
    data: { roles: ["GERENTE"] },
    loadChildren: () => import("./gerente/gerente.routes").then((m) => m.gerenteRoutes)
  },
  {
    path: "**",
    redirectTo: ""
  }
];
