import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface Huesped {
  ID_HUESPED: number;
  ID_USUARIO: number | null;
}

interface ItemRecomendacion {
  categoria: string;
  nombre: string;
  descripcion: string;
  prioridad: number;
}

interface DocumentoRecomendaciones {
  idHuesped: number;
  recomendaciones: ItemRecomendacion[];
  fechaGeneracion?: string;
}

@Component({
  selector: "app-recomendaciones-cliente",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cliente-recomendaciones">
      <section class="hero">
        <div>
          <span class="eyebrow">Exclusivo para ti</span>
          <h1>Recomendaciones Personalizadas</h1>
          <p>Sugerencias premium de servicios, eventos y habitaciones pensadas especialmente para ti, basadas en tus gustos e historial de estadía.</p>
        </div>
      </section>

      @if (cargando) {
        <div class="status-msg">Cargando tus recomendaciones...</div>
      } @else if (error) {
        <div class="alert error">{{ error }}</div>
      } @else if (!items.length) {
        <div class="no-recommendations card">
          <div class="empty-icon">✨</div>
          <h3>Preparamos algo especial</h3>
          <p>Nuestro equipo está analizando tus preferencias e historial de navegación. Pronto verás recomendaciones aquí.</p>
        </div>
      } @else {
        <div class="grid">
          @for (item of items; track $index) {
            <article class="card recom-card">
              <div class="badge-row">
                <span class="category-badge" [class]="item.categoria.toLowerCase()">
                  {{ item.categoria }}
                </span>
                <span class="priority-badge" [class]="getPriorityClass(item.prioridad)">
                  Prioridad: {{ getPriorityLabel(item.prioridad) }}
                </span>
              </div>

              <h3>{{ item.nombre }}</h3>
              <p class="desc">{{ item.descripcion }}</p>
            </article>
          }
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
      .cliente-recomendaciones { display: grid; gap: 1.5rem; }
      
      .hero {
        border-radius: 24px;
        padding: 2rem;
        background: linear-gradient(120deg, #F3E9D6, var(--cream-50));
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
      }
      .eyebrow { color: var(--gold-500); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 900; }
      .hero h1 { margin: .3rem 0 .45rem; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 2.1rem; }
      .hero p { margin: 0; color: var(--muted); max-width: 680px; font-size: 0.95rem; }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
      }

      .card {
        border-radius: 18px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1.5rem;
      }

      .recom-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .recom-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 45px rgba(11, 37, 64, .13);
      }

      .badge-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .category-badge {
        display: inline-block;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        background: rgba(11, 37, 64, 0.07);
        color: var(--navy-900);
      }
      .category-badge.servicio {
        background: rgba(201, 162, 39, 0.12);
        color: #8C6A00;
      }
      .category-badge.evento {
        background: rgba(74, 144, 226, 0.12);
        color: #1A5FB4;
      }
      .category-badge.habitacion {
        background: rgba(46, 125, 50, 0.12);
        color: #1F5F23;
      }

      .priority-badge {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.25rem 0.65rem;
        border-radius: 8px;
      }
      .priority-badge.alta {
        background: #FDF2F2;
        color: #9C1A1A;
      }
      .priority-badge.media {
        background: #FEF7EC;
        color: #945B00;
      }
      .priority-badge.baja {
        background: #F0FDF4;
        color: #166534;
      }

      .recom-card h3 {
        margin: 0;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
        font-size: 1.3rem;
      }

      .desc {
        margin: 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.5;
      }

      .no-recommendations {
        text-align: center;
        padding: 3rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
      .empty-icon {
        font-size: 3rem;
      }
      .no-recommendations h3 {
        margin: 0;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
      }
      .no-recommendations p {
        margin: 0;
        color: var(--muted);
        max-width: 420px;
        font-size: 0.9rem;
      }

      .status-msg {
        text-align: center;
        color: var(--muted);
        padding: 2rem;
      }

      .alert {
        border-radius: 12px;
        padding: 0.9rem 1.1rem;
        font-weight: 600;
        font-size: 0.88rem;
      }
      .alert.error {
        background: rgba(179,38,30,.1);
        color: #8A1E18;
        border: 1px solid rgba(179,38,30,.25);
      }
    `
  ]
})
export class RecomendacionesClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  cargando = true;
  error = "";
  items: ItemRecomendacion[] = [];
  idHuespedActual: number | null = null;

  async ngOnInit() {
    await this.cargarContexto();
  }

  async cargarContexto() {
    this.cargando = true;
    this.error = "";

    try {
      const userId = this.auth.getUserId();
      if (!userId) {
        throw new Error("No se pudo identificar tu cuenta de usuario.");
      }

      const huespedes = await firstValueFrom(this.api.get<Huesped[]>("/huespedes"));
      const actual = huespedes.find((h) => Number(h.ID_USUARIO) === userId);
      this.idHuespedActual = actual?.ID_HUESPED ?? null;

      if (!this.idHuespedActual) {
        this.items = [];
        this.cargando = false;
        return;
      }

      await this.cargarRecomendaciones();
    } catch (err: any) {
      this.error = err.message || "Error al cargar preferencias del cliente.";
      this.cargando = false;
    }
  }

  async cargarRecomendaciones() {
    try {
      const data = await firstValueFrom(
        this.api.get<DocumentoRecomendaciones[]>(`/recomendaciones/huesped/${this.idHuespedActual}`)
      );
      if (data && data.length > 0) {
        this.items = data[0].recomendaciones || [];
      } else {
        this.items = [];
      }
    } catch (err: any) {
      this.items = [];
    } finally {
      this.cargando = false;
    }
  }

  getPriorityLabel(prio: number): string {
    if (prio >= 4) return "Alta";
    if (prio >= 3) return "Media";
    return "Baja";
  }

  getPriorityClass(prio: number): string {
    if (prio >= 4) return "alta";
    if (prio >= 3) return "media";
    return "baja";
  }
}
