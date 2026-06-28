import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

interface Evento {
  ID_EVENTO: number;
  NOMBRE: string;
  DESCRIPCION?: string | null;
  FECHA_EVENTO: string;
  COSTO: number;
  CUPOS?: number | null;
  ESTADO: "A" | "I";
}

@Component({
  selector: "app-eventos-landing",
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  template: `
    <section class="eventos-landing">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Experiencias y Celebraciones</span>
          <h1>Eventos Exclusivos en Aurea</h1>
          <p>Descubre los eventos especiales, talleres de bienestar y experiencias culinarias programadas en nuestro resort. Un valor añadido para tu estancia.</p>
        </div>
      </section>

      <div class="container">
        @if (error) {
          <div class="alert error">{{ error }}</div>
        }

        @if (cargando) {
          <div class="status-msg">Cargando la agenda de eventos...</div>
        } @else if (eventosActivos.length === 0) {
          <div class="empty-state card">
            <span class="empty-icon">📅</span>
            <h3>Sin eventos programados</h3>
            <p>No hay eventos programados en este momento. Por favor, vuelve a consultar más tarde.</p>
          </div>
        } @else {
          <div class="grid">
            @for (e of eventosActivos; track e.ID_EVENTO) {
              <article class="evento-card">
                <div class="cover" [style.background-image]="'url(' + imagenPara(e.ID_EVENTO) + ')'">
                  <span class="price-badge">S/ {{ e.COSTO | number: '1.2-2' }}</span>
                </div>
                <div class="body">
                  <div class="date-row">
                    <span class="calendar-icon">📅</span>
                    <span>{{ e.FECHA_EVENTO | date: 'dd MMMM, yyyy' : 'UTC' }}</span>
                  </div>
                  <h3>{{ e.NOMBRE }}</h3>
                  <p class="desc">{{ e.DESCRIPCION || 'Disfruta de una velada única y actividades premium durante tu hospedaje en Aurea.' }}</p>
                  
                  <div class="card-footer">
                    <span class="slots">Cupos disponibles: {{ e.CUPOS ?? 'Ilimitados' }}</span>
                    <a routerLink="/auth/login" class="btn-rsvp">Registrarse &rarr;</a>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
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
        --border: #E2E8F0;
        --shadow: 0 18px 40px rgba(11, 37, 64, .06);
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
        background: var(--cream-50);
        min-height: 100vh;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
      }
      .hero {
        min-height: 320px;
        background-image: linear-gradient(180deg, rgba(11,37,64,.55), rgba(11,37,64,.85)), url('https://picsum.photos/seed/landing-eventos-hero/1600/700');
        background-size: cover;
        background-position: center;
        display: grid;
        align-items: center;
        text-align: center;
      }
      .hero-content {
        padding: 2rem;
        color: var(--white);
        max-width: 800px;
        margin: 0 auto;
      }
      .eyebrow { color: var(--gold-300); text-transform: uppercase; letter-spacing: .15em; font-size: .78rem; font-weight: 900; }
      .hero h1 { margin: .5rem 0 .75rem; font-family: 'Playfair Display', serif; font-size: 2.8rem; }
      .hero p { margin: 0; color: rgba(255,255,255,.9); font-size: 1.05rem; line-height: 1.6; }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
      }

      .evento-card {
        background: var(--white);
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        transition: transform 0.25s, box-shadow 0.25s;
        display: flex;
        flex-direction: column;
      }
      .evento-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 22px 48px rgba(11, 37, 64, .1);
      }

      .cover {
        height: 220px;
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .price-badge {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        background: var(--navy-900);
        color: var(--gold-300);
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        font-weight: 800;
        font-size: 0.88rem;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      }

      .body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .date-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        color: var(--gold-500);
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }
      .evento-card h3 {
        margin: 0 0 0.6rem;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.35rem;
      }
      .desc {
        color: var(--muted);
        font-size: 0.9rem;
        line-height: 1.55;
        margin: 0 0 1.5rem;
        flex-grow: 1;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--border);
        padding-top: 1rem;
      }
      .slots {
        font-size: 0.8rem;
        color: var(--muted);
        font-weight: 600;
      }
      .btn-rsvp {
        color: var(--navy-900);
        font-weight: 700;
        font-size: 0.82rem;
        text-decoration: none;
        transition: color 0.2s;
      }
      .btn-rsvp:hover {
        color: var(--gold-500);
      }

      .alert.error {
        background: #FDF2F2;
        color: #9C1A1A;
        border: 1px solid #FCA5A5;
        padding: 1rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        font-weight: 600;
      }
      .status-msg {
        text-align: center;
        color: var(--muted);
        padding: 4rem 1rem;
      }
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
      }
      .empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
      .empty-state h3 { margin: 0 0 0.5rem; font-family: 'Playfair Display', serif; color: var(--navy-900); }
      .empty-state p { margin: 0; color: var(--muted); }

      @media (max-width: 768px) {
        .hero h1 { font-size: 2.1rem; }
        .grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class EventosLandingComponent implements OnInit {
  private readonly api = inject(ApiService);

  eventos: Evento[] = [];
  cargando = true;
  error = "";

  ngOnInit(): void {
    this.cargarEventos();
  }

  get eventosActivos(): Evento[] {
    return this.eventos.filter((e) => e.ESTADO === "A");
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
        this.error = "No se pudieron cargar los eventos del hotel. Intenta de nuevo más tarde.";
        this.cargando = false;
      }
    });
  }

  imagenPara(id: number): string {
    return `https://picsum.photos/seed/landing-event-${id}/800/500`;
  }
}
