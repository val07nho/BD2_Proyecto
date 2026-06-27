import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiService } from "../../core/services/api.service";

interface HabitacionAdmin {
  ID_HABITACION: number;
  NUMERO_HABITACION: string;
  TIPO: string;
  CAPACIDAD: number;
  PRECIO_NOCHE: number;
  ESTADO: "Disponible" | "Ocupada" | "Mantenimiento";
  DESCRIPCION?: string | null;
}

@Component({
  selector: "app-habitaciones-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="crud-page">
      <div class="breadcrumb">Administrador <span>/</span> Habitaciones</div>

      <header class="head">
        <div>
          <span class="eyebrow">Gestión de inventario</span>
          <h2>Habitaciones</h2>
          <p>Gestiona las habitaciones registradas en el sistema.</p>
        </div>
        
      </header>

      @if (mensaje) {
        <div class="alert success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          {{ mensaje }}
        </div>
      }

      @if (error) {
        <div class="alert error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .87 1.5h18.62a1 1 0 0 0 .87-1.5L13.71 3.86a1 1 0 0 0-1.72 0z"/>
          </svg>
          {{ error }}
        </div>
      }

      <section class="stats-row">
        <article class="stat-card">
          <span class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
              <path d="M3 18v2"/>
              <path d="M21 18v2"/>
              <path d="M3 13h18"/>
              <path d="M7 13V9.5A1.5 1.5 0 0 1 8.5 8h2A1.5 1.5 0 0 1 12 9.5V13"/>
            </svg>
          </span>
          <div>
            <strong>{{ total }}</strong>
            <small>Total habitaciones</small>
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-icon available">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M8 12.5l2.5 2.5L16 9"/>
            </svg>
          </span>
          <div>
            <strong>{{ disponibles }}</strong>
            <small>Disponibles</small>
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-icon occupied">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="3.2"/>
              <path d="M5 20c.6-3.4 3-5.5 7-5.5s6.4 2.1 7 5.5"/>
            </svg>
          </span>
          <div>
            <strong>{{ ocupadas }}</strong>
            <small>Ocupadas</small>
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-icon maintenance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.07-3.07a6 6 0 0 1-7.94 7.94L6.3 21.7a2.5 2.5 0 1 1-3.54-3.54l7.44-6.56a6 6 0 0 1 7.94-7.94L14.7 6.3Z"/>
            </svg>
          </span>
          <div>
            <strong>{{ mantenimiento }}</strong>
            <small>Mantenimiento</small>
          </div>
        </article>
      </section>

      <section class="filters card">
        <div class="filters-head">
          <h3>Filtros</h3>
          <button class="btn ghost" type="button" (click)="limpiarFiltros()">Limpiar</button>
        </div>

        <div class="filters-grid">
          <label>
            Buscar
            <input
              type="text"
              [value]="filtroTexto"
              (input)="filtroTexto = $any($event.target).value"
              placeholder="Número, tipo o descripción"
            />
          </label>

          <label>
            Tipo
            <select [value]="filtroTipo" (change)="filtroTipo = $any($event.target).value">
              <option value="">Todos</option>
              <option value="Estandar">Estándar</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </label>

          <label>
            Estado
            <select [value]="filtroEstado" (change)="filtroEstado = $any($event.target).value">
              <option value="">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </label>
        </div>
      </section>

      <div class="grid">
        <article class="card form-card">
          <h3>{{ editando ? 'Editar habitación' : 'Crear habitación' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
            <label>
              Número
              <input type="text" formControlName="numero_habitacion" placeholder="Ej: 204" />
            </label>

            <label>
              Tipo
              <select formControlName="tipo">
                <option value="">Selecciona...</option>
                <option value="Estandar">Estándar</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </label>

            <div class="form-row">
              <label>
                Capacidad
                <input type="number" min="1" formControlName="capacidad" />
              </label>

              <label>
                Precio por noche
                <input type="number" min="1" step="0.01" formControlName="precio_noche" />
              </label>
            </div>

            <label>
              Estado
              <select formControlName="estado">
                <option value="Disponible">Disponible</option>
                <option value="Ocupada">Ocupada</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
            </label>

            <label>
              Descripción
              <textarea rows="3" formControlName="descripcion" placeholder="Detalles opcionales"></textarea>
            </label>

            <div class="actions">
              <button class="btn primary" type="submit" [disabled]="form.invalid || guardando">
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear') }}
              </button>
              <button class="btn ghost" type="button" (click)="cancelar()">Cancelar</button>
            </div>
          </form>
        </article>

        <article class="card table-card">
          <h3>Listado</h3>

          @if (cargando) {
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3.5 2"/>
              </svg>
              <p>Cargando habitaciones...</p>
            </div>
          } @else if (habitacionesFiltradas.length === 0) {
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
                <path d="M3 18v2"/>
                <path d="M21 18v2"/>
                <path d="M3 13h18"/>
              </svg>
              <p>No hay habitaciones que coincidan con el filtro.</p>
            </div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Capacidad</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (h of habitacionesFiltradas; track h.ID_HABITACION) {
                    <tr>
                      <td class="muted">#{{ h.ID_HABITACION }}</td>
                      <td class="strong">{{ h.NUMERO_HABITACION }}</td>
                      <td>{{ h.TIPO }}</td>
                      <td>{{ h.CAPACIDAD }}</td>
                      <td class="strong">S/ {{ h.PRECIO_NOCHE | number:'1.2-2' }}</td>
                      <td>
                        <span class="status-badge" [class]="estadoClass(h.ESTADO)">{{ h.ESTADO }}</span>
                      </td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-action" type="button" (click)="editar(h)" aria-label="Editar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                          </button>
                          <button class="icon-action danger" type="button" (click)="eliminar(h)" aria-label="Eliminar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/>
                              <path d="M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>
      </div>
    </section>
  `,
  styles: [
    `
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
        font-family: 'Inter', system-ui, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .crud-page {
        display: grid;
        gap: 1.1rem;
      }

      .breadcrumb {
        font-weight: 700;
        font-size: .95rem;
        color: var(--navy-900);
      }

      .breadcrumb span {
        color: var(--text-600);
        margin: 0 .3rem;
        font-weight: 500;
      }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .eyebrow {
        display: inline-block;
        color: var(--gold-500);
        text-transform: uppercase;
        letter-spacing: .14em;
        font-size: .74rem;
        font-weight: 900;
        margin-bottom: .35rem;
      }

      .head h2 {
        margin: 0;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.85rem;
        line-height: 1.1;
      }

      .head p {
        margin: .35rem 0 0;
        color: var(--text-600);
        font-size: .9rem;
      }

      .btn {
        border: none;
        border-radius: 12px;
        padding: .7rem 1.1rem;
        font-weight: 800;
        font-size: .88rem;
        cursor: pointer;
        transition: .2s ease;
        display: inline-flex;
        align-items: center;
        gap: .5rem;
      }

      .btn svg {
        width: 17px;
        height: 17px;
      }

      .btn.primary {
        background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
        color: var(--navy-950);
        box-shadow: 0 12px 22px rgba(201, 162, 39, .28);
      }

      .btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 16px 26px rgba(201, 162, 39, .34);
      }

      .btn.primary:disabled {
        opacity: .6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .btn.ghost {
        background: var(--cream-50);
        color: var(--navy-900);
        border: 1px solid var(--border);
      }

      .btn.ghost:hover {
        background: var(--white);
        border-color: rgba(201, 162, 39, .45);
      }

      .alert {
        margin: 0;
        padding: .7rem .9rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: .55rem;
        font-size: .88rem;
        font-weight: 650;
      }

      .alert svg {
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
      }

      .alert.success {
        background: rgba(201, 162, 39, .14);
        color: var(--navy-900);
        border: 1px solid rgba(201, 162, 39, .35);
      }

      .alert.error {
        background: rgba(122, 46, 46, .1);
        color: #7A2E2E;
        border: 1px solid rgba(122, 46, 46, .25);
      }

      .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: .9rem;
      }

      .filters {
        display: grid;
        gap: .8rem;
      }

      .filters-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: .8rem;
      }

      .filters-head h3 {
        margin: 0;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem;
      }

      .filters-grid {
        display: grid;
        grid-template-columns: 1.6fr 1fr 1fr;
        gap: .8rem;
      }

      .stat-card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 1.1rem 1.2rem;
        display: flex;
        align-items: center;
        gap: .9rem;
        box-shadow: var(--shadow);
      }

      .stat-icon {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: var(--cream-50);
        color: var(--gold-500);
        border: 1px solid rgba(201, 162, 39, .16);
        flex: 0 0 auto;
      }

      .stat-icon svg {
        width: 22px;
        height: 22px;
      }

      .stat-icon.available {
        background: var(--navy-900);
        color: var(--white);
        border-color: var(--navy-900);
      }

      .stat-icon.occupied {
        background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
        color: var(--navy-950);
        border-color: var(--gold-500);
      }

      .stat-icon.maintenance {
        background: #7A2E2E;
        color: var(--white);
        border-color: #7A2E2E;
      }

      .stat-card strong {
        display: block;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.55rem;
        line-height: 1;
      }

      .stat-card small {
        display: block;
        color: var(--text-600);
        font-size: .78rem;
        margin-top: .3rem;
        font-weight: 650;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(300px, 380px) 1fr;
        gap: 1.1rem;
        align-items: start;
      }

      .card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 1.3rem 1.4rem;
        box-shadow: var(--shadow);
      }

      .card h3 {
        margin: 0 0 1rem;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.25rem;
      }

      .form-grid {
        display: grid;
        gap: .9rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .9rem;
      }

      label {
        display: grid;
        gap: .4rem;
        color: var(--navy-900);
        font-weight: 700;
        font-size: .85rem;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: .65rem .75rem;
        border: 1px solid var(--border);
        border-radius: 12px;
        font: inherit;
        color: var(--text-900);
        background: var(--cream-50);
        transition: .18s ease;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--gold-500);
        background: var(--white);
        box-shadow: 0 0 0 3px rgba(201, 162, 39, .16);
      }

      textarea {
        resize: vertical;
      }

      .actions {
        display: flex;
        gap: .6rem;
        margin-top: .3rem;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid var(--border);
        padding: .75rem .6rem;
        font-size: .88rem;
        color: var(--text-900);
      }

      th {
        color: var(--text-600);
        font-size: .72rem;
        text-transform: uppercase;
        letter-spacing: .06em;
        font-weight: 800;
      }

      tbody tr:hover {
        background: var(--cream-50);
      }

      td.muted {
        color: var(--text-600);
      }

      td.strong {
        font-weight: 800;
        color: var(--navy-900);
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: .3rem .65rem;
        border-radius: 999px;
        font-size: .72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .03em;
      }

      .status-badge.disponible {
        background: var(--navy-900);
        color: var(--white);
      }

      .status-badge.ocupada {
        background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
        color: var(--navy-950);
      }

      .status-badge.mantenimiento {
        background: #7A2E2E;
        color: var(--white);
      }

      .row-actions {
        display: flex;
        gap: .4rem;
      }

      .icon-action {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: var(--cream-50);
        color: var(--navy-900);
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: .18s ease;
      }

      .icon-action svg {
        width: 16px;
        height: 16px;
      }

      .icon-action:hover {
        background: var(--white);
        border-color: rgba(201, 162, 39, .45);
        color: var(--gold-500);
      }

      .icon-action.danger:hover {
        border-color: rgba(185, 28, 28, .35);
        color: #b91c1c;
      }

      .empty-state {
        display: grid;
        justify-items: center;
        gap: .6rem;
        padding: 2.2rem 0;
        color: var(--text-600);
      }

      .empty-state svg {
        width: 32px;
        height: 32px;
        color: var(--gold-500);
        opacity: .7;
      }

      .empty-state p {
        margin: 0;
        font-size: .9rem;
        font-weight: 650;
      }

      @media (max-width: 1100px) {
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 980px) {
        .filters-grid {
          grid-template-columns: 1fr;
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class HabitacionesAdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  habitaciones: HabitacionAdmin[] = [];
  cargando = false;
  guardando = false;
  editando = false;
  idEditando: number | null = null;
  mensaje = "";
  error = "";
  filtroTexto = "";
  filtroTipo = "";
  filtroEstado = "";

  readonly form = this.fb.group({
    numero_habitacion: ["", [Validators.required]],
    tipo: ["", [Validators.required]],
    capacidad: [2, [Validators.required, Validators.min(1)]],
    precio_noche: [200, [Validators.required, Validators.min(1)]],
    estado: ["Disponible", [Validators.required]],
    descripcion: [""]
  });

  ngOnInit(): void {
    this.cargar();
  }

  get total(): number {
    return this.habitaciones.length;
  }

  get disponibles(): number {
    return this.habitaciones.filter((h) => h.ESTADO === "Disponible").length;
  }

  get ocupadas(): number {
    return this.habitaciones.filter((h) => h.ESTADO === "Ocupada").length;
  }

  get mantenimiento(): number {
    return this.habitaciones.filter((h) => h.ESTADO === "Mantenimiento").length;
  }

  get habitacionesFiltradas(): HabitacionAdmin[] {
    const texto = this.filtroTexto.trim().toLowerCase();

    return this.habitaciones.filter((h) => {
      const matchTexto =
        !texto ||
        h.NUMERO_HABITACION.toLowerCase().includes(texto) ||
        h.TIPO.toLowerCase().includes(texto) ||
        (h.DESCRIPCION || "").toLowerCase().includes(texto);

      const matchTipo = !this.filtroTipo || h.TIPO === this.filtroTipo;
      const matchEstado = !this.filtroEstado || h.ESTADO === this.filtroEstado;

      return matchTexto && matchTipo && matchEstado;
    });
  }

  estadoClass(estado: HabitacionAdmin["ESTADO"]): string {
    if (estado === "Disponible") return "disponible";
    if (estado === "Ocupada") return "ocupada";
    return "mantenimiento";
  }

  limpiarFiltros(): void {
    this.filtroTexto = "";
    this.filtroTipo = "";
    this.filtroEstado = "";
  }

  cargar(): void {
    this.cargando = true;
    this.error = "";

    this.api.get<HabitacionAdmin[]>("/habitaciones").subscribe({
      next: (rows) => {
        this.habitaciones = rows;
        this.cargando = false;
      },
      error: () => {
        this.error = "No se pudo cargar el listado de habitaciones.";
        this.cargando = false;
      }
    });
  }

  nuevo(): void {
    this.editando = false;
    this.idEditando = null;
    this.form.reset({
      numero_habitacion: "",
      tipo: "",
      capacidad: 2,
      precio_noche: 200,
      estado: "Disponible",
      descripcion: ""
    });
    this.mensaje = "";
    this.error = "";
  }

  editar(h: HabitacionAdmin): void {
    this.editando = true;
    this.idEditando = h.ID_HABITACION;
    this.form.patchValue({
      numero_habitacion: h.NUMERO_HABITACION,
      tipo: h.TIPO,
      capacidad: h.CAPACIDAD,
      precio_noche: h.PRECIO_NOCHE,
      estado: h.ESTADO,
      descripcion: h.DESCRIPCION || ""
    });
    this.mensaje = "";
    this.error = "";
  }

  cancelar(): void {
    this.nuevo();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = "";
    this.mensaje = "";

    const body = this.form.getRawValue();
    const payload = {
      numero_habitacion: body.numero_habitacion,
      tipo: body.tipo,
      capacidad: Number(body.capacidad),
      precio_noche: Number(body.precio_noche),
      estado: body.estado,
      descripcion: body.descripcion || null
    };

    const request$ = this.editando && this.idEditando
      ? this.api.put(`/habitaciones/${this.idEditando}`, payload)
      : this.api.post("/habitaciones", payload);

    request$.subscribe({
      next: () => {
        this.mensaje = this.editando ? "Habitación actualizada." : "Habitación creada.";
        this.guardando = false;
        this.nuevo();
        this.cargar();
      },
      error: () => {
        this.error = this.editando
          ? "No se pudo actualizar la habitación."
          : "No se pudo crear la habitación.";
        this.guardando = false;
      }
    });
  }

  eliminar(h: HabitacionAdmin): void {
    const ok = confirm(`¿Eliminar habitación ${h.NUMERO_HABITACION}?`);
    if (!ok) return;

    this.error = "";
    this.mensaje = "";

    this.api.delete(`/habitaciones/${h.ID_HABITACION}`).subscribe({
      next: () => {
        this.mensaje = "Habitación eliminada.";
        if (this.idEditando === h.ID_HABITACION) {
          this.nuevo();
        }
        this.cargar();
      },
      error: () => {
        this.error = "No se pudo eliminar la habitación.";
      }
    });
  }
}