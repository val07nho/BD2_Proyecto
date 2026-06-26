import { DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Habitacion } from "./habitacion.model";
import { HabitacionesService } from "./habitacion.service";

@Component({
  selector: "app-habitaciones",
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <section class="page-head">
      <span class="eyebrow">Alojamiento</span>
      <h1>Nuestras habitaciones</h1>
    </section>

    @if (cargando) {
      <p class="estado-msg">Cargando habitaciones...</p>
    }

    @if (error) {
      <div class="estado-msg error">
        <p>No pudimos cargar las habitaciones. Intenta nuevamente.</p>
        <button class="btn-gold" (click)="cargar()">Reintentar</button>
      </div>
    }

    @if (!cargando && !error && habitaciones.length === 0) {
      <p class="estado-msg">Por el momento no hay habitaciones registradas.</p>
    }

    @if (!cargando && !error && habitaciones.length > 0) {
      <div class="habitaciones-grid">
        @for (h of habitaciones; track h.ID_HABITACION) {
          <article class="habitacion-card">
            <img [src]="imagenPara(h.TIPO)" [alt]="h.TIPO" />

            <span class="badge" [class]="claseEstado(h.ESTADO)">{{ h.ESTADO }}</span>

            <div class="habitacion-info">
              <h3>{{ h.TIPO }}</h3>
              <p class="numero">Habitación N° {{ h.NUMERO_HABITACION }}</p>
              <p class="capacidad">👤 Capacidad: {{ h.CAPACIDAD }} personas</p>

              <div class="habitacion-footer">
                <span class="precio">S/ {{ h.PRECIO_NOCHE | number: '1.2-2' }} <small>/ noche</small></span>
                <a
                  class="btn-gold"
                  [class.disabled]="h.ESTADO !== 'Disponible'"
                  routerLink="/auth/register"
                >
                  {{ h.ESTADO === 'Disponible' ? 'Reservar' : 'No disponible' }}
                </a>
              </div>
            </div>
          </article>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      --navy-900: #0B2540;
      --navy-700: #16395E;
      --gold-500: #C9A227;
      --gold-300: #E3C77E;
      --muted: #5C6B80;
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 3rem 1.5rem;
      max-width: 1320px;
      margin: 0 auto;
    }

    .page-head { text-align: center; max-width: 600px; margin: 0 auto 2.4rem; }
    .eyebrow {
      color: var(--gold-500);
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .page-head h1 {
      font-family: 'Playfair Display', serif;
      color: var(--navy-900);
      font-size: 2rem;
      margin: 0.4rem 0 0;
    }

    .estado-msg {
      text-align: center;
      color: var(--muted);
      padding: 2rem;
    }
    .estado-msg.error { color: #B3261E; }

    .habitaciones-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.6rem;
      justify-content: center;
    }

    .habitacion-card {
      position: relative;
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 24px rgba(11,37,64,0.08);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .habitacion-card img { width: 100%; height: 190px; object-fit: cover; display: block; }

    .badge {
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      color: white;
    }
    .badge.disponible { background: #2E7D32; }
    .badge.ocupada { background: #B3261E; }
    .badge.mantenimiento { background: #B8860B; }

    .habitacion-info { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .habitacion-info h3 { color: var(--navy-900); margin: 0; font-size: 1.05rem; }
    .numero, .capacidad { color: var(--muted); font-size: 0.82rem; margin: 0; }

    .habitacion-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.6rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .precio { color: var(--navy-900); font-weight: 700; font-size: 0.92rem; }
    .precio small { color: var(--muted); font-weight: 400; }

    .btn-gold {
      background: var(--gold-500);
      color: var(--navy-900);
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .btn-gold:hover { background: var(--gold-300); }
    .btn-gold.disabled {
      background: #D9DEE6;
      color: var(--muted);
      pointer-events: none;
    }

    /* ===== RESPONSIVE: aquí está el "varios por fila" ===== */
    @media (max-width: 1180px) {
      .habitaciones-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 880px) {
      .habitaciones-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .habitaciones-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HabitacionesComponent implements OnInit {
  private habitacionesService = inject(HabitacionesService);

  habitaciones: Habitacion[] = [];
  cargando = false;
  error = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = false;

    this.habitacionesService.obtenerHabitaciones().subscribe({
      next: (data: Habitacion[]) => {
        this.habitaciones = data;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  imagenPara(tipo: string): string {
    const seed = tipo.toLowerCase().replace(/\s+/g, "-");
    return `https://picsum.photos/seed/hab-${seed}/600/450`;
  }

  claseEstado(estado: string): string {
    return estado.toLowerCase();
  }
}