import { CommonModule, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { TrackingService } from "../../core/services/tracking.service";

interface Servicio {
  ID_SERVICIO: number;
  NOMBRE: string;
  PRECIO: number;
  DESCRIPCION?: string | null;
  ESTADO: "A" | "I" | string;
}

@Component({
  selector: "app-servicios-cliente",
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <section class="cliente-servicios">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Experiencias Exclusivas</span>
          <h1>Servicios de Aurea Resort & Spa</h1>
          <p>Disfruta de nuestra selecta gama de servicios diseñados para hacer tu estadía perfecta. Consulta detalles y precios aquí.</p>
        </div>
      </section>

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="toolbar card">
        <label>
          Buscar servicio:
          <input type="text" [value]="filtro" (input)="onFiltroChanged($any($event.target).value)" placeholder="Spa, cena, piscina..." />
        </label>
        <label class="check">
          <input type="checkbox" [checked]="soloActivos" (change)="soloActivos = $any($event.target).checked" />
          Mostrar solo disponibles
        </label>
      </section>

      <section class="servicios-grid">
        @if (cargando) {
          <p class="estado-msg">Cargando servicios...</p>
        } @else if (serviciosFiltrados.length === 0) {
          <p class="estado-msg">No se encontraron servicios con los criterios de búsqueda.</p>
        } @else {
          @for (s of serviciosFiltrados; track s.ID_SERVICIO) {
            <article class="servicio-card" (click)="verDetalleServicio(s)">
              <div class="cover" [style.background-image]="'url(' + imagenPara(s.ID_SERVICIO) + ')'">
                <span class="badge" [class.inactivo]="s.ESTADO !== 'A'">
                  {{ s.ESTADO === 'A' ? 'Disponible' : 'No Disponible' }}
                </span>
              </div>

              <div class="body">
                <div class="body-header">
                  <h3>{{ s.NOMBRE }}</h3>
                  <span class="price">S/ {{ s.PRECIO | number: '1.2-2' }}</span>
                </div>
                <p>{{ s.DESCRIPCION || 'Servicio premium disponible para todos nuestros huéspedes.' }}</p>
                <div class="card-footer">
                  <span class="action-trigger">Ver más detalles &rarr;</span>
                </div>
              </div>
            </article>
          }
        }
      </section>

      <!-- Modal de Detalles del Servicio -->
      @if (mostrarModal && servicioSeleccionado) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-card card" (click)="$event.stopPropagation()">
            <div class="modal-cover" [style.background-image]="'url(' + imagenPara(servicioSeleccionado.ID_SERVICIO) + ')'">
              <button class="close-btn" type="button" (click)="cerrarModal()">&times;</button>
            </div>
            <div class="modal-body">
              <span class="modal-eyebrow">Detalles del Servicio</span>
              <h2>{{ servicioSeleccionado.NOMBRE }}</h2>
              <span class="modal-price">Costo: S/ {{ servicioSeleccionado.PRECIO | number: '1.2-2' }}</span>
              <p class="modal-desc">
                {{ servicioSeleccionado.DESCRIPCION || 'Este servicio exclusivo está disponible para reserva directa durante tu estancia. Nuestro personal estará encantado de asistirte para coordinar horarios y solicitudes específicas.' }}
              </p>
              <div class="modal-actions">
                <button class="btn primary" type="button" (click)="cerrarModal()">Entendido</button>
              </div>
            </div>
          </div>
        </div>
      }
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
      .cliente-servicios { display: grid; gap: 1rem; }
      
      .hero {
        border-radius: 22px;
        min-height: 220px;
        background-image: linear-gradient(180deg, rgba(11,37,64,.5), rgba(11,37,64,.75)), url('https://picsum.photos/seed/servicios-hero/1500/620');
        background-size: cover;
        background-position: center;
        display: grid;
        align-items: end;
      }
      .hero-content { padding: 2rem; color: var(--white); max-width: 760px; }
      .eyebrow { color: var(--gold-300); text-transform: uppercase; letter-spacing: .14em; font-size: .73rem; font-weight: 900; }
      .hero h1 { margin: .35rem 0 .4rem; font-family: 'Playfair Display', serif; font-size: 2.2rem; }
      .hero p { margin: 0; color: rgba(255,255,255,.9); font-size: 0.95rem; }

      .alert.error { border-radius: 12px; padding: .75rem .9rem; font-weight: 600; background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.2); }
      
      .card { border-radius: 14px; border: 1px solid var(--border); background: var(--white); box-shadow: var(--shadow); }
      .toolbar { display: flex; gap: .9rem; align-items: end; flex-wrap: wrap; padding: .95rem 1rem; }
      .toolbar label { display: grid; gap: .35rem; font-size: .78rem; color: var(--navy-900); font-weight: 700; }
      .toolbar input[type='text'] {
        min-width: 280px;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: .55rem .65rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }
      .check { display: inline-flex; align-items: center; gap: .45rem; cursor: pointer; }

      .servicios-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
      .servicio-card {
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
      .servicio-card:hover {
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
      
      .body { padding: 1rem; display: flex; flex-direction: column; flex-grow: 1; gap: 0.5rem; }
      .body-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
      .body h3 { margin: 0; color: var(--navy-900); font-size: 1.1rem; font-family: 'Playfair Display', serif; }
      .price { font-weight: 800; color: var(--gold-500); font-size: 1rem; white-space: nowrap; }
      .body p { margin: 0; color: var(--muted); font-size: .84rem; line-height: 1.4; flex-grow: 1; }
      
      .card-footer { margin-top: auto; padding-top: 0.5rem; border-top: 1px dashed var(--border); }
      .action-trigger { font-size: 0.78rem; font-weight: 700; color: var(--navy-700); }

      .estado-msg { text-align: center; color: var(--muted); padding: 2rem; grid-column: 1 / -1; }

      /* Modal */
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
      .modal-actions { margin-top: 0.5rem; display: flex; justify-content: flex-end; }
      .btn {
        padding: 0.58rem 1.25rem;
        font-weight: 700;
        border-radius: 8px;
        font-size: 0.84rem;
        cursor: pointer;
        border: none;
      }
      .btn.primary { background: var(--navy-900); color: var(--white); }

      @media (max-width: 1100px) {
        .servicios-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 700px) {
        .servicios-grid { grid-template-columns: 1fr; }
        .hero h1 { font-size: 1.6rem; }
      }
    `
  ]
})
export class ServiciosClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly trackingService = inject(TrackingService);

  servicios: Servicio[] = [];
  cargando = false;
  error = "";
  filtro = "";
  soloActivos = true;

  mostrarModal = false;
  servicioSeleccionado: Servicio | null = null;

  ngOnInit(): void {
    this.trackingService.registrarVisita("Servicios", "Ingresó al módulo");
    this.cargarServicios();
  }

  onFiltroChanged(val: string): void {
    this.filtro = val;
    if (val.trim()) {
      this.trackingService.registrarBusqueda(val.trim());
    }
  }

  get serviciosFiltrados(): Servicio[] {
    const txt = this.filtro.trim().toLowerCase();
    return this.servicios
      .filter((s) => {
        const okEstado = !this.soloActivos || s.ESTADO === "A";
        const okTexto = !txt || s.NOMBRE.toLowerCase().includes(txt) || String(s.DESCRIPCION || "").toLowerCase().includes(txt);
        return okEstado && okTexto;
      })
      .sort((a, b) => a.NOMBRE.localeCompare(b.NOMBRE));
  }

  cargarServicios(): void {
    this.cargando = true;
    this.error = "";
    this.api.get<Servicio[]>("/servicios").subscribe({
      next: (rows) => {
        this.servicios = rows;
        this.cargando = false;
      },
      error: () => {
        this.error = "No se pudieron cargar los servicios desde la base de datos.";
        this.cargando = false;
      }
    });
  }

  verDetalleServicio(s: Servicio): void {
    this.trackingService.registrarVisita("Servicios", `Ver servicio ${s.NOMBRE}`);
    this.servicioSeleccionado = s;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.servicioSeleccionado = null;
  }

  imagenPara(id: number): string {
    return `https://picsum.photos/seed/servicio-${id}/900/550`;
  }
}
