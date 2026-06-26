import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from "@angular/forms";
import { RouterLink } from "@angular/router";

import { AuthService } from "../../core/services/auth.service";

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get("password")?.value;
  const confirm = control.get("confirmPassword")?.value;

  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card">

      <h2>Crear cuenta</h2>
      <p class="subtitle">
        Regístrate para comenzar a reservar habitaciones y servicios.
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

        <label>
          Nombre completo
          <input
            type="text"
            formControlName="nombre"
            placeholder="Juan Pérez">
        </label>

        <label>
          Correo electrónico
          <input
            type="email"
            formControlName="email"
            placeholder="correo@ejemplo.com">
        </label>

        <label>
          Contraseña
          <input
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            placeholder="Mínimo 6 caracteres">
        </label>

        <label>
          Confirmar contraseña
          <input
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="confirmPassword"
            placeholder="Repite tu contraseña">
        </label>

        <button
          class="show-btn"
          type="button"
          (click)="hidePassword=!hidePassword">

          {{hidePassword ? 'Mostrar contraseña' : 'Ocultar contraseña'}}

        </button>

        @if(form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched){
          <p class="error-msg">
            Las contraseñas no coinciden.
          </p>
        }

        @if(error){
          <p class="error-msg">
            {{error}}
          </p>
        }

        <button
          class="btn-gold"
          type="submit"
          [disabled]="form.invalid || loading">

          {{loading ? 'Creando cuenta...' : 'Crear cuenta'}}

        </button>

      </form>

      <p class="switch-msg">
        ¿Ya tienes una cuenta?
        <a routerLink="/auth/login">
          Inicia sesión
        </a>
      </p>

    </div>
  `,
  styles: [`
    :host{
      --navy:#0B2540;
      --gold:#C9A227;
      --gold-light:#E3C77E;
      --muted:#667085;
      display:block;
    }

    .auth-card h2{
      font-family:'Playfair Display',serif;
      color:var(--navy);
      margin-bottom:.3rem;
    }

    .subtitle{
      color:var(--muted);
      margin-bottom:1.5rem;
    }

    .form-grid{
      display:grid;
      gap:1rem;
    }

    label{
      display:flex;
      flex-direction:column;
      gap:.35rem;
      font-weight:600;
      color:var(--navy);
      font-size:.9rem;
    }

    input{
      padding:.75rem;
      border:1px solid #d9dee6;
      border-radius:10px;
      transition:.25s;
      font-size:.9rem;
    }

    input:focus{
      outline:none;
      border-color:var(--gold);
      box-shadow:0 0 0 3px rgba(201,162,39,.15);
    }

    .show-btn{
      background:none;
      border:none;
      color:var(--navy);
      cursor:pointer;
      font-size:.82rem;
      justify-self:end;
    }

    .btn-gold{
      background:linear-gradient(90deg,#C9A227,#E3C77E);
      border:none;
      padding:.85rem;
      border-radius:10px;
      font-weight:700;
      cursor:pointer;
      transition:.25s;
      color:#0B2540;
    }

    .btn-gold:hover{
      transform:translateY(-2px);
    }

    .btn-gold:disabled{
      opacity:.6;
      cursor:not-allowed;
    }

    .error-msg{
      color:#b91c1c;
      font-size:.85rem;
      margin:0;
    }

    .switch-msg{
      margin-top:1.5rem;
      text-align:center;
      color:var(--muted);
    }

    .switch-msg a{
      color:var(--navy);
      font-weight:600;
      text-decoration:none;
    }
  `]
})
export class RegisterComponent {

  loading = false;
  error = "";
  hidePassword = true;

  readonly form = this.fb.group({
    nombre: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
    confirmPassword: ["", Validators.required]
  }, { validators: passwordMatchValidator });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService
  ) {}

  onSubmit() {

    if (this.form.invalid) return;

    this.loading = true;
    this.error = "";

    const usuario = {
      nombre: this.form.value.nombre!,
      email: this.form.value.email!,
      password: this.form.value.password!,
      role: "CLIENTE"
    };

    this.auth.register(usuario).subscribe({
      next: role => this.auth.navigateByRole(role),

      error: () => {
        this.loading = false;
        this.error = "No se pudo crear la cuenta.";
      },

      complete: () => this.loading = false
    });

  }

}