import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-landing-shell",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <header class="topbar">
        <a class="brand" routerLink="/">
          <span class="brand-mark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14.5 9 L22 9 L16 13.5 L18 21 L12 16.5 L6 21 L8 13.5 L2 9 L9.5 9 Z"
                    fill="var(--gold-500)"/>
            </svg>
          </span>
          <span class="brand-text">
            <strong>Aurea</strong>
            <small>Hotel &amp; Resort System</small>
          </span>
        </a>

        <nav class="nav">
          <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">Inicio</a>
          <a routerLink="/habitaciones" routerLinkActive="active">Habitaciones</a>
          <a routerLink="/eventos" routerLinkActive="active">Eventos</a>
          <a routerLink="/servicios" routerLinkActive="active">Servicios</a>
          <a routerLink="/nosotros" routerLinkActive="active">Nosotros</a>
          <a routerLink="/contacto" routerLinkActive="active">Contacto</a>
        </nav>

        <div class="auth-actions">
          <a class="btn btn-ghost" routerLink="/auth/register">Registrarse</a>
          <a class="btn btn-gold" routerLink="/auth/login">Iniciar sesión</a>
        </div>
      </header>

      <main class="content">
        <router-outlet></router-outlet>
      </main>

      <footer class="site-footer">
        <p>© 2026 Aurea Hotel &amp; Resort System. Todos los derechos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      --navy-900: #0B2540;
      --navy-700: #16395E;
      --navy-600: #1F4A78;
      --gold-500: #C9A227;
      --gold-300: #E3C77E;
      --cream-50: #FBF8F2;
      --ink-700: #233044;
      --white: #FFFFFF;

      display: block;
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--ink-700);
      background: var(--cream-50);
    }

    .shell { min-height: 100vh; display: flex; flex-direction: column; }

    .topbar {
      background: linear-gradient(180deg, var(--navy-900), var(--navy-700));
      color: var(--white);
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 0.9rem 2rem;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 2px 12px rgba(11, 37, 64, 0.25);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: var(--white);
      flex-shrink: 0;
    }
    .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
    .brand-text strong {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      letter-spacing: 0.04em;
    }
    .brand-text small { color: var(--gold-300); font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; }

    .nav { display: flex; gap: 0.4rem; flex: 1; flex-wrap: wrap; }
    .nav a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      font-size: 0.92rem;
      transition: background 0.2s, color 0.2s;
    }
    .nav a:hover { background: rgba(255,255,255,0.08); color: var(--white); }
    .nav a.active { background: var(--gold-500); color: var(--navy-900); font-weight: 600; }

    .auth-actions { display: flex; gap: 0.6rem; flex-shrink: 0; }
    .btn {
      padding: 0.5rem 1.1rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: transform 0.15s, opacity 0.2s;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn-ghost { color: var(--white); border: 1px solid rgba(255,255,255,0.4); }
    .btn-ghost:hover { background: rgba(255,255,255,0.08); }
    .btn-gold { background: var(--gold-500); color: var(--navy-900); }
    .btn-gold:hover { background: var(--gold-300); }

    .content { flex: 1; }

    .site-footer {
      background: var(--navy-900);
      color: rgba(255,255,255,0.6);
      text-align: center;
      padding: 1.2rem;
      font-size: 0.82rem;
    }

    @media (max-width: 900px) {
      .topbar { flex-wrap: wrap; padding: 0.8rem 1.2rem; }
      .nav { order: 3; width: 100%; justify-content: center; }
    }
  `]
})
export class LandingShellComponent {}