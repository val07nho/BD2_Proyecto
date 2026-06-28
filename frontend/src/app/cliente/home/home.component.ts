import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";
import { TrackingService } from "../../core/services/tracking.service";

interface AccionRapida {
  titulo: string;
  descripcion: string;
  icono: "reserva" | "servicios" | "facturas" | "contacto";
}

interface Oferta {
  titulo: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: "app-cliente-home",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="cliente-home">
      <section class="hero-row">
        <article class="hero-card">
          <div class="hero-text">
            <span class="eyebrow">Bienvenida de nuevo</span>
            <h2>Hola, {{ clienteNombre }}</h2>
            <span class="title-line"></span>
            <p>Nos alegra tenerte de vuelta. Prepara tu próxima experiencia inolvidable.</p>
          </div>
          <div class="hero-image">
            <img src="https://picsum.photos/seed/aurea-pool/900/520" alt="Aurea Resort & Spa al atardecer" />
          </div>
        </article>

        <article class="summary-card">
          <h3>Resumen de tu cuenta</h3>

          <ul class="summary-list">
            <li>
              <span class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2"/>
                  <path d="M3 9.5h18"/>
                  <path d="M8 3v4"/>
                  <path d="M16 3v4"/>
                </svg>
              </span>
              <div>
                <small>Reservas realizadas</small>
                <strong>{{ resumenCuenta.reservas }}</strong>
              </div>
            </li>

            <li>
              <span class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="3" width="14" height="18" rx="1.4"/>
                  <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>
                </svg>
              </span>
              <div>
                <small>Estancias completadas</small>
                <strong>{{ resumenCuenta.estancias }}</strong>
              </div>
            </li>

            <li>
              <span class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 3 14.9 9 21 9.6 16.5 13.7 17.8 20 12 16.6 6.2 20 7.5 13.7 3 9.6 9.1 9 12 3"/>
                </svg>
              </span>
              <div>
                <small>Puntos Aurea</small>
                <strong>{{ resumenCuenta.puntos | number }} pts</strong>
              </div>
            </li>
          </ul>

          <a class="link-gold" href="javascript:void(0)">
            Ver detalles de cuenta
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="13 6 19 12 13 18"/>
            </svg>
          </a>
        </article>
      </section>

      <section class="mid-row">
        <article class="card reservation-card">
          <div class="card-head">
            <h3>Tu próxima reserva</h3>
            <a class="link-gold" routerLink="/cliente/reservas">
              Ver todas mis reservas
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="13 6 19 12 13 18"/>
              </svg>
            </a>
          </div>

          @if (proximaReserva) {
            <div class="reservation-body">
              <img class="room-thumb" src="https://picsum.photos/seed/aurea-room/420/420" alt="Habitación Deluxe Ocean View" />

              <div class="reservation-info">
                <span class="status-pill">{{ proximaReserva.estado }}</span>
                <h4>{{ proximaReserva.habitacion }}</h4>

                <ul class="meta-list">
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="2"/>
                      <path d="M3 9.5h18"/>
                      <path d="M8 3v4"/>
                      <path d="M16 3v4"/>
                    </svg>
                    {{ proximaReserva.fechas }}
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="8" r="3.4"/>
                      <path d="M5 20c.7-3.6 3.2-5.8 7-5.8s6.3 2.2 7 5.8"/>
                    </svg>
                    {{ proximaReserva.huespedes }}
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z"/>
                      <circle cx="12" cy="9" r="2.4"/>
                    </svg>
                    {{ proximaReserva.lugar }}
                  </li>
                </ul>

                <div class="reservation-actions">
                  <button class="btn primary" type="button" routerLink="/cliente/reservas">Ver detalles</button>
                  <button class="btn ghost" type="button" routerLink="/cliente/reservas">Modificar reserva</button>
                </div>
              </div>
            </div>
          } @else {
            <div class="no-reservation-body" style="padding: 2.2rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.9rem; height: 80%; box-sizing: border-box;">
              <p style="color: var(--text-600); margin: 0; font-size: 0.95rem;">No tienes próximas estancias programadas.</p>
              <button class="btn primary" type="button" routerLink="/cliente/habitaciones" style="background: linear-gradient(135deg, var(--gold-300), var(--gold-500)); color: var(--navy-950); font-weight: 800; border: none; border-radius: 12px; padding: 0.65rem 1.3rem; cursor: pointer; box-shadow: 0 10px 20px rgba(201, 162, 39, 0.25);">
                Explorar habitaciones
              </button>
            </div>
          }
        </article>

        <article class="card actions-card">
          <h3>Acciones rápidas</h3>

          <div class="actions-grid">
            @for (accion of accionesRapidas; track accion.titulo) {
              <a class="action-item" href="javascript:void(0)">
                <span class="action-icon">
                  @switch (accion.icono) {
                    @case ("reserva") {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2"/>
                        <path d="M3 9.5h18"/>
                        <path d="M8 3v4"/>
                        <path d="M16 3v4"/>
                        <path d="M12 13v4"/>
                        <path d="M10 15h4"/>
                      </svg>
                    }
                    @case ("servicios") {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 16a9 9 0 0 1 18 0"/>
                        <path d="M2.5 16h19"/>
                        <path d="M12 7V4"/>
                        <path d="M10 4h4"/>
                      </svg>
                    }
                    @case ("facturas") {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 3h7l4 4v14H7Z"/>
                        <path d="M14 3v4h4"/>
                        <path d="M9 12h6"/>
                        <path d="M9 16h6"/>
                      </svg>
                    }
                    @case ("contacto") {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.7A8.4 8.4 0 1 1 21 11.5Z"/>
                      </svg>
                    }
                  }
                </span>

                <div class="action-text">
                  <strong>{{ accion.titulo }}</strong>
                  <small>{{ accion.descripcion }}</small>
                </div>

                <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 6 15 12 9 18"/>
                </svg>
              </a>
            }
          </div>
        </article>
      </section>

      <section class="offers-section">
        <div class="section-head">
          <h3>Recomendaciones para ti</h3>
          <a class="link-gold" routerLink="/cliente/recomendaciones">
            Ver todas las recomendaciones
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="13 6 19 12 13 18"/>
            </svg>
          </a>
        </div>

        <div class="offers-grid">
          @if (cargandoRecomendaciones) {
            <p style="grid-column: 1 / -1; text-align: center; color: var(--text-600); padding: 1.5rem 0;">Cargando recomendaciones...</p>
          } @else if (recomendacionesHome.length === 0) {
            <p style="grid-column: 1 / -1; text-align: center; color: var(--text-600); padding: 1.5rem 0;">Estamos personalizando sugerencias exclusivas para ti. ¡Vuelve pronto!</p>
          } @else {
            @for (item of recomendacionesHome; track $index) {
              <article class="offer-card" style="background-image: linear-gradient(rgba(11, 37, 64, 0.4), rgba(11, 37, 64, 0.8)), url('https://picsum.photos/seed/aurea-recom-card/500/380');">
                <div class="offer-overlay" style="opacity: 1; background: transparent; transform: none; padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; height: 100%;">
                  <span class="category-badge-home" style="display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; background: var(--gold-500); color: var(--navy-950); margin-bottom: 0.4rem;">
                    {{ item.categoria }}
                  </span>
                  <h4 style="color: var(--white); font-family: 'Playfair Display', serif; font-size: 1.25rem; margin: 0 0 0.3rem;">{{ item.nombre }}</h4>
                  <p style="color: rgba(255,255,255,0.85); font-size: 0.82rem; margin: 0 0 0.6rem; line-height: 1.4;">{{ item.descripcion }}</p>
                  <span style="font-size: 0.72rem; color: var(--gold-300); font-weight: 700;">Prioridad: {{ item.prioridad >= 4 ? 'Alta' : (item.prioridad >= 3 ? 'Media' : 'Baja') }}</span>
                </div>
              </article>
            }
          }
        </div>
      </section>
    </section>
  `,
  styles: [`
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

    .cliente-home {
      display: grid;
      gap: 1.2rem;
    }

    /* Hero row */
    .hero-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 290px;
      gap: 1.1rem;
      align-items: stretch;
    }

    .hero-card {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      background: linear-gradient(120deg, var(--cream-50) 38%, transparent 38%),
        linear-gradient(135deg, #F3E9D6, var(--cream-50));
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      align-items: stretch;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    .hero-text {
      padding: 2rem 1.8rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: .2rem;
    }

    .eyebrow {
      display: inline-block;
      color: var(--gold-500);
      text-transform: uppercase;
      letter-spacing: .14em;
      font-size: .76rem;
      font-weight: 900;
      margin-bottom: .3rem;
    }

    .hero-text h2 {
      margin: 0;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 2.1rem;
      line-height: 1.1;
    }

    .title-line {
      display: block;
      width: 64px;
      height: 3px;
      border-radius: 99px;
      background: var(--gold-500);
      margin: .9rem 0;
    }

    .hero-text p {
      margin: 0;
      max-width: 360px;
      color: var(--text-600);
      font-size: .92rem;
      line-height: 1.6;
    }

    .hero-image {
      position: relative;
      min-height: 220px;
    }

    .hero-image img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .summary-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow);
    }

    .summary-card h3 {
      margin: 0 0 1rem;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem;
    }

    .summary-list {
      list-style: none;
      margin: 0 0 1rem;
      padding: 0;
      display: grid;
      gap: .85rem;
      flex: 1;
    }

    .summary-list li {
      display: flex;
      align-items: center;
      gap: .75rem;
    }

    .summary-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: var(--cream-50);
      color: var(--gold-500);
      border: 1px solid rgba(201, 162, 39, .18);
      flex: 0 0 auto;
    }

    .summary-icon svg {
      width: 18px;
      height: 18px;
    }

    .summary-list small {
      display: block;
      color: var(--text-600);
      font-size: .76rem;
      margin-bottom: .15rem;
    }

    .summary-list strong {
      display: block;
      color: var(--navy-900);
      font-size: 1.05rem;
      font-weight: 800;
    }

    .link-gold {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      color: var(--gold-500);
      font-weight: 800;
      font-size: .85rem;
      text-decoration: none;
      border-top: 1px solid var(--border);
      padding-top: .9rem;
    }

    .link-gold svg {
      width: 15px;
      height: 15px;
    }

    .link-gold:hover {
      color: #a9810f;
    }

    /* Mid row */
    .mid-row {
      display: grid;
      grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
      gap: 1.1rem;
      align-items: start;
    }

    .card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 1.3rem 1.4rem;
      box-shadow: var(--shadow);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.1rem;
    }

    .card-head h3,
    .actions-card h3 {
      margin: 0;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem;
    }

    .card-head .link-gold {
      border-top: none;
      padding-top: 0;
    }

    .reservation-body {
      display: flex;
      gap: 1.2rem;
    }

    .room-thumb {
      width: 180px;
      height: 180px;
      border-radius: 16px;
      object-fit: cover;
      flex: 0 0 auto;
    }

    .reservation-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }

    .status-pill {
      display: inline-block;
      align-self: start;
      background: rgba(201, 162, 39, .14);
      color: #92660f;
      text-transform: uppercase;
      letter-spacing: .04em;
      font-size: .68rem;
      font-weight: 900;
      padding: .3rem .6rem;
      border-radius: 999px;
    }

    .reservation-info h4 {
      margin: 0;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
    }

    .meta-list {
      list-style: none;
      margin: .2rem 0 0;
      padding: 0;
      display: grid;
      gap: .4rem;
    }

    .meta-list li {
      display: flex;
      align-items: center;
      gap: .5rem;
      color: var(--text-600);
      font-size: .86rem;
    }

    .meta-list svg {
      width: 16px;
      height: 16px;
      color: var(--gold-500);
      flex: 0 0 auto;
    }

    .reservation-actions {
      display: flex;
      gap: .6rem;
      margin-top: .6rem;
    }

    .btn {
      border-radius: 12px;
      padding: .6rem 1rem;
      font-weight: 800;
      font-size: .85rem;
      cursor: pointer;
      transition: .18s ease;
      border: 1px solid transparent;
    }

    .btn.primary {
      background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
      color: var(--navy-950);
      box-shadow: 0 12px 20px rgba(201, 162, 39, .26);
    }

    .btn.primary:hover {
      transform: translateY(-1px);
    }

    .btn.ghost {
      background: var(--white);
      color: var(--navy-900);
      border-color: var(--gold-500);
    }

    .btn.ghost:hover {
      background: var(--cream-50);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: .8rem;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: .7rem;
      padding: .85rem;
      border-radius: 16px;
      border: 1px solid var(--border);
      text-decoration: none;
      transition: .18s ease;
    }

    .action-item:hover {
      border-color: rgba(201, 162, 39, .45);
      background: var(--cream-50);
    }

    .action-icon {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      display: grid;
      place-items: center;
      background: var(--cream-50);
      color: var(--gold-500);
      border: 1px solid rgba(201, 162, 39, .18);
      flex: 0 0 auto;
    }

    .action-icon svg {
      width: 20px;
      height: 20px;
    }

    .action-text {
      flex: 1;
      min-width: 0;
    }

    .action-text strong {
      display: block;
      color: var(--navy-900);
      font-size: .88rem;
      font-weight: 800;
      line-height: 1.2;
    }

    .action-text small {
      display: block;
      color: var(--text-600);
      font-size: .74rem;
      margin-top: .15rem;
      line-height: 1.3;
    }

    .action-item .chevron {
      width: 16px;
      height: 16px;
      color: var(--text-600);
      flex: 0 0 auto;
    }

    /* Offers */
    .offers-section {
      display: grid;
      gap: 1rem;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .section-head h3 {
      margin: 0;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
    }

    .section-head .link-gold {
      border-top: none;
      padding-top: 0;
    }

    .offers-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .offer-card {
      position: relative;
      min-height: 190px;
      border-radius: 20px;
      overflow: hidden;
      background-size: cover;
      background-position: center;
      box-shadow: var(--shadow);
    }

    .offer-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(6,26,46,.15) 0%, rgba(6,26,46,.92) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.1rem;
      gap: .3rem;
    }

    .offer-overlay h4 {
      margin: 0;
      color: var(--white);
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
    }

    .offer-overlay p {
      margin: 0;
      color: rgba(255, 255, 255, .78);
      font-size: .82rem;
      line-height: 1.4;
      max-width: 240px;
    }

    .offer-link {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      color: var(--gold-300);
      font-weight: 800;
      font-size: .82rem;
      text-decoration: none;
      margin-top: .3rem;
    }

    .offer-link svg {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 1050px) {
      .hero-row {
        grid-template-columns: 1fr;
      }

      .hero-card {
        grid-template-columns: 1fr;
      }

      .hero-image {
        min-height: 200px;
        order: -1;
      }

      .mid-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .reservation-body {
        flex-direction: column;
      }

      .room-thumb {
        width: 100%;
        height: 180px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .offers-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly trackingService = inject(TrackingService);
  clienteNombre = "";
  idHuespedActual: number | null = null;

  resumenCuenta = {
    reservas: 0,
    estancias: 0,
    puntos: 0,
  };

  proximaReserva: any = null;

  async ngOnInit() {
    this.trackingService.registrarVisita("Inicio", "Ingresó al módulo");
    this.clienteNombre = this.authService.getUserNombre();
    await this.cargarDatosHome();
  }

  async cargarDatosHome() {
    try {
      const userId = this.authService.getUserId();
      if (!userId) return;

      const huespedes = await firstValueFrom(this.apiService.get<any[]>("/huespedes"));
      const actual = huespedes.find((h) => Number(h.ID_USUARIO) === userId);
      this.idHuespedActual = actual?.ID_HUESPED ?? null;

      if (!this.idHuespedActual) return;

      const todasLasReservas = await firstValueFrom(this.apiService.get<any[]>("/reservas"));
      const misReservas = todasLasReservas.filter((r) => Number(r.ID_HUESPED) === Number(this.idHuespedActual));

      const totalReservas = misReservas.length;
      const totalEstancias = misReservas.filter((r) => {
        const est = String(r.ESTADO).toUpperCase();
        return est === "FINALIZADA" || est === "CONFIRMADA";
      }).length;
      const totalPuntos = totalReservas * 500;

      this.resumenCuenta = {
        reservas: totalReservas,
        estancias: totalEstancias,
        puntos: totalPuntos
      };

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const proximas = misReservas.filter((r) => {
        const est = String(r.ESTADO).toUpperCase();
        if (est === "CANCELADA") return false;
        
        const fechaSalida = new Date(r.FECHA_SALIDA);
        return fechaSalida >= hoy;
      });

      proximas.sort((a, b) => new Date(a.FECHA_INGRESO).getTime() - new Date(b.FECHA_INGRESO).getTime());

      if (proximas.length > 0) {
        const prox = proximas[0];
        this.proximaReserva = {
          estado: prox.ESTADO,
          habitacion: prox.NUMERO_HABITACION ? `Habitación #${prox.NUMERO_HABITACION}` : "Habitación Reservada",
          fechas: `${this.formatearFechaSimple(prox.FECHA_INGRESO)} - ${this.formatearFechaSimple(prox.FECHA_SALIDA)} (${prox.CANTIDAD_NOCHES || this.calcularNoches(prox.FECHA_INGRESO, prox.FECHA_SALIDA)} noches)`,
          huespedes: "2 Adultos",
          lugar: "Aurea Resort & Spa"
        };
      } else {
        this.proximaReserva = null;
      }

      // 5. Cargar Recomendaciones
      this.cargandoRecomendaciones = true;
      try {
        const recoms = await firstValueFrom(this.apiService.get<any[]>(`/recomendaciones/huesped/${this.idHuespedActual}`));
        if (recoms && recoms.length > 0) {
          this.recomendacionesHome = (recoms[0].recomendaciones || []).slice(0, 3);
        } else {
          this.recomendacionesHome = [];
        }
      } catch (e) {
        this.recomendacionesHome = [];
      } finally {
        this.cargandoRecomendaciones = false;
      }
    } catch (err) {
      console.error("Error cargando estadísticas del Home:", err);
    }
  }

  formatearFechaSimple(fechaStr: string): string {
    if (!fechaStr) return "";
    const date = new Date(fechaStr);
    const meses = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
    return `${date.getDate()} ${meses[date.getMonth()]}`;
  }

  calcularNoches(inicio: string, fin: string): number {
    if (!inicio || !fin) return 1;
    const start = new Date(`${inicio.slice(0,10)}T00:00:00`);
    const end = new Date(`${fin.slice(0,10)}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  accionesRapidas: AccionRapida[] = [
    { titulo: "Nueva reserva", descripcion: "Reserva tu próxima estancia", icono: "reserva" },
    { titulo: "Servicios del hotel", descripcion: "Descubre nuestros servicios", icono: "servicios" },
    { titulo: "Facturas", descripcion: "Consulta y descarga tus comprobantes", icono: "facturas" },
    { titulo: "Contáctanos", descripcion: "Estamos para ayudarte", icono: "contacto" },
  ];

  cargandoRecomendaciones = true;
  recomendacionesHome: any[] = [];
}