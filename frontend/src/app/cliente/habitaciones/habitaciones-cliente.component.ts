import { CommonModule, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { TrackingService } from "../../core/services/tracking.service";

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

      <section class="toolbar-card" style="background: var(--white); border: 1px solid var(--border); padding: 1rem; border-radius: 16px; box-shadow: var(--shadow); display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
        <label style="font-weight: 700; color: var(--navy-700); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem; width: 100%; max-width: 320px; margin: 0;">
          Filtrar por tipo de habitación:
          <input type="text" [value]="filtro" (input)="onFiltroChanged($any($event.target).value)" placeholder="Ej. Suite, Deluxe, Estandar..." style="border: 1px solid var(--border); border-radius: 8px; padding: 0.58rem 0.62rem; font: inherit; background: var(--cream-50); color: var(--navy-900);" />
        </label>
      </section>

      <section class="habitaciones-grid">
        @if (cargandoHabitaciones) {
          <p class="estado-msg">Cargando habitaciones...</p>
        } @else if (habitacionesDisponibles.length === 0) {
          <p class="estado-msg">No hay habitaciones disponibles en este momento.</p>
        } @else {
          @for (h of habitacionesDisponibles; track h.ID_HABITACION) {
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

      <!-- Modal de Reserva y Pago Simulado -->
      @if (mostrarModal && habitacionSeleccionada) {
        <div class="modal-backdrop" (click)="cerrarModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <div>
                <span class="eyebrow">Reserva de Habitación</span>
                <h2>Habitación #{{ habitacionSeleccionada.NUMERO_HABITACION }}</h2>
                <small>{{ habitacionSeleccionada.TIPO }} • S/ {{ habitacionSeleccionada.PRECIO_NOCHE | number: '1.2-2' }} por noche</small>
              </div>
              <button class="close-btn" type="button" (click)="cerrarModal()">&times;</button>
            </header>

            <form [formGroup]="reservaForm" (ngSubmit)="crearReserva()">
              <div class="modal-body-grid" [class.unregistered]="!idHuespedActual">
                
                <!-- Columna Izquierda -->
                @if (!idHuespedActual) {
                  <!-- Formulario de Registro de Huésped -->
                  <div class="modal-form-fields" [formGroup]="registroForm">
                    <h3>Registro de Datos Personales</h3>
                    <p class="section-desc">Por favor completa tu perfil para continuar con la reserva.</p>
                    
                    <label class="form-label">
                      Nombres
                      <input type="text" formControlName="nombres" placeholder="Nombres" />
                    </label>

                    <label class="form-label">
                      Apellidos
                      <input type="text" formControlName="apellidos" placeholder="Apellidos" />
                    </label>

                    <div class="form-row-2col">
                      <label class="form-label">
                        Tipo Doc.
                        <select formControlName="tipoDocumento">
                          <option value="DNI">DNI</option>
                          <option value="Pasaporte">Pasaporte</option>
                        </select>
                      </label>

                      <label class="form-label">
                        Número Doc.
                        <input type="text" formControlName="numeroDocumento" placeholder="Número" />
                      </label>
                    </div>

                    <label class="form-label">
                      Nacionalidad
                      <input type="text" formControlName="nacionalidad" />
                    </label>

                    <label class="form-label">
                      Teléfono
                      <input type="text" formControlName="telefono" placeholder="Ej. 999111222" />
                    </label>

                    <label class="form-label">
                      Correo Electrónico
                      <input type="email" formControlName="correo" placeholder="correo@ejemplo.com" />
                    </label>
                  </div>
                } @else {
                  <!-- Formulario de Reserva Normal -->
                  <div class="modal-form-fields">
                    <h3>Detalles de Estadía</h3>
                    
                    <label class="form-label">
                      Fecha de Llegada (Ingreso)
                      <input type="date" formControlName="fecha_ingreso" [min]="getFechaMinimaIngreso()" (change)="onFechasChanged()" />
                    </label>

                    <label class="form-label">
                      Fecha de Salida
                      <input type="date" formControlName="fecha_salida" [min]="getFechaMinimaSalida()" (change)="onFechasChanged()" />
                    </label>

                    <label class="form-label">
                      Noches
                      <input type="number" min="1" formControlName="cantidad_noches" (change)="onNochesChanged()" />
                    </label>

                    <label class="form-label">
                      Método de Pago (Simulado)
                      <select formControlName="metodo_pago">
                        <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                        <option value="Transferencia">Transferencia Bancaria</option>
                        <option value="Efectivo">Efectivo (en Recepción)</option>
                      </select>
                    </label>
                  </div>
                }

                <!-- Columna Derecha -->
                <div class="modal-invoice-summary">
                  <h3>Resumen y Pago</h3>

                  @if (!idHuespedActual) {
                    <!-- Si se está registrando, ponemos aquí los selectores de fechas y pago -->
                    <div class="reservation-dates-block">
                      <div class="form-row-2col">
                        <label class="form-label">
                          Llegada
                          <input type="date" formControlName="fecha_ingreso" [min]="getFechaMinimaIngreso()" (change)="onFechasChanged()" />
                        </label>

                        <label class="form-label">
                          Salida
                          <input type="date" formControlName="fecha_salida" [min]="getFechaMinimaSalida()" (change)="onFechasChanged()" />
                        </label>
                      </div>

                      <div class="form-row-2col">
                        <label class="form-label">
                          Noches
                          <input type="number" min="1" formControlName="cantidad_noches" (change)="onNochesChanged()" />
                        </label>

                        <label class="form-label">
                          Pago
                          <select formControlName="metodo_pago">
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Efectivo">Efectivo</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    <div class="divider"></div>
                  }

                  <div class="summary-row">
                    <span>Precio por noche</span>
                    <strong>S/ {{ habitacionSeleccionada.PRECIO_NOCHE | number: '1.2-2' }}</strong>
                  </div>
                  
                  <div class="summary-row">
                    <span>Noches</span>
                    <strong>{{ getNights() }}</strong>
                  </div>

                  <div class="divider"></div>

                  <div class="summary-row">
                    <span>Subtotal (sin IGV)</span>
                    <span>S/ {{ getCalculatedSubtotal() | number: '1.2-2' }}</span>
                  </div>

                  <div class="summary-row">
                    <span>IGV (18%)</span>
                    <span>S/ {{ getCalculatedIgv() | number: '1.2-2' }}</span>
                  </div>

                  <div class="divider"></div>

                  <div class="summary-row total">
                    <span>Total a Pagar</span>
                    <strong>S/ {{ getCalculatedTotal() | number: '1.2-2' }}</strong>
                  </div>

                  <div class="payment-badge">
                    <span class="lock-icon">🔒</span>
                    <small>Simulación de pago segura. Los fondos no se descontarán de su cuenta real.</small>
                  </div>
                </div>
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn-cancel" (click)="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn-confirm" [disabled]="reservaForm.invalid || (!idHuespedActual && registroForm.invalid) || guardando">
                  {{ guardando ? 'Procesando...' : (idHuespedActual ? 'Confirmar Reserva y Pagar' : 'Registrar y Pagar') }}
                </button>
              </footer>
            </form>
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

      /* Modal Styles */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(6, 26, 46, 0.45);
        backdrop-filter: blur(12px);
        display: grid;
        place-items: center;
        z-index: 1000;
        padding: 1.5rem;
        animation: fadeIn 0.25s ease;
      }
      .modal-content {
        background: var(--white);
        border-radius: 24px;
        width: 100%;
        max-width: 860px;
        box-shadow: 0 25px 60px rgba(11, 37, 64, 0.22);
        border: 1px solid var(--border);
        overflow: hidden;
        animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .modal-header {
        background: linear-gradient(135deg, var(--navy-900), var(--navy-800));
        color: var(--white);
        padding: 1.6rem 2.2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        border-bottom: 2px solid var(--gold-300);
      }
      .modal-header h2 {
        margin: 0.2rem 0;
        color: var(--white);
        font-family: 'Playfair Display', serif;
        font-size: 1.7rem;
      }
      .modal-header small {
        color: var(--gold-300);
        font-weight: 700;
        font-size: 0.88rem;
        letter-spacing: 0.02em;
      }
      .close-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: rgba(255, 255, 255, 0.85);
        font-size: 1.5rem;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--white);
      }
      .modal-body-grid {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 2.2rem;
        padding: 2.2rem;
      }
      .modal-body-grid.unregistered {
        grid-template-columns: 1.1fr 0.9fr;
      }
      .modal-form-fields {
        display: flex;
        flex-direction: column;
        gap: 1.3rem;
      }
      .modal-form-fields h3 {
        margin: 0;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 1.3rem;
      }
      .section-desc {
        margin: -0.8rem 0 0.2rem;
        color: var(--muted);
        font-size: 0.82rem;
      }
      .form-label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-size: 0.78rem;
        font-weight: 800;
        color: var(--navy-700);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .form-label input, .form-label select {
        border: 2px solid #E2E8F0;
        border-radius: 10px;
        padding: 0.75rem 0.9rem;
        font-size: 0.9rem;
        font-family: inherit;
        background: #F8FAFC;
        outline: none;
        transition: all 0.2s ease;
        color: var(--navy-900);
      }
      .form-label input:focus, .form-label select:focus {
        border-color: var(--gold-500);
        background: var(--white);
        box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
      }
      .modal-invoice-summary {
        background: #FAF8F5;
        border: 2px dashed var(--border);
        border-radius: 18px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        box-sizing: border-box;
      }
      .modal-invoice-summary h3 {
        margin: 0 0 0.3rem 0;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 1.2rem;
        border-bottom: 2px solid var(--border);
        padding-bottom: 0.5rem;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.86rem;
        color: var(--muted);
      }
      .summary-row strong {
        color: var(--navy-900);
        font-weight: 700;
      }
      .summary-row.total {
        font-size: 1.1rem;
        color: var(--navy-900);
        border-top: 1px solid var(--border);
        padding-top: 0.75rem;
        margin-top: 0.2rem;
      }
      .summary-row.total strong {
        font-size: 1.3rem;
        color: var(--gold-500);
        font-weight: 850;
      }
      .modal-invoice-summary .divider {
        border-top: 1px dashed var(--border);
        margin: 0.2rem 0;
      }
      .payment-badge {
        display: flex;
        gap: 0.6rem;
        background: rgba(201, 162, 39, 0.08);
        border: 1px solid rgba(201, 162, 39, 0.18);
        padding: 0.65rem 0.85rem;
        border-radius: 12px;
        margin-top: auto;
        align-items: center;
      }
      .lock-icon {
        font-size: 1.2rem;
      }
      .payment-badge small {
        color: #8C6A00;
        font-size: 0.72rem;
        line-height: 1.35;
        font-weight: 500;
      }
      .error-note {
        padding: 0.8rem 2.2rem 0;
        margin: 0;
      }
      .modal-footer {
        padding: 1.5rem 2.2rem 2.2rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        border-top: 1px solid var(--border);
      }
      .btn-cancel {
        background: var(--white);
        border: 1px solid var(--border);
        color: var(--muted);
        border-radius: 10px;
        padding: 0.75rem 1.6rem;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-cancel:hover {
        background: var(--cream-50);
        color: var(--navy-900);
      }
      .btn-confirm {
        background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
        color: var(--navy-950);
        border: none;
        border-radius: 10px;
        padding: 0.75rem 1.8rem;
        font-weight: 850;
        font-size: 0.9rem;
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(201, 162, 39, 0.25);
        transition: all 0.2s;
      }
      .btn-confirm:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 12px 26px rgba(201, 162, 39, 0.35);
      }
      .btn-confirm:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .form-row-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.8rem;
      }
      .section-desc {
        color: var(--muted);
        font-size: 0.82rem;
        margin: -0.5rem 0 0.8rem;
      }
      .reservation-dates-block {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        margin-bottom: 0.5rem;
      }
      .modal-body-grid.unregistered {
        max-height: 65vh;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .modal-body-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding: 1.5rem;
        }
        .modal-footer {
          padding: 1.2rem 1.5rem 1.5rem;
        }
      }
    `
  ]
})
export class HabitacionesClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly trackingService = inject(TrackingService);

  habitaciones: Habitacion[] = [];
  reservas: Reserva[] = [];
  idHuespedActual: number | null = null;
  habitacionSeleccionada: Habitacion | null = null;
  mostrarModal = false;

  cargandoHabitaciones = false;
  cargandoReservas = false;
  guardando = false;
  mensaje = "";
  error = "";

  readonly reservaForm = this.fb.group({
    id_habitacion: [null as number | null, [Validators.required]],
    fecha_ingreso: ["", [Validators.required]],
    fecha_salida: ["", [Validators.required]],
    cantidad_noches: [1, [Validators.required, Validators.min(1)]],
    metodo_pago: ["Tarjeta", [Validators.required]]
  });

  readonly registroForm = this.fb.group({
    nombres: ["", [Validators.required]],
    apellidos: ["", [Validators.required]],
    tipoDocumento: ["DNI", [Validators.required]],
    numeroDocumento: ["", [Validators.required]],
    telefono: ["", [Validators.required]],
    correo: ["", [Validators.required, Validators.email]],
    nacionalidad: ["Peru", [Validators.required]]
  });

  ngOnInit(): void {
    this.trackingService.registrarVisita("Habitaciones", "Ingresó al módulo");
    this.cargarHabitaciones();
    this.cargarContextoHuesped();
  }

  filtro = "";

  get habitacionesDisponibles(): Habitacion[] {
    return this.habitaciones.filter((h) => 
      h.ESTADO === "Disponible" && 
      (h.TIPO.toLowerCase().includes(this.filtro.toLowerCase()) || h.NUMERO_HABITACION.toLowerCase().includes(this.filtro.toLowerCase()))
    );
  }

  onFiltroChanged(val: string): void {
    this.filtro = val;
    if (val.trim()) {
      this.trackingService.registrarBusqueda(val.trim());
    }
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

        if (this.idHuespedActual) {
          this.cargarReservas();
        }
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
    this.trackingService.registrarVisita("Habitaciones", `Ver habitación ${h.TIPO} ${h.NUMERO_HABITACION}`);
    this.habitacionSeleccionada = h;
    this.reservaForm.patchValue({
      id_habitacion: h.ID_HABITACION,
      fecha_ingreso: "",
      fecha_salida: "",
      cantidad_noches: 1,
      metodo_pago: "Tarjeta"
    });

    if (!this.idHuespedActual) {
      const nombreUsuario = this.auth.getUserNombre() || "";
      const emailUsuario = this.auth.getUsername() || "";
      
      const parts = nombreUsuario.split(" ").filter(Boolean);
      const nombres = parts.slice(0, Math.max(parts.length - 1, 1)).join(" ") || nombreUsuario;
      const apellidos = parts.length > 1 ? parts.slice(-1).join(" ") : "";

      this.registroForm.patchValue({
        nombres: nombres,
        apellidos: apellidos,
        correo: emailUsuario,
        tipoDocumento: "DNI",
        nacionalidad: "Peru",
        telefono: ""
      });
    }

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.habitacionSeleccionada = null;
    this.reservaForm.reset({
      id_habitacion: null,
      fecha_ingreso: "",
      fecha_salida: "",
      cantidad_noches: 1,
      metodo_pago: "Tarjeta"
    });
    this.registroForm.reset({
      nombres: "",
      apellidos: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      telefono: "",
      correo: "",
      nacionalidad: "Peru"
    });
  }

  getFechaMinimaIngreso(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  getFechaMinimaSalida(): string {
    const start = this.reservaForm.value.fecha_ingreso;
    if (start) {
      const startDate = new Date(`${start}T00:00:00`);
      startDate.setDate(startDate.getDate() + 1);
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const day = String(startDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  onFechasChanged(): void {
    const start = this.reservaForm.value.fecha_ingreso;
    const end = this.reservaForm.value.fecha_salida;
    if (start && end) {
      const nights = this.calcularNoches(start, end);
      if (nights > 0) {
        this.reservaForm.patchValue({ cantidad_noches: nights });
      }
    }
  }

  onNochesChanged(): void {
    const nights = Number(this.reservaForm.value.cantidad_noches || 1);
    const start = this.reservaForm.value.fecha_ingreso;
    if (start && nights > 0) {
      const startDate = new Date(`${start}T00:00:00`);
      startDate.setDate(startDate.getDate() + nights);
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const day = String(startDate.getDate()).padStart(2, "0");
      this.reservaForm.patchValue({
        fecha_salida: `${year}-${month}-${day}`
      });
    }
  }

  getNights(): number {
    return Number(this.reservaForm.value.cantidad_noches || 1);
  }

  getCalculatedTotal(): number {
    if (!this.habitacionSeleccionada) return 0;
    return Number(this.habitacionSeleccionada.PRECIO_NOCHE) * this.getNights();
  }

  getCalculatedSubtotal(): number {
    return Number((this.getCalculatedTotal() / 1.18).toFixed(2));
  }

  getCalculatedIgv(): number {
    return Number((this.getCalculatedTotal() - this.getCalculatedSubtotal()).toFixed(2));
  }

  crearReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    if (!this.idHuespedActual && this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = "";
    this.mensaje = "";

    if (!this.idHuespedActual) {
      const regValue = this.registroForm.getRawValue();
      const userId = this.auth.getUserId();
      
      const payloadHuesped = {
        id_usuario: userId,
        nombres: regValue.nombres,
        apellidos: regValue.apellidos,
        tipo_documento: regValue.tipoDocumento,
        numero_documento: regValue.numeroDocumento,
        telefono: regValue.telefono,
        correo: regValue.correo,
        nacionalidad: regValue.nacionalidad
      };

      this.api.post("/huespedes", payloadHuesped).subscribe({
        next: () => {
          this.api.get<Huesped[]>("/huespedes").subscribe({
            next: (rows) => {
              const actual = rows.find((h) => Number(h.ID_USUARIO) === userId);
              this.idHuespedActual = actual?.ID_HUESPED ?? null;
              
              if (!this.idHuespedActual) {
                this.guardando = false;
                this.error = "Error al resolver el ID del huésped creado.";
                return;
              }
              
              this.ejecutarReserva();
            },
            error: () => {
              this.guardando = false;
              this.error = "Huésped registrado, pero no se pudo cargar su perfil para reservar.";
            }
          });
        },
        error: () => {
          this.guardando = false;
          this.error = "No se pudo registrar la información del huésped.";
        }
      });
    } else {
      this.ejecutarReserva();
    }
  }

  ejecutarReserva(): void {
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
      estado: "CONFIRMADA",
      id_huesped: this.idHuespedActual,
      id_habitacion: habitacion.ID_HABITACION,
      precio_noche: Number(habitacion.PRECIO_NOCHE),
      cantidad_noches: value.cantidad_noches || noches,
      total: Number(habitacion.PRECIO_NOCHE) * (value.cantidad_noches || noches),
      metodo_pago: value.metodo_pago
    };

    this.api.post("/reservas", payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = "¡Reserva y simulación de pago registradas correctamente!";
        this.cerrarModal();
        this.cargarReservas();
        this.cargarHabitaciones();
      },
      error: () => {
        this.guardando = false;
        this.error = "No se pudo crear la reserva y el pago.";
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
