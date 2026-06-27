import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../core/services/auth.service";

@Component({
  selector: "app-administrador-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-btn" type="button" (click)="toggleSidebar()" aria-label="Abrir menú">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <a routerLink="/" class="brand-logo">
            <span class="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9.2"/>
                <polygon points="15.6 8.4 13.6 13.6 8.4 15.6 10.4 10.4 15.6 8.4"/>
              </svg>
            </span>
            <span class="brand-text">
              <strong>Aurea</strong>
              <small>Resort & Spa</small>
            </span>
          </a>
        </div>

        <div class="topbar-right">
          <button class="icon-btn" type="button" aria-label="Notificaciones">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="badge">1</span>
          </button>

          <div class="profile">
            <div class="profile-text">
              <strong>Administrador</strong>
              <small>Administrador</small>
            </div>
            <span class="profile-avatar">AD</span>
          </div>

          <button class="logout-btn" type="button" (click)="logout()">
            Cerrar sesión
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <path d="M16 17l5-5-5-5"/>
              <path d="M21 12H9"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="body" [class.sidebar-open]="sidebarOpen">
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <a routerLink="/administrador" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 10.5 12 3l9 7.5"/>
                  <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>
                </svg>
              </span>
              Inicio
            </a>

            <a routerLink="/administrador/usuarios" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="8" r="3.2"/>
                  <path d="M2.8 19.5c.6-3.4 3-5.5 6.2-5.5s5.6 2.1 6.2 5.5"/>
                  <path d="M16.2 6.2a3.2 3.2 0 0 1 0 6.3"/>
                  <path d="M18.6 14.3c2.3.6 3.9 2.3 4.3 5.2h-3.4"/>
                </svg>
              </span>
              Usuarios
            </a>

            <a routerLink="/administrador/roles" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3 5 5.8v5.4c0 4.4 2.8 8.2 7 9.8 4.2-1.6 7-5.4 7-9.8V5.8L12 3z"/>
                </svg>
              </span>
              Roles
            </a>

            <a routerLink="/administrador/habitaciones" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
                  <path d="M3 18v2"/>
                  <path d="M21 18v2"/>
                  <path d="M3 13h18"/>
                  <path d="M7 13V9.5A1.5 1.5 0 0 1 8.5 8h2A1.5 1.5 0 0 1 12 9.5V13"/>
                </svg>
              </span>
              Habitaciones
            </a>

            <a routerLink="/administrador/reservas" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2"/>
                  <path d="M3 9.5h18"/>
                  <path d="M8 3v4"/>
                  <path d="M16 3v4"/>
                </svg>
              </span>
              Reservas
            </a>

            <a routerLink="/administrador/eventos" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2"/>
                  <path d="M3 9.5h18"/>
                  <path d="M8 3v4"/>
                  <path d="M16 3v4"/>
                  <path d="M12 12.3 13 14.3 15.2 14.6 13.6 16.1 14 18.3 12 17.2 10 18.3 10.4 16.1 8.8 14.6 11 14.3 12 12.3Z"/>
                </svg>
              </span>
              Eventos
            </a>

            <a routerLink="/administrador/servicios" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 16a9 9 0 0 1 18 0"/>
                  <path d="M2.5 16h19"/>
                  <path d="M12 7V4"/>
                  <path d="M10 4h4"/>
                </svg>
              </span>
              Servicios
            </a>

            <a routerLink="/administrador/facturas" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z"/>
                  <path d="M8.5 8h7"/>
                  <path d="M8.5 11.5h7"/>
                  <path d="M8.5 15h4.5"/>
                </svg>
              </span>
              Facturas
            </a>

            <a routerLink="/administrador/pagos" routerLinkActive="active">
              <span class="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2.5" y="5.5" width="19" height="13" rx="2.2"/>
                  <path d="M2.5 10h19"/>
                  <path d="M6 14.5h5"/>
                </svg>
              </span>
              Pagos
            </a>

            <a routerLink="/administrador/reportes" routerLinkActive="active">
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
            <span class="footer-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9.2"/>
                <polygon points="15.6 8.4 13.6 13.6 8.4 15.6 10.4 10.4 15.6 8.4"/>
              </svg>
            </span>
            <div>
              <strong>Aurea Resort & Spa</strong>
              <small>Administración Hotelera</small>
            </div>
          </div>
        </aside>

        <main class="main-panel">
          <router-outlet></router-outlet>

          <footer class="page-footer">
            © {{ year }} Aurea Resort & Spa. Todos los derechos reservados.
          </footer>
        </main>
      </div>
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

    /* Topbar */
    .topbar {
      flex: 0 0 auto;
      height: 72px;
      background: var(--white);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.6rem;
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--white);
      display: grid;
      place-items: center;
      color: var(--navy-900);
      cursor: pointer;
      flex: 0 0 auto;
    }

    .menu-btn svg {
      width: 19px;
      height: 19px;
    }

    .menu-btn:hover {
      background: var(--cream-50);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: .65rem;
      text-decoration: none;
      color: var(--navy-900);
    }

    .brand-mark {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
      color: var(--navy-950);
      flex: 0 0 auto;
    }

    .brand-mark svg {
      width: 21px;
      height: 21px;
    }

    .brand-text strong {
      display: block;
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
      letter-spacing: .06em;
      text-transform: uppercase;
      line-height: 1;
      color: var(--navy-900);
    }

    .brand-text small {
      display: block;
      color: var(--gold-500);
      font-size: .62rem;
      text-transform: uppercase;
      letter-spacing: .18em;
      font-weight: 800;
      margin-top: .15rem;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-btn {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--white);
      display: grid;
      place-items: center;
      color: var(--navy-900);
      cursor: pointer;
    }

    .icon-btn svg {
      width: 19px;
      height: 19px;
    }

    .icon-btn .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--gold-500);
      color: var(--white);
      font-size: .65rem;
      font-weight: 800;
      display: grid;
      place-items: center;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: .65rem;
    }

    .profile-text {
      text-align: right;
    }

    .profile-text strong {
      display: block;
      font-size: .85rem;
      color: var(--navy-900);
      line-height: 1.1;
    }

    .profile-text small {
      display: block;
      font-size: .72rem;
      color: var(--text-600);
      margin-top: .1rem;
    }

    .profile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
      color: var(--navy-950);
      font-weight: 800;
      font-size: .8rem;
      flex: 0 0 auto;
    }

    .logout-btn {
      height: 42px;
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      border: 1px solid var(--gold-500);
      background: transparent;
      color: var(--navy-900);
      border-radius: 12px;
      padding: 0 .9rem;
      font-weight: 800;
      font-size: .85rem;
      cursor: pointer;
      transition: .22s ease;
      white-space: nowrap;
    }

    .logout-btn svg {
      width: 17px;
      height: 17px;
    }

    .logout-btn:hover {
      background: var(--navy-900);
      color: var(--white);
      border-color: var(--navy-900);
      transform: translateY(-1px);
    }

    /* Body: sidebar + main */
    .body {
      flex: 1;
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 0;
    }

    .sidebar {
      background: linear-gradient(180deg, var(--navy-950), var(--navy-900));
      color: var(--white);
      padding: 1.3rem .9rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: sticky;
      top: 72px;
      align-self: start;
      height: calc(100vh - 72px);
      overflow-y: auto;
      box-shadow: 10px 0 30px rgba(6, 26, 46, .14);
    }

    .sidebar-nav {
      display: grid;
      gap: .35rem;
      flex: 1;
    }

    .sidebar-nav a {
      position: relative;
      display: flex;
      align-items: center;
      gap: .75rem;
      color: rgba(255, 255, 255, .78);
      text-decoration: none;
      padding: .75rem .85rem;
      border-radius: 14px;
      font-size: .92rem;
      font-weight: 650;
      transition: .22s ease;
    }

    .sidebar-nav a:hover {
      color: var(--white);
      background: rgba(255, 255, 255, .08);
    }

    .sidebar-nav a.active {
      background: rgba(255, 255, 255, .12);
      color: var(--white);
      box-shadow: inset 3px 0 0 var(--gold-500);
    }

    .sidebar-nav a.active .nav-icon {
      background: rgba(201, 162, 39, .18);
      color: var(--gold-300);
    }

    .nav-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      color: rgba(255, 255, 255, .82);
      transition: .22s ease;
      flex: 0 0 auto;
    }

    .nav-icon svg {
      width: 18px;
      height: 18px;
    }

    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, .12);
      padding-top: 1rem;
      display: flex;
      gap: .7rem;
      align-items: center;
    }

    .footer-mark {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
      color: var(--navy-950);
      flex: 0 0 auto;
    }

    .footer-mark svg {
      width: 19px;
      height: 19px;
    }

    .sidebar-footer strong {
      display: block;
      color: var(--gold-300);
      font-size: .82rem;
      line-height: 1.2;
    }

    .sidebar-footer small {
      display: block;
      color: rgba(255, 255, 255, .58);
      font-size: .72rem;
      margin-top: .1rem;
    }

    .main-panel {
      min-width: 0;
      padding: 1.4rem 1.6rem 1rem;
      display: grid;
      gap: 1.1rem;
      align-content: start;
    }

    .page-footer {
      margin-top: .8rem;
      text-align: center;
      color: var(--text-600);
      font-size: .8rem;
      padding: 1rem 0 .4rem;
    }

    @media (max-width: 1050px) {
      .body {
        grid-template-columns: 230px 1fr;
      }

      .profile-text {
        display: none;
      }
    }

    @media (max-width: 850px) {
      .body {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: fixed;
        left: 0;
        top: 72px;
        bottom: 0;
        width: 260px;
        height: auto;
        transform: translateX(-100%);
        transition: transform .25s ease;
        z-index: 25;
      }

      .body.sidebar-open .sidebar {
        transform: translateX(0);
      }

      .brand-text {
        display: none;
      }
    }

    @media (max-width: 560px) {
      .topbar {
        padding: 0 1rem;
      }

      .main-panel {
        padding: 1rem;
      }

      .logout-btn span {
        display: none;
      }
    }
  `]
})
export class AdministradorShellComponent {
  sidebarOpen = false;
  year = new Date().getFullYear();

  constructor(private readonly authService: AuthService) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}