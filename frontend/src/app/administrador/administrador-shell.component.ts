import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-administrador-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container">
      <header class="card" style="margin:1rem 0; display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
        <h1>Administrador</h1>
        <button class="button secondary" (click)="logout()">Cerrar sesion</button>
      </header>
      <nav class="card" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
        <a routerLink="/administrador" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">Home</a>
        <a routerLink="/administrador/usuarios" routerLinkActive="active">Usuarios</a>
        <a routerLink="/administrador/roles" routerLinkActive="active">Roles</a>
        <a routerLink="/administrador/habitaciones" routerLinkActive="active">Habitaciones</a>
        <a routerLink="/administrador/reservas" routerLinkActive="active">Reservas</a>
        <a routerLink="/administrador/eventos" routerLinkActive="active">Eventos</a>
        <a routerLink="/administrador/servicios" routerLinkActive="active">Servicios</a>
        <a routerLink="/administrador/facturas" routerLinkActive="active">Facturas</a>
        <a routerLink="/administrador/pagos" routerLinkActive="active">Pagos</a>
        <a routerLink="/administrador/reportes" routerLinkActive="active">Reportes</a>
      </nav>
      <section class="card">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: ["nav a{padding:.4rem .75rem;border:1px solid var(--border);border-radius:8px;} nav a.active{color:var(--primary);border-color:var(--primary);} "]
})
export class AdministradorShellComponent {
  constructor(private readonly authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
