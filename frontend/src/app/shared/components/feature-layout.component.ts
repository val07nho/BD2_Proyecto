import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-feature-layout",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container">
      <header class="layout-header card">
        <h1>{{ title }}</h1>
        <button class="button secondary" (click)="logout.emit()" *ngIf="showLogout">Cerrar sesion</button>
      </header>

      <nav class="layout-nav card">
        <a *ngFor="let link of links" [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: link.exact ?? false }">
          {{ link.label }}
        </a>
      </nav>

      <section class="card">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: [
    `.layout-header { display:flex; justify-content:space-between; align-items:center; margin:1rem 0; }
     .layout-nav { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem; }
     .layout-nav a { padding:0.5rem 0.8rem; border-radius:8px; border:1px solid var(--border); }
     .layout-nav a.active { border-color:var(--primary); color:var(--primary); }`
  ]
})
export class FeatureLayoutComponent {
  @Input({ required: true }) title = "";
  @Input() showLogout = false;
  @Input({ required: true }) links: Array<{ path: string; label: string; exact?: boolean }> = [];
  @Input() logout = { emit: () => void 0 };
}
