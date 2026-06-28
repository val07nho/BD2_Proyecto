import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface Habitacion {
  ID_HABITACION: number;
  NUMERO_HABITACION: string;
  TIPO: string;
  PRECIO_NOCHE: number;
  CAPACIDAD: number;
  ESTADO: "Disponible" | "Ocupada" | "Mantenimiento";
}

interface Huesped {
  ID_HUESPED: number;
  ID_USUARIO: number | null;
}

interface Reserva {
  ID_RESERVA: number;
  FECHA_RESERVA: string;
  FECHA_INGRESO: string;
  FECHA_SALIDA: string;
  ESTADO: string;
  TOTAL: number;
  ID_HUESPED: number;
  ID_HABITACION?: number;
  NUMERO_HABITACION?: string;
  PRECIO_NOCHE?: number;
  CANTIDAD_NOCHES?: number;
  SUBTOTAL?: number;
}

@Component({
  selector: "app-reservas-cliente",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  template: `
    <section class="cliente-reservas">
      <section class="hero">
        <div>
          <span class="eyebrow">Reservas</span>
          <h1>Gestiona tu estadia</h1>
          <p>Flujo conectado con RESERVA y DETALLE_RESERVA para crear, reprogramar y cancelar de forma consistente.</p>
        </div>

        <div class="hero-stats">
          <article>
            <strong>{{ reservas.length }}</strong>
            <small>Total reservas</small>
          </article>
          <article>
            <strong>{{ pendientes }}</strong>
            <small>Pendientes</small>
          </article>
          <article>
            <strong>{{ canceladas }}</strong>
            <small>Canceladas</small>
          </article>
        </div>
      </section>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }
      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="grid">
        <article class="card form-card">
          <div class="card-head">
            <h3>{{ editando ? 'Reprogramar reserva' : 'Nueva reserva' }}</h3>
            <a class="link" routerLink="/cliente/habitaciones">Ver habitaciones</a>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
            <label>
              Habitacion
              <select formControlName="id_habitacion">
                <option [ngValue]="null">Selecciona...</option>
                @for (h of habitacionesDisponibles; track h.ID_HABITACION) {
                  <option [ngValue]="h.ID_HABITACION">
                    #{{ h.NUMERO_HABITACION }} - {{ h.TIPO }} (S/ {{ h.PRECIO_NOCHE | number: '1.2-2' }})
                  </option>
                }
              </select>
            </label>

            <label>
              Fecha ingreso
              <input type="date" formControlName="fecha_ingreso" />
            </label>

            <label>
              Fecha salida
              <input type="date" formControlName="fecha_salida" />
            </label>

            <label>
              Cantidad noches
              <input type="number" min="1" formControlName="cantidad_noches" />
            </label>

            <div class="preview" *ngIf="habitacionFormulario as habPreview">
              <small>Total estimado</small>
              <strong>S/ {{ totalFormulario(habPreview.PRECIO_NOCHE) | number: '1.2-2' }}</strong>
            </div>

            <div class="actions">
              <button class="btn primary" type="submit" [disabled]="form.invalid || guardando || !idHuespedActual">
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear reserva') }}
              </button>
              <button class="btn ghost" type="button" (click)="cancelarEdicion()" [disabled]="guardando">Limpiar</button>
            </div>
          </form>

          @if (!idHuespedActual) {
            <p class="note">Tu usuario no tiene registro en HUESPED. Sin ese enlace no se puede guardar una reserva.</p>
          }
        </article>

        <article class="card table-card">
          <div class="table-head">
            <h3>Mis reservas</h3>
            <button class="btn ghost" type="button" (click)="cargarReservas()" [disabled]="cargandoReservas">Actualizar</button>
          </div>

          @if (cargandoReservas) {
            <p class="empty">Cargando reservas...</p>
          } @else if (reservas.length === 0) {
            <p class="empty">Aun no tienes reservas registradas.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Habitacion</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Noches</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of reservas; track r.ID_RESERVA) {
                    <tr>
                      <td>#{{ r.ID_RESERVA }}</td>
                      <td>{{ r.NUMERO_HABITACION || '-' }}</td>
                      <td>{{ r.FECHA_INGRESO | date: 'yyyy-MM-dd' }}</td>
                      <td>{{ r.FECHA_SALIDA | date: 'yyyy-MM-dd' }}</td>
                      <td>{{ r.CANTIDAD_NOCHES || calcularNoches(r.FECHA_INGRESO, r.FECHA_SALIDA) }}</td>
                      <td>
                        <span class="status" [class.cancelada]="normalizarEstado(r.ESTADO) === 'CANCELADA'">
                          {{ r.ESTADO }}
                        </span>
                      </td>
                      <td>S/ {{ (r.TOTAL || r.SUBTOTAL || 0) | number: '1.2-2' }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="action" type="button" (click)="editarReserva(r)" [disabled]="normalizarEstado(r.ESTADO) === 'CANCELADA' || normalizarEstado(r.ESTADO) === 'FINALIZADA'">Editar</button>
                          <button class="action warn" type="button" (click)="cancelarReserva(r)" [disabled]="normalizarEstado(r.ESTADO) !== 'PENDIENTE'">Cancelar reserva</button>
                          <button class="action success" type="button" (click)="finalizarReserva(r)" [disabled]="normalizarEstado(r.ESTADO) === 'CANCELADA' || normalizarEstado(r.ESTADO) === 'FINALIZADA'">Finalizar</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        --navy-900: #0B2540;
        --navy-700: #16395E;
        --gold-500: #C9A227;
        --gold-300: #E3C77E;
        --cream-50: #FBF8F2;
        --white: #FFFFFF;
        --muted: #5C6B80;
        --border: #E7EAF0;
        --shadow: 0 18px 40px rgba(11, 37, 64, .1);
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      .cliente-reservas { display: grid; gap: 1rem; }
      .hero {
        border-radius: 24px;
        padding: 1.5rem;
        background: linear-gradient(120deg, #F3E9D6, var(--cream-50));
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .eyebrow { color: var(--gold-500); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 900; }
      .hero h1 { margin: .3rem 0 .45rem; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.9rem; }
      .hero p { margin: 0; color: var(--muted); max-width: 640px; }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(110px, 1fr)); gap: .65rem; align-content: start; }
      .hero-stats article { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: .75rem .8rem; }
      .hero-stats strong { display: block; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.25rem; }
      .hero-stats small { color: var(--muted); font-size: .76rem; }

      .alert { border-radius: 12px; padding: .72rem .92rem; font-weight: 600; font-size: .86rem; }
      .alert.success { background: rgba(46,125,50,.12); color: #1F5F23; border: 1px solid rgba(46,125,50,.24); }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }

      .grid { display: grid; grid-template-columns: minmax(310px, 390px) 1fr; gap: 1rem; align-items: start; }
      .card {
        border-radius: 16px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1rem 1.05rem;
      }
      .card-head, .table-head { display: flex; justify-content: space-between; align-items: center; gap: .7rem; margin-bottom: .8rem; flex-wrap: wrap; }
      h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.2rem; }
      .link { color: var(--navy-700); text-decoration: none; font-size: .82rem; font-weight: 700; }

      .form-grid { display: grid; gap: .76rem; }
      label { display: grid; gap: .34rem; font-size: .78rem; font-weight: 700; color: var(--navy-700); }
      input, select {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: .58rem .62rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }
      .preview {
        border: 1px dashed rgba(11,37,64,.22);
        border-radius: 10px;
        background: #F8F4EA;
        padding: .6rem .7rem;
      }
      .preview small { display: block; color: var(--muted); font-size: .75rem; }
      .preview strong { color: var(--navy-900); font-size: 1.04rem; font-family: 'Playfair Display', serif; }
      .actions { display: flex; gap: .55rem; }
      .btn {
        border: none;
        border-radius: 9px;
        padding: .56rem .84rem;
        font-size: .82rem;
        font-weight: 700;
        cursor: pointer;
      }
      .btn.primary { background: var(--gold-500); color: var(--navy-900); }
      .btn.ghost { background: var(--cream-50); color: var(--navy-900); border: 1px solid var(--border); }
      .btn:disabled { opacity: .7; cursor: not-allowed; }
      .note { margin: .7rem 0 0; color: #8A1E18; font-size: .82rem; }

      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; min-width: 860px; }
      th, td { border-bottom: 1px solid var(--border); padding: .66rem .5rem; text-align: left; color: var(--navy-900); font-size: .83rem; }
      th { text-transform: uppercase; font-size: .71rem; color: var(--muted); letter-spacing: .05em; }
      .status {
        display: inline-block;
        padding: .2rem .52rem;
        border-radius: 999px;
        background: rgba(11,37,64,.08);
        color: var(--navy-900);
        font-size: .72rem;
        font-weight: 700;
      }
      .status.cancelada { background: rgba(179,38,30,.12); color: #8A1E18; }
      .row-actions { display: flex; gap: .35rem; }
      .action {
        border: 1px solid var(--border);
        background: var(--cream-50);
        color: var(--navy-900);
        border-radius: 8px;
        padding: .3rem .5rem;
        font-size: .75rem;
        cursor: pointer;
      }
      .action.warn { color: #8A6A00; border-color: #E3C77E; }
      .action.success { color: #1F5F23; border-color: rgba(46,125,50,.35); }
      .action.danger { color: #8A1E18; border-color: rgba(179,38,30,.35); }
      .empty { color: var(--muted); text-align: center; padding: .9rem; }

      @media (max-width: 1080px) {
        .grid { grid-template-columns: 1fr; }
        .hero-stats { grid-template-columns: repeat(2, minmax(110px, 1fr)); }
      }
      @media (max-width: 680px) {
        .hero h1 { font-size: 1.5rem; }
        .hero-stats { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class ReservasClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  habitaciones: Habitacion[] = [];
  reservas: Reserva[] = [];
  idHuespedActual: number | null = null;

  cargandoReservas = false;
  guardando = false;
  editando = false;
  reservaEditando: Reserva | null = null;
  mensaje = "";
  error = "";

  readonly form = this.fb.group({
    id_habitacion: [null as number | null, [Validators.required]],
    fecha_ingreso: ["", [Validators.required]],
    fecha_salida: ["", [Validators.required]],
    cantidad_noches: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarHuespedActual();
  }

  get habitacionesDisponibles(): Habitacion[] {
    return this.habitaciones.filter((h) => h.ESTADO === "Disponible" || this.esHabitacionReservaEditando(h.ID_HABITACION));
  }

  get habitacionFormulario(): Habitacion | undefined {
    const id = this.form.getRawValue().id_habitacion;
    return this.habitaciones.find((h) => h.ID_HABITACION === id);
  }

  get pendientes(): number {
    return this.reservas.filter((r) => this.normalizarEstado(r.ESTADO) === "PENDIENTE").length;
  }

  get canceladas(): number {
    return this.reservas.filter((r) => this.normalizarEstado(r.ESTADO) === "CANCELADA").length;
  }

  cargarHabitaciones(): void {
    this.api.get<Habitacion[]>("/habitaciones").subscribe({
      next: (rows) => {
        this.habitaciones = rows;
      },
      error: () => {
        this.error = "No se pudieron cargar las habitaciones.";
      }
    });
  }

  cargarHuespedActual(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.error = "No se pudo identificar tu usuario autenticado.";
      return;
    }

    this.api.get<Huesped[]>("/huespedes").subscribe({
      next: (rows) => {
        const actual = rows.find((h) => Number(h.ID_USUARIO) === userId);
        this.idHuespedActual = actual?.ID_HUESPED ?? null;

        if (!this.idHuespedActual) {
          this.error = "Tu cuenta no esta asociada a HUESPED. No se puede continuar el flujo de reserva.";
          return;
        }

        this.cargarReservas();
      },
      error: () => {
        this.error = "No se pudo resolver el huesped asociado a tu usuario.";
      }
    });
  }

  cargarReservas(): void {
    if (!this.idHuespedActual) return;

    this.cargandoReservas = true;
    this.api.get<Reserva[]>("/reservas").subscribe({
      next: (rows) => {
        this.reservas = rows
          .filter((r) => Number(r.ID_HUESPED) === Number(this.idHuespedActual))
          .sort((a, b) => Number(b.ID_RESERVA) - Number(a.ID_RESERVA));
        this.cargandoReservas = false;
      },
      error: () => {
        this.error = "No se pudieron cargar tus reservas.";
        this.cargandoReservas = false;
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.idHuespedActual) {
      this.error = "No existe ID_HUESPED para registrar la reserva.";
      return;
    }

    const value = this.form.getRawValue();
    const habitacion = this.habitaciones.find((h) => h.ID_HABITACION === value.id_habitacion);
    if (!habitacion) {
      this.error = "Selecciona una habitacion valida.";
      return;
    }

    const noches = this.obtenerNochesFormulario();
    if (noches <= 0) {
      this.error = "La fecha de salida debe ser mayor que la fecha de ingreso.";
      return;
    }

    const estadoActual = this.editando && this.reservaEditando
      ? this.normalizarEstado(this.reservaEditando.ESTADO)
      : "PENDIENTE";

    const payload = {
      fecha_ingreso: value.fecha_ingreso,
      fecha_salida: value.fecha_salida,
      estado: estadoActual,
      id_huesped: this.idHuespedActual,
      id_habitacion: habitacion.ID_HABITACION,
      precio_noche: Number(habitacion.PRECIO_NOCHE),
      cantidad_noches: Number(value.cantidad_noches || noches),
      total: this.totalFormulario(habitacion.PRECIO_NOCHE)
    };

    this.guardando = true;
    this.error = "";
    this.mensaje = "";

    const request$ = this.editando && this.reservaEditando
      ? this.api.put(`/reservas/${this.reservaEditando.ID_RESERVA}`, payload)
      : this.api.post("/reservas", payload);

    request$.subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = this.editando ? "Reserva actualizada." : "Reserva creada.";
        this.cancelarEdicion();
        this.cargarReservas();
      },
      error: () => {
        this.guardando = false;
        this.error = this.editando ? "No se pudo actualizar la reserva." : "No se pudo crear la reserva.";
      }
    });
  }

  editarReserva(r: Reserva): void {
    this.editando = true;
    this.reservaEditando = r;

    this.form.patchValue({
      id_habitacion: r.ID_HABITACION || null,
      fecha_ingreso: this.aFechaInput(r.FECHA_INGRESO),
      fecha_salida: this.aFechaInput(r.FECHA_SALIDA),
      cantidad_noches: r.CANTIDAD_NOCHES || this.calcularNoches(r.FECHA_INGRESO, r.FECHA_SALIDA)
    });

    this.error = "";
    this.mensaje = "";
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.reservaEditando = null;
    this.form.reset({ id_habitacion: null, fecha_ingreso: "", fecha_salida: "", cantidad_noches: 1 });
  }

  cancelarReserva(r: Reserva): void {
    if (!this.idHuespedActual) return;
    if (this.normalizarEstado(r.ESTADO) !== "PENDIENTE") {
      this.error = "Solo puedes cancelar reservas en estado pendiente.";
      return;
    }

    const ok = confirm(`Se cancelara la reserva #${r.ID_RESERVA}. Deseas continuar?`);
    if (!ok) return;

    const payload = {
      fecha_ingreso: this.aFechaInput(r.FECHA_INGRESO),
      fecha_salida: this.aFechaInput(r.FECHA_SALIDA),
      estado: "CANCELADA",
      id_huesped: this.idHuespedActual,
      id_habitacion: r.ID_HABITACION || null,
      precio_noche: Number(r.PRECIO_NOCHE || 0),
      cantidad_noches: Number(r.CANTIDAD_NOCHES || this.calcularNoches(r.FECHA_INGRESO, r.FECHA_SALIDA) || 1),
      total: Number(r.TOTAL || r.SUBTOTAL || 0)
    };

    this.error = "";
    this.mensaje = "";

    this.api.put(`/reservas/${r.ID_RESERVA}`, payload).subscribe({
      next: () => {
        this.mensaje = "Reserva cancelada.";
        this.cargarReservas();
      },
      error: () => {
        this.error = "No se pudo cancelar la reserva.";
      }
    });
  }
  finalizarReserva(r: Reserva): void {
    if (!this.idHuespedActual) return;

    const ok = confirm(`¿Deseas marcar la reserva #${r.ID_RESERVA} como FINALIZADA para poder evaluarla?`);
    if (!ok) return;

    const payload = {
      fecha_ingreso: this.aFechaInput(r.FECHA_INGRESO),
      fecha_salida: this.aFechaInput(r.FECHA_SALIDA),
      estado: "FINALIZADA",
      id_huesped: this.idHuespedActual,
      id_habitacion: r.ID_HABITACION || null,
      precio_noche: Number(r.PRECIO_NOCHE || 0),
      cantidad_noches: Number(r.CANTIDAD_NOCHES || this.calcularNoches(r.FECHA_INGRESO, r.FECHA_SALIDA) || 1),
      total: Number(r.TOTAL || r.SUBTOTAL || 0)
    };

    this.error = "";
    this.mensaje = "";

    this.api.put(`/reservas/${r.ID_RESERVA}`, payload).subscribe({
      next: () => {
        this.mensaje = "Reserva finalizada correctamente. Ahora puedes evaluarla en la sección de Encuestas.";
        this.cargarReservas();
      },
      error: () => {
        this.error = "No se pudo finalizar la reserva.";
      }
    });
  }
  totalFormulario(precioNoche: number): number {
    return Number(precioNoche || 0) * this.obtenerNochesFormulario();
  }

  obtenerNochesFormulario(): number {
    const value = this.form.getRawValue();
    const nochesPorFechas = this.calcularNoches(value.fecha_ingreso || "", value.fecha_salida || "");
    const nochesInput = Number(value.cantidad_noches || 1);
    return Math.max(1, nochesInput || nochesPorFechas || 1);
  }

  calcularNoches(inicio: string, fin: string): number {
    if (!inicio || !fin) return 0;
    const start = new Date(`${this.aFechaInput(inicio)}T00:00:00`);
    const end = new Date(`${this.aFechaInput(fin)}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  normalizarEstado(estado: string): string {
    return String(estado || "").trim().toUpperCase();
  }

  aFechaInput(raw: string): string {
    if (!raw) return "";
    return String(raw).slice(0, 10);
  }

  esHabitacionReservaEditando(idHabitacion: number): boolean {
    return this.editando && this.reservaEditando?.ID_HABITACION === idHabitacion;
  }
}
