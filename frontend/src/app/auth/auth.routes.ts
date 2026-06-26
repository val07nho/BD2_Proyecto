import { Routes } from "@angular/router";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Component } from "@angular/core";

import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="auth-shell">
      <!-- PANEL IZQUIERDO: BRANDING -->
      <aside class="brand-panel">
        <a class="brand" routerLink="/">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L14.5 9 L22 9 L16 13.5 L18 21 L12 16.5 L6 21 L8 13.5 L2 9 L9.5 9 Z" fill="var(--gold-500)"/>
          </svg>
          <span>
            <strong>Aurea</strong>
            <small>Resort &amp; Spa</small>
          </span>
        </a>

        <blockquote>
          "Cada estancia en Aurea está pensada para que solo te preocupes
          de disfrutar."
        </blockquote>

        <a class="back-link" routerLink="/">← Volver al sitio principal</a>
      </aside>

      <!-- PANEL DERECHO: FORMULARIOS -->
      <section class="form-panel">
        <div class="form-panel-inner">
          <nav class="auth-tabs">
            <a routerLink="/auth/login" routerLinkActive="active">Iniciar sesión</a>
            <a routerLink="/auth/register" routerLinkActive="active">Crear cuenta</a>
          </nav>

          <router-outlet></router-outlet>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      --navy-900: #0B2540;
      --navy-700: #16395E;
      --gold-500: #C9A227;
      --gold-300: #E3C77E;
      --cream-50: #FBF8F2;
      --ink-700: #233044;
      --muted: #5C6B80;
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .auth-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* ===== PANEL IZQUIERDO ===== */
    .brand-panel {
      background: linear-gradient(160deg, var(--navy-900), var(--navy-700));
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: white;
    }
    .brand strong {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      display: block;
      letter-spacing: 0.03em;
    }
    .brand small {
      color: var(--gold-300);
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .brand-panel blockquote {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      line-height: 1.4;
      font-style: italic;
      color: rgba(255,255,255,0.92);
      max-width: 420px;
      border-left: 3px solid var(--gold-500);
      padding-left: 1.1rem;
      margin: 0;
    }
    .back-link {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 0.85rem;
    }
    .back-link:hover { color: var(--gold-300); }

    /* ===== PANEL DERECHO ===== */
    .form-panel {
      background: var(--cream-50);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
    }
    .form-panel-inner { width: 100%; max-width: 400px; }

    .auth-tabs {
      display: flex;
      background: white;
      border-radius: 999px;
      padding: 0.3rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(11,37,64,0.06);
    }
    .auth-tabs a {
      flex: 1;
      text-align: center;
      padding: 0.55rem 0;
      border-radius: 999px;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--muted);
      transition: background 0.2s, color 0.2s;
    }
    .auth-tabs a.active {
      background: var(--navy-900);
      color: white;
    }

    @media (max-width: 880px) {
      .auth-shell { grid-template-columns: 1fr; }
      .brand-panel { display: none; }
      .form-panel { padding: 2rem 1.2rem; }
    }
  `]
})
class AuthShellComponent {}

export const authRoutes: Routes = [
  {
    path: "",
    component: AuthShellComponent,
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent },
      { path: "forgot-password", component: ForgotPasswordComponent }
    ]
  }
];