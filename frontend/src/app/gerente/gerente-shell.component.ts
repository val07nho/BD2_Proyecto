import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-gerente-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="topbar">
        <a routerLink="/gerente" class="brand-logo">
          <span class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9.2"/>
              <polygon points="15.6 8.4 13.6 13.6 8.4 15.6 10.4 10.4 15.6 8.4"/>
            </svg>
          </span>
          <span class="brand-text">
            <strong>Aurea</strong>
            <small>Gerencia Hotelera</small>
          </span>
        </a>

        <div class="topbar-right">
          <div class="profile">
            <div class="profile-text">
              <strong>Gerente</strong>
              <small>Reportes ejecutivos</small>
            </div>
            <span class="profile-avatar">GE</span>
          </div>

          <button class="logout-btn" type="button" (click)="logout()">
            Cerrar sesion
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <path d="M16 17l5-5-5-5"/>
              <path d="M21 12H9"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="body">
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <a routerLink="/gerente" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 10.5 12 3l9 7.5"/>
                  <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>
                </svg>
              </span>
              Dashboard
            </a>

            <a routerLink="/gerente/ocupacion" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
                  <path d="M3 18v2"/>
                  <path d="M21 18v2"/>
                  <path d="M3 13h18"/>
                </svg>
              </span>
              Ocupacion
            </a>

            <a routerLink="/gerente/ingresos" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v10"/>
                  <path d="M15 9.5c0-1.4-1.3-2.3-3-2.3s-3 .9-3 2.1c0 1.3 1.2 1.8 3 2.2 2 .5 3.3 1 3.3 2.4 0 1.3-1.4 2.1-3.3 2.1-1.8 0-3.1-.8-3.3-2.1"/>
                </svg>
              </span>
              Ingresos
            </a>

            <a routerLink="/gerente/facturacion" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z"/>
                  <path d="M8.5 8h7"/>
                  <path d="M8.5 12h7"/>
                  <path d="M8.5 16h4.5"/>
                </svg>
              </span>
              Facturacion
            </a>

            <a routerLink="/gerente/encuestas" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="6" width="14" height="15" rx="2"/>
                  <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z"/>
                  <path d="M9 11h6"/>
                  <path d="M9 15h6"/>
                </svg>
              </span>
              Encuestas
            </a>

            <a routerLink="/gerente/preferencias" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z"/>
                  <circle cx="12" cy="9" r="2.4"/>
                </svg>
              </span>
              Preferencias
            </a>

            <a routerLink="/gerente/reportes" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 20h16"/>
                  <path d="M7 20v-7"/>
                  <path d="M12 20V6"/>
                  <path d="M17 20v-11"/>
                </svg>
              </span>
              Reportes
            </a>
          </nav>

          <div class="sidebar-footer">
            <span class="footer-mark">A</span>
            <div>
              <strong>Aurea Resort & Spa</strong>
              <small>Gestion ejecutiva</small>
            </div>
          </div>
        </aside>

        <main class="main-panel">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --navy-950: #061A2E;
      --navy-900: #0B2540;
      --gold-500: #C9A227;
      --gold-300: #E3C77E;
      --cream-50: #FBF8F2;
      --white: #FFFFFF;
      --text-900: #0B2540;
      --text-600: #667085;
      --border: #E7EAF0;
      --shadow: 0 18px 40px rgba(11, 37, 64, .10);
      display: block;
      min-height: 100vh;
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--cream-50);
      color: var(--text-900);
    }

    * { box-sizing: border-box; }

    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      height: 72px;
      background: var(--navy-950);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0 1.6rem;
      position: sticky;
      top: 0;
      z-index: 30;
      box-shadow: 0 12px 28px rgba(6, 26, 46, .18);
    }

    .brand-logo, .topbar-right, .profile, .logout-btn, .sidebar-footer {
      display: flex;
      align-items: center;
    }

    .brand-logo {
      gap: .65rem;
      text-decoration: none;
      color: var(--white);
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
      color: var(--navy-950);
      flex: 0 0 auto;
    }

    .brand-mark svg { width: 20px; height: 20px; }

    .brand-text strong {
      display: block;
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem;
      letter-spacing: .06em;
      text-transform: uppercase;
      line-height: 1;
      color: var(--white);
    }

    .brand-text small {
      display: block;
      color: var(--gold-300);
      font-size: .58rem;
      text-transform: uppercase;
      letter-spacing: .16em;
      font-weight: 800;
      margin-top: .15rem;
    }

    .topbar-right { gap: .9rem; color: var(--white); }
    .profile { gap: .65rem; }
    .profile-text { text-align: right; }
    .profile-text strong { display: block; font-size: .9rem; }
    .profile-text small { color: rgba(255,255,255,.65); font-size: .72rem; }

    .profile-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.18);
      color: var(--gold-300);
      font-weight: 900;
      font-size: .78rem;
    }

    .logout-btn {
      gap: .45rem;
      border: 1px solid rgba(255,255,255,.2);
      background: rgba(255,255,255,.08);
      color: var(--white);
      border-radius: 10px;
      padding: .55rem .75rem;
      font-weight: 800;
      cursor: pointer;
    }

    .logout-btn svg { width: 17px; height: 17px; }

    .body {
      display: grid;
      grid-template-columns: 270px 1fr;
      min-height: calc(100vh - 72px);
    }

    .sidebar {
      background: var(--white);
      border-right: 1px solid var(--border);
      padding: 1.1rem .9rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 10px 0 30px rgba(11, 37, 64, .04);
    }

    .sidebar-nav {
      display: grid;
      gap: .35rem;
    }

    .sidebar-nav a {
      min-height: 42px;
      display: flex;
      align-items: center;
      gap: .65rem;
      padding: .62rem .7rem;
      border-radius: 10px;
      color: var(--text-600);
      text-decoration: none;
      font-weight: 800;
      font-size: .9rem;
      transition: background .18s ease, color .18s ease;
    }

    .sidebar-nav a.active,
    .sidebar-nav a:hover {
      background: #F7F0DF;
      color: var(--navy-900);
    }

    .nav-icon {
      width: 30px;
      height: 30px;
      border-radius: 9px;
      display: grid;
      place-items: center;
      background: #F7F8FA;
      color: var(--navy-900);
      flex: 0 0 auto;
    }

    .sidebar-nav a.active .nav-icon {
      background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
      color: var(--navy-950);
    }

    .nav-icon svg { width: 17px; height: 17px; }

    .sidebar-footer {
      gap: .65rem;
      border-top: 1px solid var(--border);
      padding-top: .9rem;
      color: var(--text-900);
    }

    .footer-mark {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: var(--navy-950);
      color: var(--gold-300);
      font-family: 'Playfair Display', serif;
      font-weight: 900;
    }

    .sidebar-footer strong { display: block; font-size: .82rem; }
    .sidebar-footer small { display: block; color: var(--text-600); font-size: .72rem; margin-top: .1rem; }

    .main-panel {
      padding: 1.35rem;
      overflow: min(100%, auto);
    }

    @media (max-width: 980px) {
      .body { grid-template-columns: 1fr; }
      .sidebar { position: static; border-right: 0; border-bottom: 1px solid var(--border); }
      .sidebar-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .profile-text { display: none; }
    }

    @media (max-width: 640px) {
      .topbar { padding: 0 .9rem; }
      .brand-text small, .logout-btn { display: none; }
      .sidebar-nav { grid-template-columns: 1fr; }
      .main-panel { padding: .9rem; }
    }
  `]
})
export class GerenteShellComponent {
  constructor(private readonly authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
