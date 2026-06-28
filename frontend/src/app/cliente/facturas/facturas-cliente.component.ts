import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface Huesped {
  ID_HUESPED: number;
  ID_USUARIO: number | null;
}

interface Reserva {
  ID_RESERVA: number;
  ID_HUESPED: number;
  FECHA_INGRESO?: string;
  FECHA_SALIDA?: string;
  ESTADO?: string;
  NUMERO_HABITACION?: string;
}

interface Factura {
  ID_FACTURA: number;
  ID_RESERVA: number;
  FECHA_EMISION?: string;
  SUBTOTAL?: number;
  IGV?: number;
  TOTAL?: number;
  ESTADO_PAGO?: string;
}

interface FacturaView extends Factura {
  reserva?: Reserva;
}

@Component({
  selector: "app-facturas-cliente",
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  template: `
    <section class="cliente-facturas">
      <section class="hero">
        <div>
          <span class="eyebrow">Facturación</span>
          <h1>Mis facturas</h1>
          <p>Consulta tus comprobantes emitidos y el estado de pago de cada reserva.</p>
        </div>

        <div class="hero-stats">
          <article>
            <strong>{{ facturas.length }}</strong>
            <small>Total facturas</small>
          </article>
          <article>
            <strong>S/ {{ totalFacturado | number: '1.2-2' }}</strong>
            <small>Monto total</small>
          </article>
          <article>
            <strong>{{ pendientes }}</strong>
            <small>Pendientes</small>
          </article>
        </div>
      </section>

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="card">
        <div class="card-head">
          <h3>Detalle de facturas</h3>
          <button class="btn ghost" type="button" (click)="cargar()" [disabled]="cargando">Actualizar</button>
        </div>

        @if (cargando) {
          <p class="empty">Cargando facturas...</p>
        } @else if (facturas.length === 0) {
          <p class="empty">No tienes facturas registradas todavía.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reserva</th>
                  <th>Emisión</th>
                  <th>Habitación</th>
                  <th>Subtotal</th>
                  <th>IGV</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (factura of facturas; track factura.ID_FACTURA) {
                  <tr>
                    <td>#{{ factura.ID_FACTURA }}</td>
                    <td>#{{ factura.ID_RESERVA }}</td>
                    <td>{{ factura.FECHA_EMISION | date: 'yyyy-MM-dd' }}</td>
                    <td>{{ factura.reserva?.NUMERO_HABITACION || '-' }}</td>
                    <td>S/ {{ (factura.SUBTOTAL || 0) | number: '1.2-2' }}</td>
                    <td>S/ {{ (factura.IGV || 0) | number: '1.2-2' }}</td>
                    <td><strong>S/ {{ (factura.TOTAL || 0) | number: '1.2-2' }}</strong></td>
                    <td>
                      <span class="pill" [class.pagado]="normalizar(factura.ESTADO_PAGO) === 'PAGADO'" [class.pendiente]="normalizar(factura.ESTADO_PAGO) === 'PENDIENTE'" [class.anulado]="normalizar(factura.ESTADO_PAGO) === 'ANULADO'">
                        {{ factura.ESTADO_PAGO || 'PENDIENTE' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn action-btn" type="button" (click)="verDetalle(factura.ID_FACTURA)">Detalle</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <!-- Modal de Detalle de Factura Desglosado -->
      @if (mostrarModal && facturaDetalle) {
        <div class="modal-overlay" (click)="cerrarModal()">
          <div class="modal-card card detailed-invoice-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Comprobante de Pago Detallado</h2>
              <span class="invoice-number">Factura #{{ facturaDetalle.factura.ID_FACTURA }}</span>
              <button class="close-btn" type="button" (click)="cerrarModal()">&times;</button>
            </div>
            
            <div class="modal-body detailed-body">
              <section class="invoice-meta-info">
                <div>
                  <strong>Fecha Emisión:</strong> {{ facturaDetalle.factura.FECHA_EMISION | date: 'yyyy-MM-dd' }}
                </div>
                <div>
                  <strong>Estado:</strong> 
                  <span class="pill" [class.pagado]="normalizar(facturaDetalle.factura.ESTADO_PAGO) === 'PAGADO'" [class.pendiente]="normalizar(facturaDetalle.factura.ESTADO_PAGO) === 'PENDIENTE'" [class.anulado]="normalizar(facturaDetalle.factura.ESTADO_PAGO) === 'ANULADO'">
                    {{ facturaDetalle.factura.ESTADO_PAGO || 'PENDIENTE' }}
                  </span>
                </div>
              </section>

              <!-- Sección 1: Alojamiento (Habitación) -->
              <section class="invoice-section">
                <h3>Alojamiento</h3>
                <table class="detail-table">
                  <thead>
                    <tr>
                      <th>Habitación</th>
                      <th>Tipo</th>
                      <th>Precio Noche</th>
                      <th>Noches</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#{{ facturaDetalle.reserva.NUMERO_HABITACION || '-' }}</td>
                      <td>{{ facturaDetalle.reserva.TIPO_HABITACION || '-' }}</td>
                      <td>S/ {{ (facturaDetalle.reserva.PRECIO_NOCHE || 0) | number: '1.2-2' }}</td>
                      <td>{{ facturaDetalle.reserva.CANTIDAD_NOCHES || 0 }}</td>
                      <td>S/ {{ (facturaDetalle.reserva.DETALLE_SUBTOTAL || 0) | number: '1.2-2' }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <!-- Sección 2: Servicios Consumidos (si aplica) -->
              @if (facturaDetalle.servicios && facturaDetalle.servicios.length > 0) {
                <section class="invoice-section">
                  <h3>Servicios Consumidos</h3>
                  <table class="detail-table">
                    <thead>
                      <tr>
                        <th>Servicio</th>
                        <th>Precio Unit.</th>
                        <th>Cantidad</th>
                        <th>Fecha Consumo</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (s of facturaDetalle.servicios; track s.ID_CONSUMO) {
                        <tr>
                          <td>{{ s.NOMBRE_SERVICIO }}</td>
                          <td>S/ {{ s.PRECIO_SERVICIO | number: '1.2-2' }}</td>
                          <td>{{ s.CANTIDAD }}</td>
                          <td>{{ s.FECHA | date: 'yyyy-MM-dd HH:mm' }}</td>
                          <td>S/ {{ s.SUBTOTAL | number: '1.2-2' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </section>
              }

              <!-- Sección 3: Eventos Reservados (si aplica) -->
              @if (facturaDetalle.eventos && facturaDetalle.eventos.length > 0) {
                <section class="invoice-section">
                  <h3>Eventos y Actividades</h3>
                  <table class="detail-table">
                    <thead>
                      <tr>
                        <th>Evento / Actividad</th>
                        <th>Precio Entrada</th>
                        <th>Cantidad</th>
                        <th>Fecha Evento</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (e of facturaDetalle.eventos; track e.ID_RESERVA_EVENTO) {
                        <tr>
                          <td>{{ e.NOMBRE_EVENTO }}</td>
                          <td>S/ {{ e.COSTO_EVENTO | number: '1.2-2' }}</td>
                          <td>{{ e.CANTIDAD }}</td>
                          <td>{{ e.FECHA_EVENTO | date: 'yyyy-MM-dd' }}</td>
                          <td>S/ {{ e.SUBTOTAL | number: '1.2-2' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </section>
              }

              <!-- Resumen Final -->
              <section class="invoice-totalizer">
                <div class="row">
                  <span>Subtotal Factura:</span>
                  <strong>S/ {{ (facturaDetalle.factura.SUBTOTAL || 0) | number: '1.2-2' }}</strong>
                </div>
                <div class="row">
                  <span>IGV (18%):</span>
                  <strong>S/ {{ (facturaDetalle.factura.IGV || 0) | number: '1.2-2' }}</strong>
                </div>
                <div class="row total-row">
                  <span>Total Neto a Pagar:</span>
                  <strong>S/ {{ (facturaDetalle.factura.TOTAL || 0) | number: '1.2-2' }}</strong>
                </div>
              </section>
            </div>
            
            <div class="modal-actions" style="border-top: 1px solid var(--border); padding: 1rem 1.5rem; display: flex; justify-content: flex-end;">
              <button class="btn primary" type="button" (click)="cerrarModal()">Cerrar</button>
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
        --cream-50: #FBF8F2;
        --white: #FFFFFF;
        --muted: #5C6B80;
        --border: #E7EAF0;
        --shadow: 0 18px 40px rgba(11, 37, 64, .1);
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      .cliente-facturas { display: grid; gap: 1rem; }
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
      h1 { margin: .3rem 0 .45rem; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.95rem; }
      p { margin: 0; color: var(--muted); }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: .65rem; align-content: start; }
      .hero-stats article { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: .75rem .8rem; }
      .hero-stats strong { display: block; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.2rem; }
      .hero-stats small { color: var(--muted); font-size: .76rem; }

      .card {
        border-radius: 16px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1rem 1.05rem;
      }
      .card-head { display: flex; justify-content: space-between; align-items: center; gap: .7rem; margin-bottom: .8rem; }
      h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; }
      .btn { border: none; border-radius: 8px; padding: .54rem .84rem; font-size: .8rem; font-weight: 700; cursor: pointer; }
      .btn.ghost { background: transparent; color: var(--navy-700); border: 1px solid var(--border); }

      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: .68rem .6rem; border-bottom: 1px solid var(--border); text-align: left; font-size: .82rem; color: var(--navy-700); }
      th { font-size: .74rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); font-weight: 800; }
      .pill { border-radius: 999px; padding: .25rem .6rem; font-size: .72rem; font-weight: 700; }
      .pagado { background: rgba(46,125,50,.14); color: #1F5F23; }
      .pendiente { background: rgba(201,162,39,.16); color: #8A6D14; }
      .anulado { background: rgba(179,38,30,.12); color: #8A1E18; }
      .empty { margin: 0; color: var(--muted); }
      .alert.error { border-radius: 10px; padding: .72rem .92rem; background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }
      
      .action-btn {
        background: var(--navy-700);
        color: var(--white);
        padding: 0.35rem 0.65rem;
        font-size: 0.76rem;
      }
      .action-btn:hover {
        background: var(--navy-900);
      }
      
      /* Modal Desglosado */
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
      .detailed-invoice-modal {
        max-width: 700px !important;
        width: 90% !important;
        max-height: 85vh;
        overflow-y: auto;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border);
        padding: 1rem 1.5rem;
        position: relative;
      }
      .modal-header h2 {
        margin: 0;
        font-family: 'Playfair Display', serif;
        font-size: 1.3rem;
        color: var(--navy-900);
      }
      .invoice-number {
        font-weight: 700;
        color: var(--gold-500);
        font-size: 1rem;
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
      .detailed-body {
        padding: 1.5rem;
        display: grid;
        gap: 1.25rem;
      }
      .invoice-meta-info {
        display: flex;
        gap: 2rem;
        background: var(--cream-50);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.88rem;
      }
      .invoice-section h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        border-left: 3px solid var(--gold-500);
        padding-left: 0.5rem;
      }
      .detail-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.25rem;
      }
      .detail-table th, .detail-table td {
        padding: 0.5rem;
        font-size: 0.8rem;
        border: 1px solid var(--border);
      }
      .detail-table th {
        background: var(--cream-50);
        font-weight: 700;
        color: var(--muted);
      }
      .invoice-totalizer {
        border-top: 1px dashed var(--border);
        padding-top: 1rem;
        display: grid;
        justify-content: end;
        gap: 0.4rem;
      }
      .invoice-totalizer .row {
        display: flex;
        justify-content: space-between;
        width: 250px;
        font-size: 0.86rem;
      }
      .invoice-totalizer .row strong {
        color: var(--navy-900);
      }
      .total-row {
        border-top: 1px solid var(--border);
        padding-top: 0.4rem;
        font-size: 1rem !important;
        font-weight: 800;
      }
      .total-row strong {
        color: var(--gold-500) !important;
      }

      @media (max-width: 960px) {
        .hero-stats { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class FacturasClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  cargando = true;
  error = "";
  facturas: FacturaView[] = [];
  totalFacturado = 0;
  pendientes = 0;

  mostrarModal = false;
  facturaDetalle: any = null;

  async ngOnInit() {
    await this.cargar();
  }

  verDetalle(idFactura: number): void {
    this.api.get<any>(`/facturas/${idFactura}/detalle`).subscribe({
      next: (res) => {
        this.facturaDetalle = res;
        this.mostrarModal = true;
      },
      error: (err) => {
        this.error = err?.error?.message || "No se pudo obtener el desglose detallado de la factura.";
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.facturaDetalle = null;
  }

  async cargar() {
    this.cargando = true;
    this.error = "";

    try {
      const idUsuario = this.auth.getUserId();
      if (!idUsuario) throw new Error("No se pudo identificar al usuario.");

      const [huespedes, reservas, facturas] = await Promise.all([
        this.getData<Huesped[]>('/huespedes'),
        this.getData<Reserva[]>('/reservas'),
        this.getData<Factura[]>('/facturas')
      ]);

      const huesped = huespedes.find((item) => Number(item.ID_USUARIO) === idUsuario);
      if (!huesped) {
        this.facturas = [];
        return;
      }

      const misReservas = reservas.filter((item) => Number(item.ID_HUESPED) === Number(huesped.ID_HUESPED));
      const idsReservas = new Set(misReservas.map((item) => Number(item.ID_RESERVA)));
      const reservaMap = new Map(misReservas.map((item) => [Number(item.ID_RESERVA), item]));

      this.facturas = facturas
        .filter((item) => idsReservas.has(Number(item.ID_RESERVA)))
        .map((item) => ({ ...item, reserva: reservaMap.get(Number(item.ID_RESERVA)) }))
        .sort((a, b) => Number(b.ID_FACTURA) - Number(a.ID_FACTURA));

      this.totalFacturado = this.facturas.reduce((acc, item) => acc + Number(item.TOTAL || 0), 0);
      this.pendientes = this.facturas.filter((item) => this.normalizar(item.ESTADO_PAGO) === "PENDIENTE").length;
    } catch (error) {
      this.error = this.extraerMensaje(error, "No se pudieron cargar las facturas.");
    } finally {
      this.cargando = false;
    }
  }

  normalizar(estado: string | undefined) {
    return String(estado || "PENDIENTE").toUpperCase();
  }

  private async getData<T>(path: string) {
    return firstValueFrom(this.api.get<T>(path));
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
