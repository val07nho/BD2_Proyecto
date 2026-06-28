import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ApiService } from "../../core/services/api.service";
import { TrackingService } from "../../core/services/tracking.service";
import { AuthService } from "../../core/services/auth.service";

interface Evento {
  ID_EVENTO: number;
  NOMBRE: string;
  DESCRIPCION?: string | null;
  FECHA_EVENTO: string;
  COSTO: number;
  CUPOS?: number | null;
  ESTADO: "A" | "I";
}

interface ReservaMini {
  ID_RESERVA: number;
  ESTADO: string;
  FECHA_INGRESO: string;
  FECHA_SALIDA: string;
}

@Component({
  selector: "app-eventos-cliente",
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule],
  template: `
    <section class="cliente-eventos">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Experiencias</span>
          <h1>Eventos en Aurea</h1>
          <p>Explora actividades, talleres y eventos especiales directamente desde la informacion registrada en la base de datos.</p>
        </div>
      </section>

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="toolbar card">
        <label>
          Buscar
          <input type="text" [value]="filtro" (input)="onFiltroChanged($any($event.target).value)" placeholder="Nombre o descripcion" />
        </label>
        <label class="check">
          <input type="checkbox" [checked]="soloActivos" (change)="soloActivos = $any($event.target).checked" />
          Mostrar solo activos
        </label>
      </section>

      <section class="stats">
        <article class="card stat"><strong>{{ total }}</strong><small>Total eventos</small></article>
        <article class="card stat"><strong>{{ activos }}</strong><small>Activos</small></article>
        <article class="card stat"><strong>{{ proximos }}</strong><small>Proximos</small></article>
      </section>

      <section class="eventos-grid">
        @if (cargando) {
          <p class="estado-msg">Cargando eventos...</p>
        } @else if (eventosFiltrados.length === 0) {
          <p class="estado-msg">No hay eventos para los filtros actuales.</p>
        } @else {
          @for (e of eventosFiltrados; track e.ID_EVENTO) {
            <article class="evento-card">
              <div class="cover" [style.background-image]="'url(' + imagenPara(e.ID_EVENTO) + ')'">
                <span class="badge" [class.inactivo]="e.ESTADO !== 'A'">{{ e.ESTADO === 'A' ? 'Activo' : 'Inactivo' }}</span>
              </div>

              <div class="body">
                <h3>{{ e.NOMBRE }}</h3>
                <p>{{ e.DESCRIPCION || 'Evento especial para huespedes del hotel.' }}</p>

                <ul>
                  <li><strong>Fecha:</strong> {{ e.FECHA_EVENTO | date: 'yyyy-MM-dd' }}</li>
                  <li><strong>Costo:</strong> S/ {{ e.COSTO | number: '1.2-2' }}</li>
                  <li><strong>Cupos:</strong> {{ e.CUPOS ?? 'No definido' }}</li>
                </ul>
              </div>
            </article>
          }
        }
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        --navy-900: #0B2540;
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
      .cliente-eventos { display: grid; gap: 1rem; }
      .hero {
        border-radius: 22px;
        min-height: 220px;
        background-image: linear-gradient(180deg, rgba(11,37,64,.56), rgba(11,37,64,.78)), url('https://picsum.photos/seed/eventos-hero/1500/620');
        background-size: cover;
        background-position: center;
        display: grid;
        align-items: end;
      }
      .hero-content { padding: 1.4rem; color: var(--white); max-width: 760px; }
      .eyebrow { color: var(--gold-300); text-transform: uppercase; letter-spacing: .14em; font-size: .73rem; font-weight: 900; }
      .hero h1 { margin: .35rem 0 .4rem; font-family: 'Playfair Display', serif; font-size: 2rem; }
      .hero p { margin: 0; color: rgba(255,255,255,.92); }
      .alert.error { border-radius: 12px; padding: .75rem .9rem; font-weight: 600; background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.2); }
      .card { border-radius: 14px; border: 1px solid var(--border); background: var(--white); box-shadow: var(--shadow); }
      .toolbar { display: flex; gap: .9rem; align-items: end; flex-wrap: wrap; padding: .95rem 1rem; }
      .toolbar label { display: grid; gap: .35rem; font-size: .78rem; color: var(--navy-900); font-weight: 700; }
      .toolbar input[type='text'] {
        min-width: 260px;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: .55rem .65rem;
        font: inherit;
        background: var(--cream-50);
      }
      .check { display: inline-flex; align-items: center; gap: .45rem; }
      .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; }
      .stat { padding: .9rem 1rem; }
      .stat strong { display: block; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.45rem; line-height: 1; }
      .stat small { color: var(--muted); font-size: .78rem; }
      .eventos-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
      .evento-card {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: var(--white);
        box-shadow: 0 12px 28px rgba(11,37,64,.08);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
      }
      .evento-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 18px 36px rgba(11,37,64,.12);
      }
      .cover {
        height: 160px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .badge {
        position: absolute;
        top: .65rem;
        right: .65rem;
        border-radius: 999px;
        background: #1f6b3d;
        color: var(--white);
        padding: .24rem .55rem;
        font-size: .7rem;
        font-weight: 700;
      }
      .badge.inactivo { background: #8A1E18; }
      .body { padding: .92rem .95rem; display: flex; flex-direction: column; flex-grow: 1; gap: .5rem; }
      .body h3 { margin: 0; color: var(--navy-900); font-size: 1.05rem; font-family: 'Playfair Display', serif; }
      .body p { margin: 0; color: var(--muted); font-size: .84rem; line-height: 1.4; flex-grow: 1; }
      .body ul { margin: 0; padding: 0; list-style: none; display: grid; gap: .22rem; color: var(--navy-900); font-size: .82rem; }
      .estado-msg { text-align: center; color: var(--muted); padding: 1rem; }

      /* Modal y Adquisición */
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11,37,64,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
      }
      .modal-card { width: 100%; max-width: 500px; overflow: hidden; }
      .modal-cover {
        height: 200px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .close-btn {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: rgba(255,255,255,0.8);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--navy-900);
      }
      .modal-body { padding: 1.5rem; display: grid; gap: 0.75rem; }
      .modal-eyebrow { color: var(--gold-500); text-transform: uppercase; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; }
      .modal-body h2 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; }
      .modal-price { font-size: 1.15rem; font-weight: 800; color: var(--gold-500); }
      .modal-desc { margin: 0; color: var(--muted); font-size: 0.88rem; line-height: 1.5; }
      .btn {
        padding: 0.58rem 1.25rem;
        font-weight: 700;
        border-radius: 8px;
        font-size: 0.84rem;
        cursor: pointer;
        border: none;
      }
      .btn.primary { background: var(--navy-900); color: var(--white); }
      .btn.success-btn { background: #1f6b3d; color: var(--white); }
      .btn.success-btn:hover { background: #17522f; }
      .btn:disabled { opacity: 0.7; cursor: not-allowed; }

      .alert { border-radius: 12px; padding: .72rem .92rem; font-weight: 600; font-size: .86rem; }
      .alert.success { background: rgba(46,125,50,.12); color: #1F5F23; border: 1px solid rgba(46,125,50,.24); }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }

      .adquisicion-section {
        border-top: 1px dashed var(--border);
        margin-top: 1rem;
        padding-top: 1rem;
      }
      .adquisicion-section h3 {
        margin: 0 0 0.75rem 0;
        font-family: 'Playfair Display', serif;
        font-size: 1.1rem;
        color: var(--navy-900);
      }
      .warning-text {
        color: #8A6A00;
        font-size: 0.85rem;
        font-weight: 600;
      }
      .adquisicion-form {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .adquisicion-form label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--navy-700);
      }
      .adquisicion-form select, .adquisicion-form input {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.55rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }

      @media (max-width: 1100px) {
        .stats { grid-template-columns: 1fr; }
        .eventos-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 700px) {
        .eventos-grid { grid-template-columns: 1fr; }
        .hero h1 { font-size: 1.6rem; }
      }
    `
  ]
})
export class EventosClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly trackingService = inject(TrackingService);
  private readonly auth = inject(AuthService);

  eventos: Evento[] = [];
  cargando = false;
  error = "";
  filtro = "";
  soloActivos = true;

  mostrarModal = false;
  eventoSeleccionado: Evento | null = null;

  idHuespedActual: number | null = null;
  reservasActivas: ReservaMini[] = [];
  idReservaSeleccionada: number | null = null;
  cantidadAdquirir = 1;
  adquiriendo = false;
  mensajeExito = "";
  errorAdquisicion = "";

  ngOnInit(): void {
    this.trackingService.registrarVisita("Eventos", "Ingresó al módulo");
    this.cargarEventos();
    this.cargarHuespedYReservas();
  }

  onFiltroChanged(val: string): void {
    this.filtro = val;
    if (val.trim()) {
      this.trackingService.registrarBusqueda(val.trim());
    }
  }

  get total(): number {
    return this.eventos.length;
  }

  get activos(): number {
    return this.eventos.filter((e) => e.ESTADO === "A").length;
  }

  get proximos(): number {
    const now = new Date();
    return this.eventos.filter((e) => new Date(e.FECHA_EVENTO) >= now).length;
  }

  get eventosFiltrados(): Evento[] {
    const txt = this.filtro.trim().toLowerCase();
    return this.eventos
      .filter((e) => {
        const okEstado = !this.soloActivos || e.ESTADO === "A";
        const okTexto = !txt || e.NOMBRE.toLowerCase().includes(txt) || String(e.DESCRIPCION || "").toLowerCase().includes(txt);
        return okEstado && okTexto;
      })
      .sort((a, b) => new Date(a.FECHA_EVENTO).getTime() - new Date(b.FECHA_EVENTO).getTime());
  }

  cargarEventos(): void {
    this.cargando = true;
    this.error = "";
    this.api.get<Evento[]>("/eventos").subscribe({
      next: (rows) => {
        this.eventos = rows;
        this.cargando = false;
      },
      error: () => {
        this.error = "No se pudieron cargar los eventos desde la base de datos.";
        this.cargando = false;
      }
    });
  }

  cargarHuespedYReservas(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.api.get<any[]>("/huespedes").subscribe({
      next: (rows) => {
        const actual = rows.find((h) => Number(h.ID_USUARIO) === userId);
        this.idHuespedActual = actual?.ID_HUESPED ?? null;

        if (this.idHuespedActual) {
          this.api.get<any[]>("/reservas").subscribe({
            next: (reservas) => {
              this.reservasActivas = reservas
                .filter((r) => Number(r.ID_HUESPED) === this.idHuespedActual && 
                  ["PENDIENTE", "CONFIRMADA"].includes(String(r.ESTADO).toUpperCase().trim()))
                .sort((a, b) => Number(b.ID_RESERVA) - Number(a.ID_RESERVA));
            }
          });
        }
      }
    });
  }

  verDetalleEvento(e: Evento): void {
    this.trackingService.registrarVisita("Eventos", `Ver evento ${e.NOMBRE}`);
    this.eventoSeleccionado = e;
    this.mostrarModal = true;
    this.mensajeExito = "";
    this.errorAdquisicion = "";
    this.idReservaSeleccionada = null;
    this.cantidadAdquirir = 1;
    this.cargarHuespedYReservas(); // recargar estado
  }

  adquirir(): void {
    if (!this.idReservaSeleccionada || !this.eventoSeleccionado) return;
    this.adquiriendo = true;
    this.errorAdquisicion = "";
    this.mensajeExito = "";

    const payload = {
      id_reserva: this.idReservaSeleccionada,
      id_evento: this.eventoSeleccionado.ID_EVENTO,
      cantidad: this.cantidadAdquirir
    };

    this.api.post("/eventos/adquirir", payload).subscribe({
      next: () => {
        this.adquiriendo = false;
        this.mensajeExito = "Entrada adquirida exitosamente y costo cargado a tu factura final.";
        this.trackingService.registrarVisita("Eventos", `Adquirió evento ${this.eventoSeleccionado?.NOMBRE}`);
        this.idReservaSeleccionada = null;
        this.cantidadAdquirir = 1;
      },
      error: (err) => {
        this.adquiriendo = false;
        this.errorAdquisicion = err?.error?.message || "No se pudieron adquirir las entradas. Inténtalo de nuevo.";
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.eventoSeleccionado = null;
    this.mensajeExito = "";
    this.errorAdquisicion = "";
  }

  imagenPara(id: number): string {
    return `https://picsum.photos/seed/evento-${id}/900/550`;
  }
}
