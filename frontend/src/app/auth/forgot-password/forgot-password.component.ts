import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Recuperar contraseña</h2>
      <p class="subtitle">Te enviaremos un enlace para restablecerla.</p>

      @if (!sent) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
          <label>
            Email
            <input type="email" formControlName="email" placeholder="tu@email.com" />
          </label>
          <button class="btn-gold" type="submit" [disabled]="form.invalid">Enviar enlace</button>
        </form>
      } @else {
        <div class="success-box">
          <p>✅ Si el email existe en nuestro sistema, recibirás un enlace en breve.</p>
        </div>
      }

      <p class="switch-msg">
        <a routerLink="/auth/login">← Volver a iniciar sesión</a>
      </p>
    </div>
  `,
  styles: [`
    :host {
      --navy-900: #0B2540;
      --gold-500: #C9A227;
      --gold-300: #E3C77E;
      --muted: #5C6B80;
      display: block;
    }
    .auth-card h2 {
      font-family: 'Playfair Display', serif;
      color: var(--navy-900);
      font-size: 1.6rem;
      margin: 0 0 0.3rem;
    }
    .subtitle { color: var(--muted); font-size: 0.9rem; margin: 0 0 1.6rem; }

    .form-grid { display: grid; gap: 1.1rem; }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--navy-900);
    }
    input {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border: 1px solid #D9DEE6;
      border-radius: 8px;
      font-size: 0.92rem;
      font-family: inherit;
      box-sizing: border-box;
    }
    input:focus { outline: none; border-color: var(--gold-500); }

    .btn-gold {
      background: var(--gold-500);
      color: var(--navy-900);
      border: none;
      border-radius: 8px;
      padding: 0.75rem;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-gold:hover:not(:disabled) { background: var(--gold-300); }
    .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }

    .success-box {
      background: #ECFDF3;
      border: 1px solid #A6E9C5;
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.88rem;
      color: #047857;
    }

    .switch-msg {
      text-align: center;
      font-size: 0.85rem;
      margin-top: 1.6rem;
    }
    .switch-msg a { color: var(--muted); text-decoration: none; }
    .switch-msg a:hover { color: var(--navy-900); }
  `]
})
export class ForgotPasswordComponent {
  sent = false;

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]]
  });

  constructor(private readonly fb: FormBuilder) {}

  onSubmit() {
    if (this.form.invalid) return;
    // 👉 Aquí va la llamada real, ej: this.auth.solicitarRecuperacion(...)
    this.sent = true;
  }
}