import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Bienvenido de nuevo</h2>
      <p class="subtitle">Inicia sesión para gestionar tus reservas.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

        <label>
          Correo electrónico
          <div class="input-box">
            <span>✉</span>
            <input
              type="email"
              formControlName="email"
              placeholder="correo@ejemplo.com">
          </div>
        </label>

        @if(form.controls.email.invalid && form.controls.email.touched){
          <small class="field-error">Ingresa un correo válido.</small>
        }

        <label>
          Contraseña
          <div class="input-box">
            <span>🔒</span>
            <input
              [type]="hidePassword ? 'password' : 'text'"
              formControlName="password"
              placeholder="••••••••">
            <button
              type="button"
              class="eye-btn"
              (click)="hidePassword = !hidePassword">
              {{ hidePassword ? '👁' : '🙈' }}
            </button>
          </div>
        </label>

        @if(form.controls.password.invalid && form.controls.password.touched){
          <small class="field-error">La contraseña es obligatoria.</small>
        }

        <div class="login-options">
          <label class="remember">
            <input type="checkbox" formControlName="remember">
            Recordarme
          </label>

          <a routerLink="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
        </div>

        @if(error){
          <p class="error-msg">{{ error }}</p>
        }

        <button
          class="btn-gold"
          type="submit"
          [disabled]="form.invalid || loading">

          @if(loading){
            <span class="spinner"></span>
          }

          <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
        </button>
      </form>

      <p class="switch-msg">
        ¿No tienes cuenta?
        <a routerLink="/auth/register">Regístrate aquí</a>
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

    .auth-card {
      animation: fadeIn .35s ease;
    }

    .auth-card h2 {
      font-family: 'Playfair Display', serif;
      color: var(--navy-900);
      font-size: 1.75rem;
      margin: 0 0 .35rem;
    }

    .subtitle {
      color: var(--muted);
      font-size: .92rem;
      margin: 0 0 1.6rem;
      line-height: 1.5;
    }

    .form-grid {
      display: grid;
      gap: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: .4rem;
      font-size: .85rem;
      font-weight: 700;
      color: var(--navy-900);
    }

    .input-box {
      display: flex;
      align-items: center;
      gap: .55rem;
      background: white;
      border: 1px solid #D9DEE6;
      border-radius: 12px;
      padding: 0 .75rem;
      transition: .25s;
    }

    .input-box:focus-within {
      border-color: var(--gold-500);
      box-shadow: 0 0 0 3px rgba(201,162,39,.16);
    }

    .input-box span {
      font-size: .95rem;
    }

    input {
      width: 100%;
      padding: .78rem 0;
      border: none;
      outline: none;
      font-size: .92rem;
      font-family: inherit;
      background: transparent;
      box-sizing: border-box;
      color: var(--navy-900);
    }

    input::placeholder {
      color: #98A2B3;
    }

    .eye-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
    }

    .login-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .8rem;
      margin-top: -.2rem;
    }

    .remember {
      flex-direction: row;
      align-items: center;
      gap: .4rem;
      font-weight: 600;
      font-size: .82rem;
      color: var(--muted);
    }

    .remember input {
      width: auto;
    }

    .login-options a {
      font-size: .82rem;
      color: var(--muted);
      text-decoration: none;
      font-weight: 600;
    }

    .login-options a:hover {
      color: var(--navy-900);
    }

    .btn-gold {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      background: linear-gradient(90deg, #C9A227, #E3C77E);
      color: var(--navy-900);
      border: none;
      border-radius: 12px;
      padding: .85rem;
      font-weight: 800;
      font-size: .94rem;
      cursor: pointer;
      transition: .25s;
      box-shadow: 0 10px 22px rgba(201,162,39,.25);
    }

    .btn-gold:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 26px rgba(201,162,39,.32);
    }

    .btn-gold:disabled {
      opacity: .6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .spinner {
      width: 15px;
      height: 15px;
      border: 2px solid rgba(11,37,64,.25);
      border-top-color: var(--navy-900);
      border-radius: 50%;
      animation: spin .75s linear infinite;
    }

    .field-error {
      color: #B3261E;
      font-size: .78rem;
      margin-top: -.65rem;
    }

    .error-msg {
      color: #B3261E;
      background: rgba(179,38,30,.08);
      border: 1px solid rgba(179,38,30,.15);
      padding: .7rem;
      border-radius: 10px;
      font-size: .85rem;
      margin: 0;
      text-align: center;
    }

    .switch-msg {
      text-align: center;
      font-size: .86rem;
      color: var(--muted);
      margin-top: 1.6rem;
    }

    .switch-msg a {
      color: var(--navy-900);
      font-weight: 800;
      text-decoration: none;
    }

    .switch-msg a:hover {
      color: var(--gold-500);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media(max-width: 480px) {
      .login-options {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent {
  loading = false;
  error = "";
  hidePassword = true;

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
    remember: [false]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService
  ) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = "";

    const value = {
      email: this.form.value.email!,
      password: this.form.value.password!
    };

    this.auth.login(value).subscribe({
      next: (role) => this.auth.navigateByRole(role),
      error: () => {
        this.error = "No se pudo iniciar sesión. Verifica tus credenciales.";
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}