import { CommonModule, DecimalPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

interface Servicio {
  ID_SERVICIO: number;
  NOMBRE: string;
  PRECIO: number;
  DESCRIPCION?: string | null;
  ESTADO: "A" | "I" | string;
}

@Component({
  selector: "app-servicios-landing",
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  template: `
    <section class="servicios-landing">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Comodidad y Distinción</span>
          <h1>Servicios Premium</h1>
          <p>En Aurea Resort & Spa, nos esforzamos por ofrecerte servicios de primera clase. Explora las opciones disponibles para enriquecer tu estancia.</p>
        </div>
      </section>

      <div class="container">
        @if (error) {
          <div class="alert error">{{ error }}</div>
        }

        @if (cargando) {
          <div class="status-msg">Cargando catálogo de servicios...</div>
        } @else if (serviciosActivos.length === 0) {
          <div class="empty-state card">
            <span class="empty-icon">🛎️</span>
            <h3>Sin servicios registrados</h3>
            <p>No se encontraron servicios disponibles en este momento.</p>
          </div>
        } @else {
          <div class="grid">
            @for (s of serviciosActivos; track s.ID_SERVICIO) {
              <article class="servicio-card">
                <div class="cover" [style.background-image]="'url(' + imagenPara(s.ID_SERVICIO) + ')'"></div>
                
                <div class="body">
                  <div class="body-header">
                    <h3>{{ s.NOMBRE }}</h3>
                    <span class="price">S/ {{ s.PRECIO | number: '1.2-2' }}</span>
                  </div>
                  <p class="desc">{{ s.DESCRIPCION || 'Servicio de calidad garantizada para todos nuestros distinguidos clientes.' }}</p>
                  
                  <div class="card-footer">
                    <span class="avail">Disponible todos los días</span>
                    <a routerLink="/auth/login" class="btn-more">Ver más &rarr;</a>
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
        background-image: linear-gradient(180deg, rgba(11,37,64,.55), rgba(11,37,64,.85)), url('https://picsum.photos/seed/landing-servicios-hero/1600/700');
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

      .servicio-card {
        background: var(--white);
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        transition: transform 0.25s, box-shadow 0.25s;
        display: flex;
        flex-direction: column;
      }
      .servicio-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 22px 48px rgba(11, 37, 64, .1);
      }

      .cover {
        height: 220px;
        background-size: cover;
        background-position: center;
        position: relative;
      }

      .body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .body-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .servicio-card h3 {
        margin: 0;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.35rem;
      }
      .price {
        font-weight: 800;
        color: var(--gold-500);
        font-size: 1.25rem;
        white-space: nowrap;
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
      .avail {
        font-size: 0.8rem;
        color: var(--muted);
        font-weight: 600;
      }
      .btn-more {
        color: var(--navy-900);
        font-weight: 700;
        font-size: 0.82rem;
        text-decoration: none;
        transition: color 0.2s;
      }
      .btn-more:hover {
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
export class ServiciosLandingComponent implements OnInit {
  private readonly api = inject(ApiService);

  servicios: Servicio[] = [];
  cargando = true;
  error = "";

  ngOnInit(): void {
    this.cargarServicios();
  }

  get serviciosActivos(): Servicio[] {
    return this.servicios.filter((s) => s.ESTADO === "A");
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
        this.error = "No se pudieron cargar los servicios del hotel. Intenta de nuevo más tarde.";
        this.cargando = false;
      }
    });
  }

  imagenPara(id: number): string {
    return `https://picsum.photos/seed/landing-service-${id}/800/500`;
  }
}
