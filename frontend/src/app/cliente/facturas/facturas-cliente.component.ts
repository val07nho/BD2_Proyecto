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

  async ngOnInit() {
    await this.cargar();
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
