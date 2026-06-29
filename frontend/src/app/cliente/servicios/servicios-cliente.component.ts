import { CommonModule, DecimalPipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { TrackingService } from "../../core/services/tracking.service";
import { AuthService } from "../../core/services/auth.service";

interface Servicio {
  ID_SERVICIO: number;
  NOMBRE: string;
  PRECIO: number;
  DESCRIPCION?: string | null;
  ESTADO: "A" | "I" | string;
}

interface ReservaMini {
  ID_RESERVA: number;
  ESTADO: string;
  FECHA_INGRESO: string;
  FECHA_SALIDA: string;
  NUMERO_HABITACION?: string;
}

interface ConsumoServicio {
  ID_CONSUMO: number;
  CANTIDAD: number;
  SUBTOTAL: number;
  FECHA: string;
  SERVICIO_NOMBRE: string;
  SERVICIO_PRECIO: number;
  ID_RESERVA: number;
  NUMERO_HABITACION?: string;
  RESERVA_ESTADO?: string;
}

@Component({
  selector: "app-servicios-cliente",
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule],
  template: `
    <section class="cliente-servicios">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Experiencias Exclusivas</span>
          <h1>Servicios de Aurea Resort & Spa</h1>
          <p>Personaliza tu estadía con nuestra selecta gama de servicios premium disponibles durante tu estancia.</p>
        </div>
      </section>

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }
      @if (mensajeExito) {
        <div class="alert success">{{ mensajeExito }}</div>
      }

      <!-- 1. MIS CONSUMOS ADQUIRIDOS (PRIMERO - ARRIBA) -->
      <section class="card agenda-card">
        <div class="card-head">
          <div>
            <h3>Mis Servicios Adquiridos</h3>
            <p class="subtitle">Consumos y amenidades registradas para tus próximas vacaciones.</p>
          </div>
          <button class="btn ghost" type="button" (click)="cargarMisServicios()" [disabled]="cargandoConsumos">
            Actualizar Servicios
          </button>
        </div>

        @if (cargandoConsumos) {
          <p class="empty-msg">Cargando servicios solicitados...</p>
        } @else if (misServiciosAdquiridos.length === 0) {
          <p class="empty-msg">Aún no has solicitado ningún servicio adicional para tu estadía.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código de Reserva</th>
                  <th>Habitación</th>
                  <th>Servicio Adquirido</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Total Facturado</th>
                  <th>Estado de Pago</th>
                  <th>Fecha de Solicitud</th>
                </tr>
              </thead>
              <tbody>
                @for (item of misServiciosAdquiridos; track item.ID_CONSUMO) {
                  <tr>
                    <td class="res-code">{{ formatearCodigoReserva(item.ID_RESERVA) }}</td>
                    <td><strong>{{ item.NUMERO_HABITACION ? 'Hab. N° ' + item.NUMERO_HABITACION : '-' }}</strong></td>
                    <td class="event-name">{{ item.SERVICIO_NOMBRE }}</td>
                    <td>S/ {{ item.SERVICIO_PRECIO | number: '1.2-2' }}</td>
                    <td class="qty">{{ item.CANTIDAD }} u.</td>
                    <td class="amount">S/ {{ item.SUBTOTAL | number: '1.2-2' }}</td>
                    <td>
                      @if (item.RESERVA_ESTADO === 'PENDIENTE') {
                        <span class="badge-status pendiente">Por Pagar (En Factura)</span>
                      } @else if (item.RESERVA_ESTADO === 'CONFIRMADA') {
                        <span class="badge-status pagado">Pagado (Estadía Confirmada)</span>
                      } @else {
                        <span class="badge-status finalizado">{{ item.RESERVA_ESTADO }}</span>
                      }
                    </td>
                    <td>{{ item.FECHA | date: 'dd MMM, yyyy - hh:mm a' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- 2. SERVICIOS DISPONIBLES (ABAJO) -->
      <section class="card list-card">
        <div class="list-head">
          <div>
            <h3>Catálogo de Servicios Premium</h3>
            <p class="subtitle">Agrega amenidades exclusivas a tu estancia pendiente de pago.</p>
          </div>
        </div>

        <div class="toolbar">
          <label class="search-label">
            Buscar Servicio
            <input type="text" [value]="filtro" (input)="onFiltroChanged($any($event.target).value)" placeholder="Spa, cena, piscina..." />
          </label>
          <div class="stats-pills">
            <span class="pill"><strong>{{ servicios.length }}</strong> Amenidades Disponibles</span>
          </div>
        </div>

        @if (cargando) {
          <p class="empty-msg">Cargando catálogo...</p>
        } @else if (serviciosFiltrados.length === 0) {
          <p class="empty-msg">No se encontraron servicios con los filtros actuales.</p>
        } @else {
          <div class="servicios-grid">
            @for (s of serviciosFiltrados; track s.ID_SERVICIO) {
              <article class="servicio-card" (click)="verDetalleServicio(s)">
                <div class="cover" [style.background-image]="'url(' + imagenPara(s.ID_SERVICIO) + ')'">
                  <span class="price-badge">S/ {{ s.PRECIO | number: '1.2-2' }}</span>
                </div>

                <div class="body">
                  <h3>{{ s.NOMBRE }}</h3>
                  <p class="desc">{{ s.DESCRIPCION || 'Servicio de primera clase disponible para elevar tu estadía al siguiente nivel.' }}</p>

                  <button class="action-btn" type="button">
                    Solicitar Servicio
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <!-- Modal de Adquisición de Servicio Premium -->
      @if (mostrarModal && servicioSeleccionado) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div>
                <span class="eyebrow">Solicitud de Servicio</span>
                <h2>{{ servicioSeleccionado.NOMBRE }}</h2>
                <p class="section-desc">Código Servicio: SERV-{{ servicioSeleccionado.ID_SERVICIO }}</p>
              </div>
              <button class="close-btn" type="button" (click)="cerrarModal()">&times;</button>
            </header>

            <div class="modal-body">
              <p class="modal-desc">{{ servicioSeleccionado.DESCRIPCION || 'Disfruta de este servicio exclusivo. El costo acumulado se añadirá directamente a la cuenta consolidada de tu hospedaje.' }}</p>
              
              <div class="adquisicion-section">
                @if (reservasActivas.length === 0) {
                  <div class="warning-box">
                    <span class="warning-icon">⚠️</span>
                    <p class="warning-text">Solo puedes solicitar servicios si cuentas con una reserva de habitación en estado PENDIENTE de pago (factura abierta).</p>
                  </div>
                } @else {
                  <form class="adquisicion-form">
                    <label>
                      Selecciona tu Estadía Pendiente
                      <select [(ngModel)]="idReservaSeleccionada" name="reserva">
                        <option [ngValue]="null">Elige una estancia pendiente...</option>
                        @for (r of reservasActivas; track r.ID_RESERVA) {
                          <option [ngValue]="r.ID_RESERVA">
                            {{ formatearCodigoReserva(r.ID_RESERVA) }} - Habitación N° {{ r.NUMERO_HABITACION || '-' }} ({{ r.FECHA_INGRESO | date: 'dd/MM' }} al {{ r.FECHA_SALIDA | date: 'dd/MM' }})
                          </option>
                        }
                      </select>
                    </label>

                    <div class="form-row">
                      <label>
                        Cantidad / Personas
                        <input type="number" min="1" max="50" [(ngModel)]="cantidadAdquirir" name="cantidad" />
                      </label>
                      
                      <div class="unit-price">
                        <small>Costo por servicio</small>
                        <strong>S/ {{ servicioSeleccionado.PRECIO | number: '1.2-2' }}</strong>
                      </div>
                    </div>
                  </form>

                  @if (idReservaSeleccionada) {
                    <div class="summary-card">
                      <h4>Detalle de Factura Comercial</h4>
                      <div class="summary-row">
                        <span>Precio Unitario:</span>
                        <span>S/ {{ servicioSeleccionado.PRECIO | number: '1.2-2' }}</span>
                      </div>
                      <div class="summary-row">
                        <span>Cantidad solicitada:</span>
                        <span>{{ cantidadAdquirir }} unidades</span>
                      </div>
                      <div class="divider"></div>
                      <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>S/ {{ (servicioSeleccionado.PRECIO * cantidadAdquirir / 1.18) | number: '1.2-2' }}</span>
                      </div>
                      <div class="summary-row">
                        <span>IGV (18%):</span>
                        <span>S/ {{ (servicioSeleccionado.PRECIO * cantidadAdquirir - (servicioSeleccionado.PRECIO * cantidadAdquirir / 1.18)) | number: '1.2-2' }}</span>
                      </div>
                      <div class="divider"></div>
                      <div class="summary-row total">
                        <span>Monto total a cargar:</span>
                        <strong class="total-monto">S/ {{ (servicioSeleccionado.PRECIO * cantidadAdquirir) | number: '1.2-2' }}</strong>
                      </div>
                    </div>
                  }
                }
              </div>

              @if (errorAdquisicion) {
                <div class="alert error" style="margin-top: 0.8rem;">{{ errorAdquisicion }}</div>
              }
            </div>

            <footer class="modal-footer">
              <button type="button" class="btn ghost" (click)="cerrarModal()" [disabled]="adquiriendo">Cancelar</button>
              <button type="button" class="btn primary" [disabled]="!idReservaSeleccionada || adquiriendo" (click)="adquirir()">
                {{ adquiriendo ? 'Procesando...' : 'Confirmar Adquisición' }}
              </button>
            </footer>
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
      .cliente-servicios { display: grid; gap: 1.2rem; }
      
      .hero {
        border-radius: 24px;
        min-height: 180px;
        background: linear-gradient(120deg, #F3E9D6, var(--cream-50));
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        padding: 1.5rem 1.8rem;
      }
      .hero-content { max-width: 680px; }
      .eyebrow { color: var(--gold-500); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 900; }
      .hero h1 { margin: .3rem 0 .45rem; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 2rem; }
      .hero p { margin: 0; color: var(--muted); font-size: 0.9rem; line-height: 1.5; }

      .alert { border-radius: 12px; padding: .75rem 1rem; font-weight: 600; font-size: .86rem; }
      .alert.success { background: rgba(201,162,39,.1); color: #8A6A00; border: 1px solid rgba(201,162,39,.2); }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }

      .card {
        border-radius: 20px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1.5rem 1.6rem;
      }
      
      .card-head, .list-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.2rem;
        flex-wrap: wrap;
      }
      h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.35rem; }
      .subtitle { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.8rem; }

      /* Tabla de Consumos */
      .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
      table { width: 100%; border-collapse: collapse; text-align: left; font-size: .86rem; min-width: 900px; }
      th, td { padding: 0.95rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
      th { background: #FAF9F6; color: var(--navy-700); font-weight: 800; font-size: .76rem; text-transform: uppercase; letter-spacing: 0.05em; }
      td { color: var(--navy-900); }
      .res-code { font-family: 'Courier New', monospace; font-weight: 700; color: var(--navy-700); }
      .event-name { font-weight: 700; color: var(--navy-900); }
      .qty { font-weight: 600; color: var(--muted); }
      .amount { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 0.95rem; color: var(--navy-900); }
      .empty-msg { text-align: center; color: var(--muted); font-style: italic; padding: 2rem 0; margin: 0; font-size: 0.9rem; }
      .badge-status {
        display: inline-block;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
      }
      .badge-status.pendiente { background: rgba(201,162,39,0.1); color: #8A6A00; border: 1px solid rgba(201,162,39,0.25); }
      .badge-status.pagado { background: rgba(11,37,64,0.06); color: var(--navy-900); border: 1px solid rgba(11,37,64,0.12); }
      .badge-status.finalizado { background: rgba(0,0,0,0.05); color: var(--muted); border: 1px solid var(--border); }

      /* Cartelera de Servicios */
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .search-label { display: grid; gap: 0.4rem; font-size: 0.78rem; font-weight: 700; color: var(--navy-700); }
      .toolbar input {
        min-width: 320px;
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.58rem 0.7rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }
      .stats-pills { display: flex; gap: 0.5rem; }
      .pill {
        background: var(--cream-50);
        border: 1px solid var(--border);
        padding: 0.35rem 0.7rem;
        border-radius: 20px;
        font-size: 0.78rem;
        color: var(--navy-900);
      }
      .pill strong { color: var(--gold-500); }

      /* Grid de Cartas */
      .servicios-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; }
      .servicio-card {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: var(--white);
        box-shadow: 0 12px 28px rgba(11,37,64,.04);
        cursor: pointer;
        transition: transform 0.25s, box-shadow 0.25s;
        display: flex;
        flex-direction: column;
      }
      .servicio-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(11,37,64,.1);
      }
      .servicio-card .cover {
        height: 150px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .price-badge {
        position: absolute;
        bottom: 0.8rem;
        left: 0.8rem;
        background: var(--navy-900);
        color: var(--white);
        padding: 0.3rem 0.6rem;
        border-radius: 8px;
        font-family: 'Playfair Display', serif;
        font-weight: 700;
        font-size: 0.84rem;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      }
      .servicio-card .body { padding: 1rem; display: flex; flex-direction: column; flex-grow: 1; gap: 0.6rem; }
      .servicio-card h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.1rem; }
      .servicio-card .desc { margin: 0; color: var(--muted); font-size: 0.8rem; line-height: 1.4; flex-grow: 1; }
      
      .action-btn {
        width: 100%;
        border: 1px solid var(--gold-300);
        border-radius: 8px;
        background: rgba(201,162,39,0.03);
        color: var(--gold-500);
        padding: 0.5rem;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s;
        margin-top: 0.2rem;
      }
      .action-btn:hover { background: var(--gold-500); color: var(--navy-900); }

      /* Modales Premium */
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(11, 37, 64, 0.45);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }
      .modal-card {
        background: var(--white);
        border-radius: 24px;
        border: 1px solid var(--border);
        box-shadow: 0 30px 70px rgba(11,37,64,0.18);
        width: 100%;
        max-width: 480px;
        padding: 1.8rem;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.8rem;
        margin-bottom: 1rem;
      }
      .modal-header h2 {
        margin: 0.2rem 0;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 1.4rem;
      }
      .modal-header .section-desc { margin: 0; color: var(--muted); font-size: 0.8rem; }
      .close-btn { background: none; border: none; font-size: 1.6rem; color: var(--muted); cursor: pointer; line-height: 1; }
      .modal-desc { margin: 0 0 1rem; color: var(--muted); font-size: 0.84rem; line-height: 1.5; }

      .adquisicion-section { display: grid; gap: 0.8rem; }
      .warning-box {
        display: flex;
        gap: 0.6rem;
        background: rgba(179,38,30,.06);
        border: 1px solid rgba(179,38,30,.15);
        padding: 0.8rem;
        border-radius: 12px;
      }
      .warning-icon { font-size: 1.1rem; }
      .warning-text { margin: 0; color: #8A1E18; font-size: 0.78rem; font-weight: 500; line-height: 1.4; }

      .adquisicion-form { display: grid; gap: 0.8rem; }
      .adquisicion-form label { display: grid; gap: 0.35rem; font-size: 0.78rem; font-weight: 700; color: var(--navy-700); }
      .adquisicion-form select, .adquisicion-form input {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.58rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }
      .form-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 0.8rem; align-items: end; }
      .unit-price {
        display: grid;
        justify-content: end;
        text-align: right;
        padding-bottom: 0.2rem;
      }
      .unit-price small { color: var(--muted); font-size: 0.74rem; }
      .unit-price strong { color: var(--gold-500); font-size: 1.15rem; font-family: 'Playfair Display', serif; }

      /* Resumen de Factura */
      .summary-card {
        background: var(--cream-50);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1rem;
      }
      .summary-card h4 {
        margin: 0 0 0.6rem;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 0.9rem;
        border-bottom: 1px solid rgba(11,37,64,0.06);
        padding-bottom: 0.3rem;
      }
      .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; font-size: 0.8rem; }
      .summary-row span { color: var(--muted); }
      .divider { height: 1px; background: var(--border); margin: 0.6rem 0; }
      .summary-row.total { margin-bottom: 0; }
      .total-monto { font-size: 1.2rem; color: var(--gold-500); font-family: 'Playfair Display', serif; }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1.2rem;
        border-top: 1px solid var(--border);
        margin-top: 0.8rem;
      }

      /* Botones Generales */
      .btn {
        border: none;
        border-radius: 9px;
        padding: .55rem .95rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: .15s ease-in-out;
        font-size: .8rem;
      }
      .btn.primary { background: var(--gold-500); color: var(--navy-900); }
      .btn.primary:hover { background: var(--gold-300); transform: translateY(-1px); }
      .btn.primary:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
      .btn.ghost { background: transparent; color: var(--navy-700); border: 1px solid var(--border); }
      .btn.ghost:hover { background: var(--cream-50); }
    `
  ]
})
export class ServiciosClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly trackingService = inject(TrackingService);
  private readonly auth = inject(AuthService);

  servicios: Servicio[] = [];
  misServiciosAdquiridos: ConsumoServicio[] = [];

  cargando = false;
  cargandoConsumos = false;
  error = "";
  filtro = "";
  soloActivos = true;

  mostrarModal = false;
  servicioSeleccionado: Servicio | null = null;

  reservasActivas: ReservaMini[] = [];
  idReservaSeleccionada: number | null = null;
  cantidadAdquirir = 1;
  adquiriendo = false;
  mensajeExito = "";
  errorAdquisicion = "";

  ngOnInit(): void {
    this.trackingService.registrarVisita("Servicios", "Ingresó al catálogo");
    this.cargarServicios();
    this.cargarHuespedYReservas();
    this.cargarMisServicios();
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

  cargarMisServicios(): void {
    this.cargandoConsumos = true;
    this.api.get<ConsumoServicio[]>("/servicios/mis-servicios").subscribe({
      next: (rows) => {
        this.misServiciosAdquiridos = rows;
        this.cargandoConsumos = false;
      },
      error: () => {
        this.cargandoConsumos = false;
      }
    });
  }

  cargarHuespedYReservas(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.api.get<any[]>("/huespedes").subscribe({
      next: (rows) => {
        const actual = rows.find((h) => Number(h.ID_USUARIO) === userId);
        const idHuespedActual = actual?.ID_HUESFED || actual?.ID_HUESPED || null;

        if (idHuespedActual) {
          this.api.get<any[]>("/reservas").subscribe({
            next: (reservas) => {
              this.reservasActivas = reservas
                .filter((r) => Number(r.ID_HUESPED) === idHuespedActual && 
                  String(r.ESTADO).toUpperCase().trim() === "PENDIENTE")
                .sort((a, b) => Number(b.ID_RESERVA) - Number(a.ID_RESERVA));
            }
          });
        }
      }
    });
  }

  verDetalleServicio(s: Servicio): void {
    this.trackingService.registrarVisita("Servicios", `Ver servicio ${s.NOMBRE}`);
    this.servicioSeleccionado = s;
    this.mostrarModal = true;
    this.mensajeExito = "";
    this.errorAdquisicion = "";
    this.idReservaSeleccionada = null;
    this.cantidadAdquirir = 1;
    this.cargarHuespedYReservas();
  }

  adquirir(): void {
    if (!this.idReservaSeleccionada || !this.servicioSeleccionado) return;
    this.adquiriendo = true;
    this.errorAdquisicion = "";
    this.mensajeExito = "";

    const payload = {
      id_reserva: this.idReservaSeleccionada,
      id_servicio: this.servicioSeleccionado.ID_SERVICIO,
      cantidad: this.cantidadAdquirir
    };

    this.api.post("/servicios/adquirir", payload).subscribe({
      next: () => {
        this.adquiriendo = false;
        this.mensajeExito = "El servicio ha sido solicitado y el costo total ha sido cargado a la factura de tu estadía.";
        this.trackingService.registrarVisita("Servicios", `Adquirió servicio ${this.servicioSeleccionado?.NOMBRE}`);
        this.cerrarModal();
        this.cargarMisServicios();
        this.cargarServicios();
      },
      error: (err) => {
        this.adquiriendo = false;
        this.errorAdquisicion = err?.error?.message || "No se pudo adquirir el servicio. Inténtalo de nuevo.";
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.servicioSeleccionado = null;
    this.idReservaSeleccionada = null;
    this.cantidadAdquirir = 1;
  }

  imagenPara(id: number): string {
    return `https://picsum.photos/seed/servicio-${id}/900/550`;
  }

  formatearCodigoReserva(id: number): string {
    if (!id) return "";
    return `RES-${String(id).padStart(4, "0")}`;
  }
}
