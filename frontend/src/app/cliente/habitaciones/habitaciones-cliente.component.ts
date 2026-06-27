import { CommonModule, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface Habitacion {
  ID_HABITACION: number;
  NUMERO_HABITACION: string;
  TIPO: string;
  PRECIO_NOCHE: number;
  CAPACIDAD: number;
  ESTADO: "Disponible" | "Ocupada" | "Mantenimiento";
  DESCRIPCION?: string | null;
}

interface Huesped {
  ID_HUESPED: number;
  ID_USUARIO: number | null;
  NOMBRES?: string;
  APELLIDOS?: string;
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
  selector: "app-habitaciones-cliente",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  template: `
    <section class="cliente-habitaciones">
      <section class="hero-card">
        <div>
          <span class="eyebrow">Alojamiento</span>
          <h1>Habitaciones con reserva inmediata</h1>
          <p>Consulta disponibilidad real y genera tu reserva usando la informacion de la base de datos.</p>
        </div>
        <div class="hero-stats">
          <article>
            <strong>{{ habitacionesDisponibles.length }}</strong>
            <small>Disponibles</small>
          </article>
          <article>
            <strong>{{ reservas.length }}</strong>
            <small>Mis reservas</small>
          </article>
        </div>
      </section>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }
      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="booking-wrap">
        <article class="booking-card">
          <div class="card-head">
            <h3>Crear reserva</h3>
            @if (habitacionSeleccionada) {
              <small>Habitacion {{ habitacionSeleccionada.NUMERO_HABITACION }} - {{ habitacionSeleccionada.TIPO }}</small>
            }
          </div>

          <form class="booking-grid" [formGroup]="reservaForm" (ngSubmit)="crearReserva()">
            <label>
              Habitacion
              <select formControlName="id_habitacion">
                <option [ngValue]="null">Selecciona una habitacion...</option>
                @for (h of habitacionesDisponibles; track h.ID_HABITACION) {
                  <option [ngValue]="h.ID_HABITACION">
                    #{{ h.NUMERO_HABITACION }} - {{ h.TIPO }} (S/ {{ h.PRECIO_NOCHE | number: '1.2-2' }})
                  </option>
                }
              </select>
            </label>

            <label>
              Llegada
              <input type="date" formControlName="fecha_ingreso" />
            </label>

            <label>
              Salida
              <input type="date" formControlName="fecha_salida" />
            </label>

            <label>
              Noches
              <input type="number" min="1" formControlName="cantidad_noches" />
            </label>

            <button class="btn-search" type="submit" [disabled]="reservaForm.invalid || guardando || !idHuespedActual">
              {{ guardando ? 'Procesando...' : 'Reservar ahora' }}
            </button>
          </form>

          @if (!idHuespedActual) {
            <p class="note">No se encontro un huesped asociado a tu usuario. Registra tu perfil de huesped para reservar.</p>
          }
        </article>
      </section>

      <section class="habitaciones-grid">
        @if (cargandoHabitaciones) {
          <p class="estado-msg">Cargando habitaciones...</p>
        } @else if (habitaciones.length === 0) {
          <p class="estado-msg">No hay habitaciones registradas.</p>
        } @else {
          @for (h of habitaciones; track h.ID_HABITACION) {
            <article class="habitacion-card">
              <img [src]="imagenPara(h.TIPO)" [alt]="h.TIPO" />
              <span class="badge" [class]="claseEstado(h.ESTADO)">{{ h.ESTADO }}</span>
              <div class="habitacion-info">
                <h3>{{ h.TIPO }}</h3>
                <p class="numero">Habitacion N. {{ h.NUMERO_HABITACION }}</p>
                <p class="capacidad">Capacidad: {{ h.CAPACIDAD }} personas</p>
                <p class="descripcion">{{ h.DESCRIPCION || 'Sin descripcion adicional.' }}</p>
                <div class="habitacion-footer">
                  <span class="precio">S/ {{ h.PRECIO_NOCHE | number: '1.2-2' }} <small>/ noche</small></span>
                  <button class="btn-gold" type="button" [disabled]="h.ESTADO !== 'Disponible'" (click)="seleccionarHabitacion(h)">
                    {{ h.ESTADO === 'Disponible' ? 'Reservar' : 'No disponible' }}
                  </button>
                </div>
              </div>
            </article>
          }
        }
      </section>

      <section class="reservas-section">
        <div class="section-head">
          <h3>Mis reservas recientes</h3>
          <small>Datos cargados desde RESERVA y DETALLE_RESERVA</small>
        </div>

        @if (cargandoReservas) {
          <p class="estado-msg">Cargando tus reservas...</p>
        } @else if (reservas.length === 0) {
          <p class="estado-msg">Aun no tienes reservas registradas.</p>
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
                      <span class="status-pill">{{ r.ESTADO }}</span>
                    </td>
                    <td>S/ {{ (r.TOTAL || r.SUBTOTAL || 0) | number: '1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
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
      .cliente-habitaciones { display: grid; gap: 1.2rem; }
      .hero-card {
        border-radius: 24px;
        padding: 1.6rem;
        background: linear-gradient(120deg, #F3E9D6, var(--cream-50));
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .eyebrow { color: var(--gold-500); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 900; }
      .hero-card h1 { margin: .25rem 0 .45rem; font-family: 'Playfair Display', serif; color: var(--navy-900); font-size: 2rem; }
      .hero-card p { margin: 0; color: var(--muted); max-width: 640px; }
      .hero-stats { display: grid; grid-template-columns: repeat(2, minmax(130px, 1fr)); gap: .7rem; align-content: start; }
      .hero-stats article { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: .8rem .9rem; }
      .hero-stats strong { display: block; font-family: 'Playfair Display', serif; color: var(--navy-900); font-size: 1.35rem; }
      .hero-stats small { color: var(--muted); font-size: .78rem; }
      .alert { border-radius: 12px; padding: .7rem .9rem; font-weight: 600; font-size: .86rem; }
      .alert.success { background: rgba(46,125,50,.12); color: #1F5F23; border: 1px solid rgba(46,125,50,.24); }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }
      .booking-wrap { display: flex; justify-content: center; }
      .booking-card {
        width: 100%;
        border-radius: 16px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1rem 1.1rem;
      }
      .card-head { display: flex; justify-content: space-between; gap: .8rem; align-items: center; margin-bottom: .8rem; flex-wrap: wrap; }
      .card-head h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; }
      .card-head small { color: var(--muted); }
      .booking-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr .8fr auto; gap: .75rem; align-items: end; }
      .booking-grid label { display: grid; gap: .35rem; font-size: .75rem; font-weight: 700; color: var(--navy-700); }
      .booking-grid input, .booking-grid select {
        border: 1px solid #D9DEE6;
        border-radius: 8px;
        padding: .55rem .6rem;
        font-size: .86rem;
        font-family: inherit;
        background: var(--cream-50);
      }
      .btn-search {
        border: none;
        border-radius: 8px;
        background: var(--gold-500);
        color: var(--navy-900);
        padding: .6rem 1rem;
        font-weight: 800;
        cursor: pointer;
      }
      .btn-search:disabled { opacity: .7; cursor: not-allowed; }
      .note { margin: .8rem 0 0; color: #8A1E18; font-size: .84rem; }
      .habitaciones-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }
      .habitacion-card {
        position: relative;
        background: var(--white);
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: 0 10px 24px rgba(11,37,64,.08);
        display: flex;
        flex-direction: column;
      }
      .habitacion-card img { width: 100%; height: 200px; object-fit: cover; }
      .badge {
        position: absolute;
        top: .7rem;
        right: .7rem;
        font-size: .72rem;
        font-weight: 700;
        padding: .26rem .6rem;
        border-radius: 999px;
        color: white;
      }
      .badge.disponible { background: #2E7D32; }
      .badge.ocupada { background: #B3261E; }
      .badge.mantenimiento { background: #B8860B; }
      .habitacion-info { padding: 1rem; display: grid; gap: .32rem; }
      .habitacion-info h3 { margin: 0; color: var(--navy-900); font-size: 1.02rem; }
      .numero, .capacidad, .descripcion { margin: 0; color: var(--muted); font-size: .82rem; }
      .habitacion-footer { display: flex; justify-content: space-between; align-items: center; gap: .7rem; margin-top: .5rem; }
      .precio { color: var(--navy-900); font-weight: 700; font-size: .93rem; }
      .precio small { color: var(--muted); font-weight: 400; }
      .btn-gold {
        border: none;
        border-radius: 8px;
        padding: .43rem .82rem;
        background: var(--gold-500);
        color: var(--navy-900);
        font-size: .82rem;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-gold:disabled { background: #D9DEE6; color: var(--muted); cursor: not-allowed; }
      .reservas-section {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        padding: 1rem 1.1rem;
      }
      .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: .7rem; margin-bottom: .7rem; flex-wrap: wrap; }
      .section-head h3 { margin: 0; font-family: 'Playfair Display', serif; color: var(--navy-900); }
      .section-head small { color: var(--muted); }
      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; min-width: 700px; }
      th, td { text-align: left; border-bottom: 1px solid var(--border); padding: .68rem .5rem; color: var(--navy-900); font-size: .84rem; }
      th { text-transform: uppercase; letter-spacing: .05em; color: var(--muted); font-size: .72rem; }
      .status-pill {
        display: inline-block;
        border-radius: 999px;
        background: rgba(11,37,64,.08);
        color: var(--navy-900);
        padding: .2rem .55rem;
        font-size: .72rem;
        font-weight: 700;
      }
      .estado-msg { text-align: center; color: var(--muted); padding: 1rem; }
      @media (max-width: 1100px) {
        .booking-grid { grid-template-columns: 1fr 1fr; }
        .habitaciones-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 700px) {
        .hero-card h1 { font-size: 1.6rem; }
        .habitaciones-grid { grid-template-columns: 1fr; }
        .booking-grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class HabitacionesClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  habitaciones: Habitacion[] = [];
  reservas: Reserva[] = [];
  idHuespedActual: number | null = null;
  habitacionSeleccionada: Habitacion | null = null;

  cargandoHabitaciones = false;
  cargandoReservas = false;
  guardando = false;
  mensaje = "";
  error = "";

  readonly reservaForm = this.fb.group({
    id_habitacion: [null as number | null, [Validators.required]],
    fecha_ingreso: ["", [Validators.required]],
    fecha_salida: ["", [Validators.required]],
    cantidad_noches: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarContextoHuesped();
  }

  get habitacionesDisponibles(): Habitacion[] {
    return this.habitaciones.filter((h) => h.ESTADO === "Disponible");
  }

  cargarHabitaciones(): void {
    this.cargandoHabitaciones = true;
    this.api.get<Habitacion[]>("/habitaciones").subscribe({
      next: (rows) => {
        this.habitaciones = rows;
        this.cargandoHabitaciones = false;
      },
      error: () => {
        this.error = "No se pudieron cargar las habitaciones.";
        this.cargandoHabitaciones = false;
      }
    });
  }

  cargarContextoHuesped(): void {
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
          this.error = "Tu usuario no tiene registro en HUESPED, por eso no se puede generar la reserva.";
          return;
        }

        this.cargarReservas();
      },
      error: () => {
        this.error = "No se pudo validar el perfil de huesped para reservar.";
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

  seleccionarHabitacion(h: Habitacion): void {
    this.habitacionSeleccionada = h;
    this.reservaForm.patchValue({
      id_habitacion: h.ID_HABITACION
    });
  }

  crearReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    if (!this.idHuespedActual) {
      this.error = "No se puede crear reserva sin ID_HUESPED asociado.";
      return;
    }

    this.guardando = true;
    this.error = "";
    this.mensaje = "";

    const value = this.reservaForm.getRawValue();
    const habitacion = this.habitaciones.find((h) => h.ID_HABITACION === value.id_habitacion);

    if (!habitacion) {
      this.error = "Selecciona una habitacion valida.";
      this.guardando = false;
      return;
    }

    const noches = this.calcularNoches(value.fecha_ingreso || "", value.fecha_salida || "");
    if (noches <= 0) {
      this.error = "La fecha de salida debe ser mayor que la fecha de ingreso.";
      this.guardando = false;
      return;
    }

    const payload = {
      fecha_ingreso: value.fecha_ingreso,
      fecha_salida: value.fecha_salida,
      estado: "PENDIENTE",
      id_huesped: this.idHuespedActual,
      id_habitacion: habitacion.ID_HABITACION,
      precio_noche: Number(habitacion.PRECIO_NOCHE),
      cantidad_noches: value.cantidad_noches || noches,
      total: Number(habitacion.PRECIO_NOCHE) * (value.cantidad_noches || noches)
    };

    this.api.post("/reservas", payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = "Reserva creada correctamente.";
        this.reservaForm.patchValue({ cantidad_noches: 1 });
        this.cargarReservas();
      },
      error: () => {
        this.guardando = false;
        this.error = "No se pudo crear la reserva.";
      }
    });
  }

  calcularNoches(inicio: string, fin: string): number {
    if (!inicio || !fin) return 1;
    const start = new Date(`${inicio}T00:00:00`);
    const end = new Date(`${fin}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  imagenPara(tipo: string): string {
    const seed = tipo.toLowerCase().replace(/\s+/g, "-");
    return `https://picsum.photos/seed/cliente-hab-${seed}/800/520`;
  }

  claseEstado(estado: string): string {
    return String(estado || "").toLowerCase();
  }
}
