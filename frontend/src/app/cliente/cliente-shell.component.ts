import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-cliente-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="topbar">
        <a routerLink="/cliente" class="brand-logo">
          <span class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9.2"/>
              <polygon points="15.6 8.4 13.6 13.6 8.4 15.6 10.4 10.4 15.6 8.4"/>
            </svg>
          </span>
          <span class="brand-text">
            <strong>Aurea</strong>
            <small>Hotel & Resort System</small>
          </span>
        </a>

        <nav class="main-nav">
          <a routerLink="/cliente" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10.5 12 3l9 7.5"/>
              <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>
            </svg>
            Inicio
          </a>

          <a routerLink="/cliente/habitaciones" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
              <path d="M3 18v2"/>
              <path d="M21 18v2"/>
              <path d="M3 13h18"/>
              <path d="M7 13V9.5A1.5 1.5 0 0 1 8.5 8h2A1.5 1.5 0 0 1 12 9.5V13"/>
            </svg>
            Habitaciones
          </a>

          <a routerLink="/cliente/eventos" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <path d="M3 9.5h18"/>
              <path d="M8 3v4"/>
              <path d="M16 3v4"/>
              <path d="M12 12.3 13 14.3 15.2 14.6 13.6 16.1 14 18.3 12 17.2 10 18.3 10.4 16.1 8.8 14.6 11 14.3 12 12.3Z"/>
            </svg>
            Eventos
          </a>

          <a routerLink="/cliente/facturas" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z"/>
              <path d="M8.5 8h7"/>
              <path d="M8.5 11.5h7"/>
              <path d="M8.5 15h4.5"/>
            </svg>
            Facturas
          </a>

          <a routerLink="/cliente/reservas" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <path d="M3 9.5h18"/>
              <path d="M8 3v4"/>
              <path d="M16 3v4"/>
            </svg>
            Reservas
          </a>

          <a routerLink="/cliente/encuestas" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="6" width="14" height="15" rx="2"/>
              <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z"/>
              <path d="M9 11h6"/>
              <path d="M9 15h6"/>
              <path d="M9 19h3"/>
            </svg>
            Encuestas
          </a>

          <a routerLink="/cliente/perfil" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="3.4"/>
              <path d="M5 20c.7-3.6 3.2-5.8 7-5.8s6.3 2.2 7 5.8"/>
            </svg>
            Perfil
          </a>
        </nav>

        <div class="topbar-right">
          <button class="icon-btn" type="button" aria-label="Notificaciones">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="badge">2</span>
          </button>

          <div class="profile" (click)="toggleMenu()">
            <span class="profile-avatar">AG</span>
            <div class="profile-text">
              <strong>Ana García</strong>
              <small>Cliente</small>
            </div>
            <svg class="chevron" [class.open]="menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>

            @if (menuOpen) {
              <div class="dropdown">
                <a routerLink="/cliente/perfil">Mi perfil</a>
                <a routerLink="/cliente/preferencias">Preferencias</a>
                <button type="button" (click)="logout()">Cerrar sesión</button>
              </div>
            }
          </div>
        </div>
      </header>

      <main class="main-panel">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --navy-950: #061A2E;
      --navy-900: #0B2540;
      --navy-800: #123456;
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

    * {
      box-sizing: border-box;
    }

    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      flex: 0 0 auto;
      height: 72px;
      background: var(--navy-950);
      display: flex;
      align-items: center;
      gap: 1.4rem;
      padding: 0 1.6rem;
      position: sticky;
      top: 0;
      z-index: 30;
      box-shadow: 0 12px 28px rgba(6, 26, 46, .18);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: .65rem;
      text-decoration: none;
      color: var(--white);
      flex: 0 0 auto;
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

    .brand-mark svg {
      width: 20px;
      height: 20px;
    }

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

    .main-nav {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .25rem;
      overflow-x: auto;
    }

    .main-nav a {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      color: rgba(255, 255, 255, .72);
      text-decoration: none;
      padding: .55rem .8rem;
      border-radius: 10px;
      font-size: .83rem;
      font-weight: 650;
      white-space: nowrap;
      transition: .18s ease;
    }

    .main-nav a svg {
      width: 16px;
      height: 16px;
    }

    .main-nav a:hover {
      color: var(--white);
      background: rgba(255, 255, 255, .07);
    }

    .main-nav a.active {
      background: var(--navy-800);
      color: var(--white);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 0 0 auto;
    }

    .icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, .14);
      background: rgba(255, 255, 255, .04);
      display: grid;
      place-items: center;
      color: var(--white);
      cursor: pointer;
    }

    .icon-btn svg {
      width: 18px;
      height: 18px;
    }

    .icon-btn .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 17px;
      height: 17px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--gold-500);
      color: var(--navy-950);
      font-size: .62rem;
      font-weight: 800;
      display: grid;
      place-items: center;
    }

    .profile {
      position: relative;
      display: flex;
      align-items: center;
      gap: .6rem;
      cursor: pointer;
      padding: .3rem .4rem;
      border-radius: 12px;
      transition: .18s ease;
    }

    .profile:hover {
      background: rgba(255, 255, 255, .06);
    }

    .profile-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #F0B84B, var(--gold-500));
      color: var(--navy-950);
      font-weight: 800;
      font-size: .8rem;
      flex: 0 0 auto;
    }

    .profile-text {
      text-align: left;
    }

    .profile-text strong {
      display: block;
      font-size: .85rem;
      color: var(--white);
      line-height: 1.1;
    }

    .profile-text small {
      display: block;
      font-size: .7rem;
      color: rgba(255, 255, 255, .55);
      margin-top: .1rem;
    }

    .chevron {
      width: 15px;
      height: 15px;
      color: rgba(255, 255, 255, .65);
      transition: transform .18s ease;
    }

    .chevron.open {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 190px;
      background: var(--white);
      border-radius: 14px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      padding: .5rem;
      display: grid;
      gap: .15rem;
      z-index: 40;
    }

    .dropdown a,
    .dropdown button {
      display: block;
      width: 100%;
      text-align: left;
      padding: .55rem .7rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--navy-900);
      font-size: .85rem;
      font-weight: 650;
      font-family: inherit;
      cursor: pointer;
      text-decoration: none;
    }

    .dropdown a:hover,
    .dropdown button:hover {
      background: var(--cream-50);
    }

    .main-panel {
      flex: 1;
      padding: 1.5rem 2rem 2.2rem;
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
    }

    @media (max-width: 1100px) {
      .main-nav a span {
        display: none;
      }

      .brand-text {
        display: none;
      }
    }

    @media (max-width: 900px) {
      .main-nav {
        display: none;
      }

      .topbar {
        gap: 1rem;
      }

      .topbar-right {
        margin-left: auto;
      }
    }

    @media (max-width: 560px) {
      .topbar {
        padding: 0 1rem;
      }

      .profile-text {
        display: none;
      }

      .main-panel {
        padding: 1.1rem;
      }
    }
  `]
})
export class ClienteShellComponent {
  menuOpen = false;

  constructor(private readonly authService: AuthService) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}