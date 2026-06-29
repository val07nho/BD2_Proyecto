import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";

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
  TIPO_HABITACION?: string;
  PRECIO_NOCHE?: number;
  CANTIDAD_NOCHES?: number;
  SUBTOTAL?: number;
}

@Component({
  selector: "app-reservas-cliente",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, DatePipe, DecimalPipe],
  template: `
    <section class="cliente-reservas">
      <section class="hero">
        <div>
          <span class="eyebrow">Reservas</span>
          <h1>Gestiona tu estadía</h1>
          <p>Consulta tus reservas activas, realiza pagos de facturación y coordina tus próximas fechas en el hotel.</p>
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

      <section class="main-panel">
        <article class="card table-card">
          <div class="table-head">
            <div>
              <h3>Mis Reservas Activas</h3>
              <p class="subtitle">Lista general de estadías reservadas en el sistema corporativo.</p>
            </div>
            <div class="head-actions">
              <button class="btn primary" type="button" (click)="abrirModalNuevaReserva()">
                <span class="plus-icon">+</span> Nueva Reserva
              </button>
              <button class="btn ghost" type="button" (click)="cargarReservas()" [disabled]="cargandoReservas">Actualizar</button>
            </div>
          </div>

          @if (cargandoReservas) {
            <p class="empty">Cargando reservas...</p>
          } @else if (reservas.length === 0) {
            <div class="empty-state">
              <span class="icon">📅</span>
              <p>Aún no tienes reservas registradas en tu historial.</p>
              <button class="btn primary" type="button" (click)="abrirModalNuevaReserva()">Reservar una Habitación</button>
            </div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Código de Reserva</th>
                    <th>Habitación</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Estado</th>
                    <th>Total Facturado</th>
                    <th>Acciones de Gestión</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of reservas; track r.ID_RESERVA) {
                    <tr>
                      <td class="res-code">{{ formatearCodigoReserva(r.ID_RESERVA) }}</td>
                      <td>
                        <strong>{{ r.NUMERO_HABITACION ? 'Hab. N° ' + r.NUMERO_HABITACION : '-' }}</strong>
                      </td>
                      <td>{{ r.FECHA_INGRESO | date: 'dd MMM, yyyy' }}</td>
                      <td>{{ r.FECHA_SALIDA | date: 'dd MMM, yyyy' }}</td>
                      <td>
                        <span class="status" [class]="normalizarEstado(r.ESTADO).toLowerCase()">
                          {{ r.ESTADO }}
                        </span>
                      </td>
                      <td class="amount">S/ {{ r.TOTAL | number: '1.2-2' }}</td>
                      <td>
                        <div class="row-actions">
                          @if (normalizarEstado(r.ESTADO) === 'PENDIENTE') {
                            <button class="action pay-btn" type="button" (click)="abrirModalPago(r)">Pagar Factura</button>
                            <button class="action edit-btn" type="button" (click)="editarReserva(r)">Modificar</button>
                          }
                          <button class="action warn-btn" type="button" (click)="cancelarReserva(r)" [disabled]="normalizarEstado(r.ESTADO) === 'CANCELADA' || normalizarEstado(r.ESTADO) === 'FINALIZADA'">Cancelar</button>
                          <button class="action primary-btn" type="button" (click)="finalizarReserva(r)" [disabled]="normalizarEstado(r.ESTADO) !== 'CONFIRMADA'">Finalizar Estadía</button>
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

      <!-- Modal de Nueva / Editar Reserva -->
      @if (mostrarModalNuevaReserva) {
        <div class="modal-backdrop" (click)="cerrarModalNuevaReserva()">
          <div class="modal-content new-reserva-modal" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div>
                <span class="eyebrow">Alojamiento</span>
                <h2>{{ editando ? 'Modificar Tu Reserva' : 'Nueva Reserva de Habitación' }}</h2>
                <p class="section-desc">Completa los detalles de tu estancia para proceder con la reserva.</p>
              </div>
              <button class="close-btn" type="button" (click)="cerrarModalNuevaReserva()">&times;</button>
            </header>

            <form [formGroup]="form" (ngSubmit)="guardar()" class="modal-form-grid">
              <label class="form-label">
                Habitación Seleccionada
                <select formControlName="id_habitacion">
                  <option [ngValue]="null">Selecciona una habitación disponible...</option>
                  @for (h of habitacionesDisponibles; track h.ID_HABITACION) {
                    <option [ngValue]="h.ID_HABITACION">
                      Habitación {{ h.NUMERO_HABITACION }} - {{ h.TIPO }} (S/ {{ h.PRECIO_NOCHE | number: '1.2-2' }} por noche)
                    </option>
                  }
                </select>
              </label>

              <div class="form-row-2col">
                <label class="form-label">
                  Fecha de Entrada
                  <input type="date" formControlName="fecha_ingreso" />
                </label>

                <label class="form-label">
                  Fecha de Salida
                  <input type="date" formControlName="fecha_salida" />
                </label>
              </div>

              <label class="form-label">
                Cantidad de Noches
                <input type="number" min="1" formControlName="cantidad_noches" />
              </label>

              @if (habitacionFormulario) {
                <div class="summary-card">
                  <h4>Resumen del Costo de Alojamiento</h4>
                  <div class="summary-row">
                    <span>Precio por noche:</span>
                    <strong>S/ {{ habitacionFormulario.PRECIO_NOCHE | number: '1.2-2' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Noches de estadía:</span>
                    <strong>{{ obtenerNochesFormulario() }}</strong>
                  </div>
                  <div class="divider"></div>
                  <div class="summary-row total">
                    <span>Costo Estimado Total:</span>
                    <strong class="total-monto">S/ {{ totalFormulario(habitacionFormulario.PRECIO_NOCHE) | number: '1.2-2' }}</strong>
                  </div>
                </div>
              }

              @if (!idHuespedActual) {
                <p class="note">Tu usuario no tiene registro en HUESPED. Sin ese enlace no se puede guardar una reserva.</p>
              }

              <footer class="modal-footer">
                <button type="button" class="btn ghost" (click)="cerrarModalNuevaReserva()">Cancelar</button>
                <button type="submit" class="btn primary" [disabled]="form.invalid || guardando || !idHuespedActual">
                  {{ guardando ? 'Procesando...' : (editando ? 'Guardar Cambios' : 'Confirmar Reserva') }}
                </button>
              </footer>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Pasarela de Pago Premium -->
      @if (mostrarModalPago && reservaParaPagar) {
        <div class="modal-backdrop" (click)="cerrarModalPago()">
          <div class="modal-content payment-modal" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div>
                <span class="eyebrow">Pasarela de Pago</span>
                <h2>Procesar Transacción</h2>
                <p class="section-desc">Código de Reserva: {{ formatearCodigoReserva(reservaParaPagar.ID_RESERVA) }}</p>
              </div>
              <button class="close-btn" type="button" (click)="cerrarModalPago()">&times;</button>
            </header>

            <div class="modal-body">
              <div class="payment-details-card">
                <h4>Detalle de Facturación de Estancia</h4>
                <div class="detail-row">
                  <span>Habitación asignada:</span>
                  <strong>Habitación N° {{ reservaParaPagar.NUMERO_HABITACION || '-' }}</strong>
                </div>
                <div class="detail-row">
                  <span>Fecha de Entrada:</span>
                  <span>{{ reservaParaPagar.FECHA_INGRESO | date: 'dd MMM, yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span>Fecha de Salida:</span>
                  <span>{{ reservaParaPagar.FECHA_SALIDA | date: 'dd MMM, yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span>Noches contratadas:</span>
                  <span>{{ reservaParaPagar.CANTIDAD_NOCHES || calcularNoches(reservaParaPagar.FECHA_INGRESO, reservaParaPagar.FECHA_SALIDA) }} noches</span>
                </div>
                <div class="divider"></div>
                <div class="detail-row">
                  <span>Subtotal Factura:</span>
                  <span>S/ {{ (reservaParaPagar.TOTAL / 1.18) | number: '1.2-2' }}</span>
                </div>
                <div class="detail-row">
                  <span>IGV (18%):</span>
                  <span>S/ {{ (reservaParaPagar.TOTAL - (reservaParaPagar.TOTAL / 1.18)) | number: '1.2-2' }}</span>
                </div>
                <div class="divider"></div>
                <div class="detail-row total">
                  <span>Monto Total a Pagar:</span>
                  <strong class="total-monto">S/ {{ reservaParaPagar.TOTAL | number: '1.2-2' }}</strong>
                </div>
              </div>

              <label class="form-label" style="margin-top: 1.2rem; display: block; font-weight: 700; font-size: 0.8rem; color: var(--navy-700);">
                Selecciona tu Método de Pago
                <select [(ngModel)]="metodoPagoSimulado" style="width: 100%; margin-top: 0.35rem; border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem; background: var(--cream-50); color: var(--navy-900); font: inherit;">
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Transferencia">Transferencia Bancaria Directa</option>
                  <option value="Efectivo">Efectivo en Recepción de Hotel</option>
                </select>
              </label>

              <div class="payment-badge">
                <span class="lock-icon">🔒</span>
                <small>Transacción encriptada bajo protocolo de alta seguridad SSL de 256 bits.</small>
              </div>
            </div>

            <footer class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border); margin-top: 1.2rem;">
              <button type="button" class="btn ghost" (click)="cerrarModalPago()" [disabled]="pagandoSimulado">Cancelar</button>
              <button type="button" class="btn primary" (click)="procesarPagoSimulado()" [disabled]="pagandoSimulado">
                {{ pagandoSimulado ? 'Verificando Fondos...' : 'Confirmar Transacción' }}
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
      .cliente-reservas { display: grid; gap: 1.2rem; }
      
      .hero {
        border-radius: 24px;
        padding: 1.5rem 1.8rem;
        background: linear-gradient(120deg, #F3E9D6, var(--cream-50));
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        display: flex;
        justify-content: space-between;
        gap: 1.2rem;
        flex-wrap: wrap;
      }
      .eyebrow { color: var(--gold-500); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 900; }
      .hero h1 { margin: .3rem 0 .45rem; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 2rem; }
      .hero p { margin: 0; color: var(--muted); max-width: 640px; font-size: 0.9rem; line-height: 1.5; }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(110px, 1fr)); gap: .75rem; align-content: start; }
      .hero-stats article { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: .8rem .9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
      .hero-stats strong { display: block; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.4rem; }
      .hero-stats small { color: var(--muted); font-size: .78rem; }

      .alert { border-radius: 12px; padding: .75rem 1rem; font-weight: 600; font-size: .86rem; }
      .alert.success { background: rgba(201,162,39,.1); color: #8A6A00; border: 1px solid rgba(201,162,39,.2); }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }

      .main-panel { width: 100%; }
      .card {
        border-radius: 20px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1.5rem 1.6rem;
      }
      
      .table-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.4rem; flex-wrap: wrap; }
      .table-head h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.35rem; }
      .table-head .subtitle { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.8rem; }
      .head-actions { display: flex; gap: 0.6rem; }

      .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
      table { width: 100%; border-collapse: collapse; text-align: left; font-size: .86rem; min-width: 900px; }
      th, td { padding: 0.95rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
      th { background: #FAF9F6; color: var(--navy-700); font-weight: 800; font-size: .76rem; text-transform: uppercase; letter-spacing: 0.05em; }
      td { color: var(--navy-900); }
      
      .res-code { font-family: 'Courier New', monospace; font-weight: 700; color: var(--navy-700); }
      .amount { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 0.95rem; }
      
      .empty-state { text-align: center; padding: 3rem 1rem; display: grid; justify-items: center; gap: 0.8rem; }
      .empty-state .icon { font-size: 2.5rem; }
      .empty-state p { color: var(--muted); margin: 0; font-size: 0.9rem; }
      .empty { text-align: center; color: var(--muted); font-style: italic; padding: 2rem 0; margin: 0; }

      .status {
        display: inline-block;
        padding: .25rem .6rem;
        border-radius: 8px;
        font-weight: 700;
        font-size: .74rem;
        text-transform: uppercase;
      }
      .status.pendiente { background: rgba(201,162,39,.12); color: #8A6A00; }
      .status.confirmada { background: rgba(11,37,64,.08); color: var(--navy-700); }
      .status.finalizada { background: rgba(92,107,128,.1); color: var(--muted); }
      .status.cancelada { background: rgba(179,38,30,.08); color: #8A1E18; }

      .row-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
      .action {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: .4rem .6rem;
        font: inherit;
        font-size: .76rem;
        font-weight: 700;
        cursor: pointer;
        background: var(--white);
        color: var(--navy-900);
        transition: .15s ease-in-out;
      }
      .action:hover { background: var(--cream-50); border-color: var(--gold-300); }
      .action.pay-btn { color: var(--gold-500); border-color: var(--gold-300); background: rgba(201,162,39,0.03); }
      .action.pay-btn:hover { background: rgba(201,162,39,0.08); }
      .action.edit-btn { color: var(--navy-700); }
      .action.warn-btn { color: #8A1E18; border-color: rgba(179,38,30,.2); }
      .action.warn-btn:hover { background: rgba(179,38,30,.05); }
      .action.primary-btn { border-color: var(--navy-700); color: var(--navy-700); }
      .action.primary-btn:hover { background: rgba(22,57,94,0.05); }
      .action:disabled { opacity: .4; cursor: not-allowed; border-color: var(--border) !important; color: var(--muted) !important; background: var(--white) !important; }

      /* Botones Generales */
      .btn {
        border: none;
        border-radius: 10px;
        padding: .68rem 1.1rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: .2s;
        font-size: .84rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
      .btn.primary { background: var(--gold-500); color: var(--navy-900); }
      .btn.primary:hover { background: var(--gold-300); transform: translateY(-1px); }
      .btn.ghost { background: transparent; color: var(--navy-700); border: 1px solid var(--border); }
      .btn.ghost:hover { background: var(--cream-50); }
      .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }
      .plus-icon { font-size: 1.1rem; line-height: 1; }

      /* Estructuras de Modales Premium */
      .modal-backdrop {
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
      .modal-content {
        background: var(--white);
        border-radius: 24px;
        border: 1px solid var(--border);
        box-shadow: 0 30px 70px rgba(11,37,64,0.18);
        width: 100%;
        max-width: 460px;
        padding: 1.8rem;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .modal-content.new-reserva-modal {
        max-width: 520px;
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
        padding-bottom: 1rem;
        margin-bottom: 1.2rem;
      }
      .modal-header h2 {
        margin: 0.2rem 0;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 1.45rem;
      }
      .modal-header .section-desc {
        margin: 0;
        color: var(--muted);
        font-size: 0.8rem;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.8rem;
        color: var(--muted);
        cursor: pointer;
        line-height: 1;
      }
      
      .modal-form-grid { display: grid; gap: 1rem; }
      .form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
      .form-label { display: grid; gap: .38rem; font-size: .78rem; font-weight: 700; color: var(--navy-700); }
      
      /* Tarjetas de Resumen y Pago */
      .summary-card, .payment-details-card {
        background: var(--cream-50);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1.1rem;
      }
      .summary-card h4, .payment-details-card h4 {
        margin: 0 0 0.8rem;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 0.95rem;
        border-bottom: 1px solid rgba(11,37,64,0.06);
        padding-bottom: 0.4rem;
      }
      .summary-row, .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.45rem;
        font-size: 0.84rem;
      }
      .summary-row span, .detail-row span {
        color: var(--muted);
      }
      .summary-row strong, .detail-row strong {
        color: var(--navy-900);
      }
      .divider {
        height: 1px;
        background: var(--border);
        margin: 0.7rem 0;
      }
      .summary-row.total, .detail-row.total {
        margin-bottom: 0;
        padding-top: 0.2rem;
      }
      .summary-row.total span, .detail-row.total span {
        font-weight: 700;
        color: var(--navy-900);
      }
      .total-monto {
        font-size: 1.3rem;
        color: var(--gold-500);
        font-family: 'Playfair Display', serif;
      }
      
      .payment-badge {
        margin-top: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: var(--cream-50);
        border: 1px solid var(--border);
        padding: 0.8rem 1rem;
        border-radius: 12px;
      }
      .lock-icon { font-size: 1.1rem; color: var(--gold-500); }
      .payment-badge small { color: var(--muted); font-size: 0.74rem; font-weight: 500; line-height: 1.3; }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 1.2rem;
        border-top: 1px solid var(--border);
        margin-top: 0.4rem;
      }
      .note { margin: 0; color: #8A1E18; font-size: 0.76rem; font-weight: 600; }
    `
  ]
})
export class ReservasClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  habitaciones: Habitacion[] = [];
  reservas: Reserva[] = [];
  idHuespedActual: number | null = null;

  cargandoReservas = false;
  guardando = false;
  editando = false;
  reservaEditando: Reserva | null = null;
  mensaje = "";
  error = "";

  // Modal de Nueva / Editar Reserva
  mostrarModalNuevaReserva = false;

  // Modal de Pago
  mostrarModalPago = false;
  reservaParaPagar: Reserva | null = null;
  metodoPagoSimulado = "Tarjeta";
  pagandoSimulado = false;

  readonly form = this.fb.group({
    id_habitacion: [null as number | null, [Validators.required]],
    fecha_ingreso: ["", [Validators.required]],
    fecha_salida: ["", [Validators.required]],
    cantidad_noches: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargarHabitaciones();
    this.cargarHuespedActual();

    // Capturar QueryParam de autoselección de habitación
    this.route.queryParams.subscribe(params => {
      const roomParam = params['habitacion'];
      if (roomParam) {
        this.form.patchValue({ id_habitacion: Number(roomParam) });
        this.abrirModalNuevaReserva();
      }
    });
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
        this.mensaje = this.editando ? "Reserva actualizada con éxito." : "Reserva creada de forma pendiente. Por favor proceda al pago para confirmarla.";
        this.cerrarModalNuevaReserva();
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

    this.mostrarModalNuevaReserva = true;
    this.error = "";
    this.mensaje = "";
  }

  abrirModalNuevaReserva(): void {
    this.mostrarModalNuevaReserva = true;
    this.error = "";
    this.mensaje = "";
  }

  cerrarModalNuevaReserva(): void {
    this.mostrarModalNuevaReserva = false;
    this.cancelarEdicion();
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.reservaEditando = null;
    this.form.reset({ id_habitacion: null, fecha_ingreso: "", fecha_salida: "", cantidad_noches: 1 });
  }

  abrirModalPago(r: Reserva): void {
    this.reservaParaPagar = r;
    this.metodoPagoSimulado = "Tarjeta";
    this.mostrarModalPago = true;
    this.error = "";
    this.mensaje = "";
  }

  cerrarModalPago(): void {
    this.mostrarModalPago = false;
    this.reservaParaPagar = null;
  }

  procesarPagoSimulado(): void {
    if (!this.reservaParaPagar) return;
    this.pagandoSimulado = true;
    this.error = "";

    this.api.post(`/reservas/${this.reservaParaPagar.ID_RESERVA}/pagar`, { metodo_pago: this.metodoPagoSimulado }).subscribe({
      next: () => {
        this.pagandoSimulado = false;
        this.mensaje = `¡Transacción procesada correctamente! La reserva #${this.reservaParaPagar!.ID_RESERVA} ha sido CONFIRMADA.`;
        this.cerrarModalPago();
        this.cargarReservas();
      },
      error: (err) => {
        this.pagandoSimulado = false;
        this.error = err?.error?.message || "No se pudo procesar la transacción bancaria.";
        this.cerrarModalPago();
      }
    });
  }

  cancelarReserva(r: Reserva): void {
    const ok = confirm(`¿Deseas cancelar la reserva ${this.formatearCodigoReserva(r.ID_RESERVA)}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    this.error = "";
    this.mensaje = "";

    this.api.post(`/reservas/${r.ID_RESERVA}/cancelar`, {}).subscribe({
      next: () => {
        this.mensaje = "Reserva cancelada correctamente.";
        this.cargarReservas();
      },
      error: (err) => {
        this.error = err?.error?.message || "No se pudo cancelar la reserva.";
      }
    });
  }

  finalizarReserva(r: Reserva): void {
    const ok = confirm(`¿Deseas finalizar la estancia de la reserva ${this.formatearCodigoReserva(r.ID_RESERVA)}?`);
    if (!ok) return;

    this.error = "";
    this.mensaje = "";

    this.api.post(`/reservas/${r.ID_RESERVA}/finalizar`, {}).subscribe({
      next: () => {
        this.mensaje = "Estadía finalizada correctamente. ¡Gracias por preferir nuestro Resort!";
        this.cargarReservas();
      },
      error: (err) => {
        this.error = err?.error?.message || "No se pudo finalizar la reserva.";
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

  formatearCodigoReserva(id: number): string {
    if (!id) return "";
    return `RES-${String(id).padStart(4, "0")}`;
  }
}
