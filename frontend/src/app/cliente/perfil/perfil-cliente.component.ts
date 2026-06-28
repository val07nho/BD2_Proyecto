import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface HuespedOracle {
  ID_HUESPED: number;
  ID_USUARIO: number | null;
  NOMBRES?: string | null;
  APELLIDOS?: string | null;
  TIPO_DOCUMENTO?: string | null;
  NUMERO_DOCUMENTO?: string | null;
  TELEFONO?: string | null;
  CORREO?: string | null;
  NACIONALIDAD?: string | null;
}

interface PerfilMongo {
  idHuesped: number;
  preferencias?: {
    tipoHabitacion?: string;
    vista?: string;
    tipoCama?: string;
    temperatura?: number;
    almohada?: string;
    dieta?: string[];
    serviciosFavoritos?: string[];
  };
  idiomas?: string[];
  fechaCreacion?: string | Date;
  ultimaConexion?: string | Date;
}

@Component({
  selector: "app-perfil-cliente",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="perfil-container">

      <!-- Top Bar: solo el badge de ultima conexion, alineado a la derecha -->
      <div class="top-nav-row">
        <div></div>
        <div class="connection-badge">
          <i class="icon-clock"></i>
          <div>
            <small>Ultima conexion</small>
            <strong>{{ formatearFecha(ultimaConexion) }}</strong>
          </div>
        </div>
      </div>

      <!-- Main Title -->
      <div class="title-block">
        <h1>Mi perfil</h1>
        <p>Gestiona tus preferencias y personaliza tu experiencia en Aurea Resort & Spa.</p>
      </div>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }
      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      @if (cargando) {
        <div class="loading-state">Cargando tu perfil...</div>
      } @else {
        <form [formGroup]="perfilForm" (ngSubmit)="guardarCambios()" class="profile-layout-grid">

          <!-- COLUMNA IZQUIERDA: Datos Personales e Idiomas -->
          <div class="column-left">

            <!-- Tarjeta: Datos Personales (Oracle) -->
            <div class="profile-card">
              <h2 class="card-title">Datos personales</h2>

              <div class="form-inputs-stack">
                <div class="form-field-row">
                  <label><i class="icon-user"></i> Nombres</label>
                  <input type="text" formControlName="nombres" placeholder="Ana Maria" />
                </div>

                <div class="form-field-row">
                  <label><i class="icon-user"></i> Apellidos</label>
                  <input type="text" formControlName="apellidos" placeholder="Garcia Lopez" />
                </div>

                <div class="form-field-row">
                  <label><i class="icon-file-text"></i> Tipo de documento</label>
                  <div class="select-wrapper">
                    <select formControlName="tipoDocumento">
                      <option value="DNI">DNI</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                </div>

                <div class="form-field-row">
                  <label><i class="icon-credit-card"></i> Numero de documento</label>
                  <input type="text" formControlName="numeroDocumento" />
                </div>

                <div class="form-field-row">
                  <label><i class="icon-mail"></i> Correo electronico</label>
                  <input type="email" formControlName="correo" />
                </div>

                <div class="form-field-row">
                  <label><i class="icon-globe"></i> Nacionalidad</label>
                  <input type="text" formControlName="nacionalidad" />
                </div>

                <div class="form-field-row">
                  <label><i class="icon-phone"></i> Telefono</label>
                  <input type="text" formControlName="telefono" placeholder="999 000 002" />
                </div>
              </div>
            </div>

            <!-- Tarjeta: Idiomas (MongoDB) -->
            <div class="profile-card">
              <h2 class="card-title">Idiomas</h2>
              <div class="checkbox-vertical-list">
                <label class="custom-checkbox">
                  <input type="checkbox" (change)="onIdiomaChange($event, 'Espanol')" [checked]="checkIdioma('Espanol')" />
                  <span class="box-indicator"></span> Espanol
                </label>
                <label class="custom-checkbox">
                  <input type="checkbox" (change)="onIdiomaChange($event, 'Ingles')" [checked]="checkIdioma('Ingles')" />
                  <span class="box-indicator"></span> Ingles
                </label>
                <label class="custom-checkbox">
                  <input type="checkbox" (change)="onIdiomaChange($event, 'Frances')" [checked]="checkIdioma('Frances')" />
                  <span class="box-indicator"></span> Frances
                </label>
                <label class="custom-checkbox">
                  <input type="checkbox" (change)="onIdiomaChange($event, 'Aleman')" [checked]="checkIdioma('Aleman')" />
                  <span class="box-indicator"></span> Aleman
                </label>
                <label class="custom-checkbox">
                  <input type="checkbox" (change)="onIdiomaChange($event, 'Portugues')" [checked]="checkIdioma('Portugues')" />
                  <span class="box-indicator"></span> Portugues
                </label>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: Preferencias e Info Adicional -->
          <div class="column-right">

            <!-- Tarjeta: Preferencias de estancia (MongoDB) -->
            <div class="profile-card expansion-card">
              <h2 class="card-title">Preferencias de estancia</h2>

              <div class="preferences-dropdown-grid">
                <div class="form-field-row">
                  <label>Tipo de habitacion favorita</label>
                  <div class="select-wrapper">
                    <select formControlName="tipoHabitacion">
                      <option value="Estandar">Estandar</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                </div>

                <div class="form-field-row">
                  <label>Vista preferida</label>
                  <div class="select-wrapper">
                    <select formControlName="vista">
                      <option value="Mar">Mar</option>
                      <option value="Jardin">Jardin</option>
                      <option value="Piscina">Piscina</option>
                      <option value="Ciudad">Ciudad</option>
                    </select>
                  </div>
                </div>

                <div class="form-field-row">
                  <label>Tipo de cama</label>
                  <div class="select-wrapper">
                    <select formControlName="tipoCama">
                      <option value="Individual">Individual</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                      <option value="Twin">Twin</option>
                    </select>
                  </div>
                </div>

                <div class="form-field-row">
                  <label>Almohadas</label>
                  <div class="select-wrapper">
                    <select formControlName="almohada">
                      <option value="Suaves">Suaves</option>
                      <option value="Firmes">Firmes</option>
                      <option value="Ortopedicas">Ortopedicas</option>
                    </select>
                  </div>
                </div>

                <div class="form-field-row span-2">
                  <label>Temperatura ambiente</label>
                  <div class="temperature-input-container">
                    <input type="number" formControlName="temperatura" />
                    <span class="celsius-tag">°C</span>
                  </div>
                </div>
              </div>

              <div class="card-divider-line"></div>

              <!-- Listas de Seleccion (Dieta / Servicios) -->
              <div class="preferences-selection-columns">
                <div class="selection-column">
                  <span class="selection-heading">Dieta</span>
                  <div class="checkbox-vertical-list">
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onDietChange($event, 'Regular')" [checked]="checkDiet('Regular')" />
                      <span class="box-indicator"></span> Regular
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onDietChange($event, 'Vegetariana')" [checked]="checkDiet('Vegetariana')" />
                      <span class="box-indicator"></span> Vegetariana
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onDietChange($event, 'Vegana')" [checked]="checkDiet('Vegana')" />
                      <span class="box-indicator"></span> Vegana
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onDietChange($event, 'Sin Gluten')" [checked]="checkDiet('Sin Gluten')" />
                      <span class="box-indicator"></span> Sin Gluten
                    </label>
                  </div>
                </div>

                <div class="selection-column">
                  <span class="selection-heading">Servicios favoritos</span>
                  <div class="checkbox-vertical-list">
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onServiceChange($event, 'Spa')" [checked]="checkService('Spa')" />
                      <span class="box-indicator"></span> Spa
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onServiceChange($event, 'Room Service')" [checked]="checkService('Room Service')" />
                      <span class="box-indicator"></span> Room Service
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onServiceChange($event, 'Piscina')" [checked]="checkService('Piscina')" />
                      <span class="box-indicator"></span> Piscina
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onServiceChange($event, 'Gimnasio')" [checked]="checkService('Gimnasio')" />
                      <span class="box-indicator"></span> Gimnasio
                    </label>
                    <label class="custom-checkbox">
                      <input type="checkbox" (change)="onServiceChange($event, 'Lavanderia')" [checked]="checkService('Lavanderia')" />
                      <span class="box-indicator"></span> Lavanderia
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta inferior: Informacion adicional (MongoDB) -->
            <div class="profile-card horizontal-info-card">
              <span class="info-title">Informacion adicional</span>
              <div class="info-row-content">
                <div class="info-block-item">
                  <i class="icon-calendar"></i>
                  <div>
                    <small>Fecha de creacion</small>
                    <strong>{{ formatearFecha(fechaCreacion) }}</strong>
                  </div>
                </div>
                <div class="vertical-separator"></div>
                <div class="info-block-item">
                  <i class="icon-clock"></i>
                  <div>
                    <small>Ultima conexion</small>
                    <strong>{{ formatearFecha(ultimaConexion) }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botonera de accion alineada a la derecha -->
            <div class="form-action-buttons">
              <button type="button" class="btn btn-outline" (click)="restablecerCambios()">
                <i class="icon-rotate-ccw"></i> Restablecer cambios
              </button>
              <button type="submit" class="btn btn-filled" [disabled]="perfilForm.invalid || guardando">
                <i class="icon-save"></i> {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>

          </div>
        </form>
      }
    </section>
  `,
  styles: [
    `
      :host {
        --bg-main: #FBF8F2;
        --blue-dark: #0B2540;
        --blue-text: #16395E;
        --text-muted: #667085;
        --border-color: #E7EAF0;
        --gold-theme: #C9A227;
        --gold-dark: #A9851C;
        --white: #FFFFFF;

        display: block;
        background-color: var(--bg-main);
        min-height: 100vh;
        font-family: 'Inter', system-ui, sans-serif;
        color: var(--blue-text);
      }

      .perfil-container {
        max-width: 1240px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
      }

      .top-nav-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .connection-badge {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: var(--white);
        border: 1px solid var(--border-color);
        padding: 0.6rem 1.2rem;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .connection-badge i { color: var(--gold-theme); font-size: 1.1rem; }
      .connection-badge small, .info-block-item small { display: block; font-size: 0.75rem; color: var(--text-muted); }
      .connection-badge strong, .info-block-item strong { font-size: 0.85rem; color: var(--blue-dark); font-weight: 600; font-family: 'Inter', system-ui, sans-serif; }

      .title-block { margin-bottom: 2rem; }
      .title-block h1 {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0 0 0.4rem 0;
        color: var(--blue-dark);
        font-family: 'Playfair Display', serif;
      }
      .title-block p { color: var(--text-muted); margin: 0; font-size: 0.95rem; }

      .profile-layout-grid {
        display: grid;
        grid-template-columns: minmax(420px, 0.9fr) minmax(0, 1.6fr);
        gap: 1.5rem;
        align-items: start;
      }

      .column-left, .column-right {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .profile-card {
        background: var(--white);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
      }

      .card-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--blue-dark);
        margin: 0 0 1.5rem 0;
        font-family: 'Playfair Display', serif;
      }

      .card-head-inline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .card-head-inline .card-title {
        margin-bottom: 0;
      }

      .form-inputs-stack {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }

      .form-field-row {
        display: grid;
        grid-template-columns: minmax(140px, 180px) minmax(0, 1fr);
        align-items: center;
        gap: 1rem;
      }
      .form-field-row label {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--blue-dark);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: auto;
        min-width: 0;
      }
      .form-field-row label i {
        color: var(--gold-theme);
        font-size: 1rem;
        width: 16px;
      }

      input[type="text"], input[type="email"], input[type="number"], select {
        flex: 1;
        min-width: 0;
        width: 100%;
        padding: 0.6rem 0.9rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.9rem;
        color: var(--blue-text);
        outline: none;
        box-sizing: border-box;
        transition: border 0.15s ease;
        background: var(--white);
      }
      input:focus, select:focus {
        border-color: var(--gold-theme);
      }

      .select-wrapper {
        position: relative;
        flex: 1;
        width: 100%;
      }

      .select-wrapper.compact {
        flex: 0 0 120px;
      }

      .checkbox-vertical-list {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .custom-checkbox {
        display: flex;
        align-items: center;
        position: relative;
        padding-left: 28px;
        cursor: pointer;
        font-size: 0.9rem;
        user-select: none;
        color: var(--blue-text);
        font-weight: 500;
      }
      .custom-checkbox input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
      .box-indicator { position: absolute; top: 0; left: 0; height: 18px; width: 18px; background-color: #F1F5F9; border: 1px solid var(--border-color); border-radius: 4px; }
      .custom-checkbox:hover input ~ .box-indicator { background-color: #E2E8F0; }
      .custom-checkbox input:checked ~ .box-indicator { background-color: #0F172A; border-color: #0F172A; }
      .box-indicator:after { content: ""; position: absolute; display: none; }
      .custom-checkbox input:checked ~ .box-indicator:after { display: block; }
      .custom-checkbox .box-indicator:after { left: 6px; top: 2px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }

      .preferences-dropdown-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }
      .preferences-dropdown-grid .form-field-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.4rem;
      }
      .preferences-dropdown-grid .form-field-row label { width: 100%; }
      .preferences-dropdown-grid .span-2 { grid-column: span 2; }

      .temperature-input-container {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
      }
      .temperature-input-container input { padding-right: 2.5rem; }
      .celsius-tag { position: absolute; right: 1rem; color: var(--text-muted); font-size: 0.88rem; }

      .card-divider-line { border-top: 1px solid var(--border-color); margin: 2rem 0; }

      .preferences-selection-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .selection-heading { display: block; font-size: 0.95rem; font-weight: 700; color: var(--blue-dark); margin-bottom: 1.1rem; }

      .horizontal-info-card .info-title {
        display: block;
        font-size: 1rem;
        font-weight: 700;
        color: var(--blue-dark);
        margin-bottom: 1.25rem;
        font-family: 'Playfair Display', serif;
      }
      .info-row-content { display: flex; align-items: center; gap: 2.5rem; }
      .info-block-item { display: flex; align-items: center; gap: 0.75rem; }
      .info-block-item i { color: var(--gold-theme); font-size: 1.2rem; }
      .vertical-separator { border-left: 1px solid var(--border-color); height: 35px; }

      .form-action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 0.5rem;
      }
      .btn {
        padding: 0.7rem 1.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border: none;
        transition: all 0.15s ease;
      }
      .btn-sm {
        font-size: 0.8rem;
        padding: 0.45rem 0.85rem;
      }
      .btn-filled { background-color: var(--gold-theme); color: var(--white); }
      .btn-filled:hover { background-color: var(--gold-dark); }
      .btn-outline { background-color: var(--white); color: var(--text-muted); border: 1px solid var(--border-color); }
      .btn-outline:hover { background-color: #F8FAFC; color: var(--blue-text); }

      .phones-stack {
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
      }

      .phone-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .phone-fields {
        flex: 1;
        display: flex;
        gap: 0.5rem;
      }

      .icon-danger {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1px solid #F2C5C5;
        background: #FFF5F5;
        color: #9B1C1C;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
      }

      .icon-danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; }
      .alert.success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
      .alert.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5; }
      .loading-state { text-align: center; padding: 4rem; color: var(--text-muted); }

      @media (max-width: 1024px) {
        .profile-layout-grid { grid-template-columns: 1fr; }
        .preferences-dropdown-grid { grid-template-columns: repeat(2, 1fr); }
      }

      @media (max-width: 640px) {
        .perfil-container { padding: 1.4rem 1rem; }
        .profile-card { padding: 1.25rem; }
        .form-field-row { grid-template-columns: 1fr; gap: .45rem; }
        .preferences-dropdown-grid, .preferences-selection-columns { grid-template-columns: 1fr; }
        .preferences-dropdown-grid .span-2 { grid-column: auto; }
        .info-row-content { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .vertical-separator { display: none; }
        .form-action-buttons { flex-direction: column; }
      }
    `
  ]
})
export class PerfilClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly perfilForm = this.fb.group({
    // Datos personales -> Oracle
    nombres: ["", Validators.required],
    apellidos: ["", Validators.required],
    tipoDocumento: ["DNI", Validators.required],
    numeroDocumento: [""],
    correo: ["", [Validators.required, Validators.email]],
    nacionalidad: [""],
    telefono: [""],

    // Preferencias / idiomas -> MongoDB
    tipoHabitacion: ["Deluxe"],
    vista: ["Mar"],
    tipoCama: ["Queen"],
    almohada: ["Suaves"],
    temperatura: [22],
    dieta: [[] as string[]],
    serviciosFavoritos: [[] as string[]],
    idiomas: [[] as string[]]
  });

  cargando = true;
  guardando = false;
  mensaje = "";
  error = "";

  idUsuarioActual: number | null = null;
  idHuespedActual: number | null = null;
  fechaCreacion?: string | Date;
  ultimaConexion?: string | Date;

  async ngOnInit() {
    await this.cargarPerfilCompleto();
  }

  async cargarPerfilCompleto() {
    this.cargando = true;
    this.error = "";
    this.mensaje = "";

    try {
      this.idUsuarioActual = this.auth.getUserId();
      if (!this.idUsuarioActual) {
        throw new Error("No se pudo identificar al usuario autenticado.");
      }

      // 1. Datos personales desde Oracle
      const huespedes = await firstValueFrom(this.api.get<HuespedOracle[]>("/huespedes"));
      const huesped = huespedes.find((h) => Number(h.ID_USUARIO) === this.idUsuarioActual) || null;

      if (!huesped) {
        throw new Error("Tu usuario no tiene un huesped asociado en Oracle.");
      }

      this.idHuespedActual = huesped.ID_HUESPED;

      // 2. Preferencias / idiomas / fechas desde MongoDB
      const perfilMongo = await this.safeGet<PerfilMongo>(`/perfiles-cliente/huesped/${huesped.ID_HUESPED}`);

      this.fechaCreacion = perfilMongo?.fechaCreacion;
      this.ultimaConexion = perfilMongo?.ultimaConexion;

      this.perfilForm.patchValue({
        nombres: huesped.NOMBRES || "",
        apellidos: huesped.APELLIDOS || "",
        tipoDocumento: huesped.TIPO_DOCUMENTO || "DNI",
        numeroDocumento: huesped.NUMERO_DOCUMENTO || "",
        correo: huesped.CORREO || "",
        nacionalidad: huesped.NACIONALIDAD || "",
        telefono: huesped.TELEFONO || "",

        tipoHabitacion: perfilMongo?.preferencias?.tipoHabitacion || "Deluxe",
        vista: perfilMongo?.preferencias?.vista || "Mar",
        tipoCama: perfilMongo?.preferencias?.tipoCama || "Queen",
        almohada: perfilMongo?.preferencias?.almohada || "Suaves",
        temperatura: perfilMongo?.preferencias?.temperatura ?? 22,
        dieta: perfilMongo?.preferencias?.dieta || [],
        serviciosFavoritos: perfilMongo?.preferencias?.serviciosFavoritos || [],
        idiomas: perfilMongo?.idiomas || []
      });

    } catch (err) {
      this.error = this.extraerMensaje(err, "No se pudo cargar la informacion del perfil.");
    } finally {
      this.cargando = false;
    }
  }

  checkIdioma(idioma: string): boolean {
    const arr = this.perfilForm.get("idiomas")?.value || [];
    return arr.includes(idioma);
  }

  onIdiomaChange(event: Event, idioma: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const arr = [...(this.perfilForm.get("idiomas")?.value || [])];
    if (checked) arr.push(idioma);
    else {
      const idx = arr.indexOf(idioma);
      if (idx >= 0) arr.splice(idx, 1);
    }
    this.perfilForm.get("idiomas")?.setValue(arr);
  }

  checkDiet(dieta: string): boolean {
    const arr = this.perfilForm.get("dieta")?.value || [];
    return arr.includes(dieta);
  }

  onDietChange(event: Event, dieta: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const arr = [...(this.perfilForm.get("dieta")?.value || [])];
    if (checked) arr.push(dieta);
    else {
      const idx = arr.indexOf(dieta);
      if (idx >= 0) arr.splice(idx, 1);
    }
    this.perfilForm.get("dieta")?.setValue(arr);
  }

  checkService(servicio: string): boolean {
    const arr = this.perfilForm.get("serviciosFavoritos")?.value || [];
    return arr.includes(servicio);
  }

  onServiceChange(event: Event, servicio: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const arr = [...(this.perfilForm.get("serviciosFavoritos")?.value || [])];
    if (checked) arr.push(servicio);
    else {
      const idx = arr.indexOf(servicio);
      if (idx >= 0) arr.splice(idx, 1);
    }
    this.perfilForm.get("serviciosFavoritos")?.setValue(arr);
  }

  async guardarCambios() {
    if (this.perfilForm.invalid || !this.idHuespedActual || !this.idUsuarioActual) return;

    this.guardando = true;
    this.mensaje = "";
    this.error = "";

    const v = this.perfilForm.value;

    const payloadOracle = {
      id_usuario: this.idUsuarioActual,
      nombres: v.nombres || "",
      apellidos: v.apellidos || "",
      tipo_documento: v.tipoDocumento || "",
      numero_documento: v.numeroDocumento || "",
      telefono: v.telefono || "",
      correo: v.correo || "",
      nacionalidad: v.nacionalidad || ""
    };

    const payloadMongo = {
      idHuesped: this.idHuespedActual,
      idiomas: v.idiomas || [],
      tipoHabitacion: v.tipoHabitacion || "",
      vista: v.vista || "",
      tipoCama: v.tipoCama || "",
      temperatura: Number(v.temperatura),
      dieta: v.dieta || [],
      serviciosFavoritos: v.serviciosFavoritos || []
    };

    try {
      // Guardamos en paralelo: Oracle (datos personales) y MongoDB (preferencias/idiomas)
      await Promise.all([
        firstValueFrom(this.api.put(`/huespedes/${this.idHuespedActual}`, payloadOracle)),
        firstValueFrom(this.api.put(`/perfiles-cliente/${this.idHuespedActual}`, payloadMongo))
      ]);
      this.mensaje = "Cambios guardados exitosamente.";
      await this.cargarPerfilCompleto();
    } catch (err) {
      this.error = this.extraerMensaje(err, "Hubo un problema al guardar los cambios.");
    } finally {
      this.guardando = false;
    }
  }

  restablecerCambios() {
    this.cargarPerfilCompleto();
  }

  formatearFecha(valor?: string | Date) {
    if (!valor) return "-";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "-";
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(fecha).replace(",", "");
  }

  private async safeGet<T>(path: string): Promise<T | null> {
    try {
      return await firstValueFrom(this.api.get<T>(path));
    } catch {
      return null;
    }
  }

  private extraerMensaje(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "object" && error && "error" in error) {
      const response = (error as { error?: { message?: string } }).error;
      if (response?.message) return response.message;
    }
    return fallback;
  }
}



