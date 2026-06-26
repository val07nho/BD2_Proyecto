import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-cliente-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container">
      <header class="card" style="margin:1rem 0; display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
        <h1>Cliente</h1>
        <button class="button secondary" (click)="logout()">Cerrar sesion</button>
      </header>
      <nav class="card" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
        <a routerLink="/cliente" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">Home</a>
        <a routerLink="/cliente/habitaciones" routerLinkActive="active">Habitaciones</a>
        <a routerLink="/cliente/reservas" routerLinkActive="active">Reservas</a>
        <a routerLink="/cliente/eventos" routerLinkActive="active">Eventos</a>
        <a routerLink="/cliente/facturas" routerLinkActive="active">Facturas</a>
        <a routerLink="/cliente/perfil" routerLinkActive="active">Perfil</a>
        <a routerLink="/cliente/preferencias" routerLinkActive="active">Preferencias</a>
        <a routerLink="/cliente/encuestas" routerLinkActive="active">Encuestas</a>
      </nav>
      <section class="card">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: ["nav a{padding:.4rem .75rem;border:1px solid var(--border);border-radius:8px;} nav a.active{color:var(--primary);border-color:var(--primary);} "]
})
export class ClienteShellComponent {
  constructor(private readonly authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
