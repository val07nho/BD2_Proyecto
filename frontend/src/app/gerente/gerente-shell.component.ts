import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-gerente-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container">
      <header class="card" style="margin:1rem 0; display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
        <h1>Gerente</h1>
        <button class="button secondary" (click)="logout()">Cerrar sesion</button>
      </header>
      <nav class="card" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
        <a routerLink="/gerente" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">Home</a>
        <a routerLink="/gerente/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/gerente/ocupacion" routerLinkActive="active">Ocupacion</a>
        <a routerLink="/gerente/ingresos" routerLinkActive="active">Ingresos</a>
        <a routerLink="/gerente/facturacion" routerLinkActive="active">Facturacion</a>
        <a routerLink="/gerente/encuestas" routerLinkActive="active">Encuestas</a>
        <a routerLink="/gerente/preferencias" routerLinkActive="active">Preferencias</a>
        <a routerLink="/gerente/reportes" routerLinkActive="active">Reportes</a>
      </nav>
      <section class="card">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: ["nav a{padding:.4rem .75rem;border:1px solid var(--border);border-radius:8px;} nav a.active{color:var(--primary);border-color:var(--primary);} "]
})
export class GerenteShellComponent {
  constructor(private readonly authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
