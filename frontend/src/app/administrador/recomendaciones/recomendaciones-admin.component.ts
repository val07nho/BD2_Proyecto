import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../../core/services/api.service";

interface Huesped {
  ID_HUESPED: number;
  NOMBRES: string;
  APELLIDOS: string;
  CORREO: string;
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

interface VisitaHistorial {
  fecha: string | Date;
  modulo: string;
  accion: string;
}

interface BusquedaHistorial {
  fecha: string | Date;
  texto: string;
}

interface DocumentoHistorial {
  idHuesped: number;
  busquedas?: BusquedaHistorial[];
  visitas?: VisitaHistorial[];
}

@Component({
  selector: "app-recomendaciones-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="recomendaciones-admin">
      <div class="header-card card">
        <h2>Gestión de Recomendaciones de Clientes</h2>
        <p>Selecciona un huésped para ver su historial de visitas/búsquedas de MongoDB y personalizar las sugerencias exclusivas que verá en su pantalla de inicio.</p>

        <div class="selector-row">
          <label for="huesped-select">Seleccionar Huésped:</label>
          <select id="huesped-select" (change)="onHuespedChange($any($event.target).value)">
            <option [value]="null">-- Selecciona un huésped --</option>
            @for (h of huespedes; track h.ID_HUESPED) {
              <option [value]="h.ID_HUESPED">{{ h.NOMBRES }} {{ h.APELLIDOS }} ({{ h.CORREO }})</option>
            }
          </select>
        </div>
      </div>

      @if (huespedSeleccionado) {
        <div class="workspace-grid">
          <!-- Historial del Cliente (MongoDB) -->
          <article class="card history-section">
            <h3>Historial del Cliente (MongoDB)</h3>
            <p class="subtitle">Datos recolectados automáticamente por el comportamiento de {{ huespedSeleccionado.NOMBRES }}.</p>

            @if (cargandoHistorial) {
              <p class="loading-text">Cargando historial...</p>
            } @else {
              <div class="history-lists">
                <div class="history-block">
                  <h4>Últimas búsquedas realizadas</h4>
                  @if (!historial?.busquedas?.length) {
                    <p class="empty-list">No hay búsquedas registradas.</p>
                  } @else {
                    <ul class="tag-list">
                      @for (b of historial?.busquedas; track $index) {
                        <li>
                          <span class="tag-text">"{{ b.texto }}"</span>
                          <span class="tag-date">{{ b.fecha | date: 'dd/MM HH:mm' }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>

                <div class="history-block">
                  <h4>Últimas visitas y acciones</h4>
                  @if (!historial?.visitas?.length) {
                    <p class="empty-list">No hay visitas registradas.</p>
                  } @else {
                    <div class="visits-timeline">
                      @for (v of historial?.visitas; track $index) {
                        <div class="timeline-item">
                          <span class="timeline-date">{{ v.fecha | date: 'dd/MM HH:mm' }}</span>
                          <strong>{{ v.modulo }}</strong>
                          <span>{{ v.accion }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </article>

          <!-- Recomendaciones del Cliente -->
          <article class="card recommendations-section">
            <div class="recom-header">
              <h3>Recomendaciones Personalizadas</h3>
              <button class="btn primary" type="button" (click)="abrirModalCrear()">
                + Agregar recomendación
              </button>
            </div>

            @if (cargandoRecoms) {
              <p class="loading-text">Cargando recomendaciones...</p>
            } @else if (!items.length) {
              <div class="empty-state">
                <p>Aún no hay recomendaciones personalizadas para este huésped.</p>
                <button class="btn secondary" type="button" (click)="abrirModalCrear()">
                  Crear la primera sugerencia
                </button>
              </div>
            } @else {
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Prioridad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of items; track $index; let i = $index) {
                      <tr>
                        <td>
                          <span class="badge" [class]="item.categoria.toLowerCase()">
                            {{ item.categoria }}
                          </span>
                        </td>
                        <td><strong>{{ item.nombre }}</strong></td>
                        <td class="td-desc">{{ item.descripcion }}</td>
                        <td>
                          <span class="priority-badge" [class]="getPriorityClass(item.prioridad)">
                            {{ getPriorityLabel(item.prioridad) }}
                          </span>
                        </td>
                        <td>
                          <div class="row-actions">
                            <button class="action" type="button" (click)="abrirModalEditar(item, i)">Editar</button>
                            <button class="action danger" type="button" (click)="eliminarRecomendacion(i)">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </article>
        </div>
      } @else {
        <div class="empty-workspace card">
          <p>Selecciona un huésped en el panel superior para administrar sus recomendaciones e historial.</p>
        </div>
      }

      <!-- Modal de Formulario -->
      @if (mostrarModal) {
        <div class="modal-overlay">
          <div class="modal-card card">
            <h3>{{ editIndex !== null ? 'Editar Recomendación' : 'Nueva Recomendación' }}</h3>

            <form [formGroup]="form" (ngSubmit)="guardarRecomendacion()">
              <label>
                Categoría
                <select formControlName="categoria">
                  <option value="Servicio">Servicio</option>
                  <option value="Evento">Evento</option>
                  <option value="Habitación">Habitación</option>
                </select>
              </label>

              <label>
                Nombre de la recomendación
                <input type="text" formControlName="nombre" placeholder="Ej. Spa Premium" />
              </label>

              <label>
                Descripción explicativa
                <textarea rows="3" formControlName="descripcion" placeholder="Ej. Recomendado por tus búsquedas recientes..."></textarea>
              </label>

              <label>
                Prioridad
                <select formControlName="prioridad">
                  <option [ngValue]="5">5 - Alta</option>
                  <option [ngValue]="3">3 - Media</option>
                  <option [ngValue]="1">1 - Baja</option>
                </select>
              </label>

              @if (modalError) {
                <div class="alert error">{{ modalError }}</div>
              }

              <div class="modal-buttons">
                <button class="btn secondary" type="button" (click)="cerrarModal()">Cancelar</button>
                <button class="btn primary" type="submit" [disabled]="form.invalid || guardando">
                  {{ guardando ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
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
        --navy-800: #123456;
        --navy-700: #16395E;
        --gold-500: #C9A227;
        --gold-300: #E3C77E;
        --cream-50: #FBF8F2;
        --white: #FFFFFF;
        --muted: #5C6B80;
        --border: #E7EAF0;
        --shadow: 0 18px 40px rgba(11, 37, 64, .08);
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      .recomendaciones-admin { display: grid; gap: 1.5rem; }

      .card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
      }

      .header-card h2 { margin: 0 0 0.5rem; color: var(--navy-900); font-family: 'Playfair Display', serif; }
      .header-card p { margin: 0 0 1.25rem; color: var(--muted); font-size: 0.92rem; }

      .selector-row {
        display: flex;
        gap: 1rem;
        align-items: center;
        background: var(--cream-50);
        padding: 0.85rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--border);
      }
      .selector-row label { font-weight: 700; color: var(--navy-900); font-size: 0.88rem; }
      .selector-row select {
        padding: 0.45rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--white);
        font: inherit;
        color: var(--navy-900);
        min-width: 320px;
      }

      .workspace-grid {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 1.5rem;
      }

      h3 { margin: 0 0 0.35rem; color: var(--navy-900); font-family: 'Playfair Display', serif; }
      .subtitle { margin: 0 0 1rem; color: var(--muted); font-size: 0.82rem; }

      .loading-text { text-align: center; color: var(--muted); padding: 2rem; font-size: 0.88rem; }

      .history-lists { display: grid; gap: 1.5rem; }
      .history-block h4 { margin: 0 0 0.75rem; color: var(--navy-700); font-size: 0.85rem; border-bottom: 2px solid var(--border); padding-bottom: 0.35rem; }
      
      .tag-list { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .tag-list li {
        background: rgba(11,37,64,0.06);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.76rem;
      }
      .tag-text { color: var(--navy-900); font-weight: 600; }
      .tag-date { color: var(--muted); font-size: 0.68rem; }

      .visits-timeline { display: grid; gap: 0.75rem; }
      .timeline-item {
        background: var(--cream-50);
        border-left: 3px solid var(--gold-500);
        padding: 0.5rem 0.75rem;
        border-radius: 0 6px 6px 0;
        font-size: 0.78rem;
        display: flex;
        flex-direction: column;
      }
      .timeline-date { font-size: 0.68rem; color: var(--muted); font-weight: 700; margin-bottom: 0.15rem; }
      .timeline-item strong { color: var(--navy-900); }

      .recom-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }

      .btn {
        padding: 0.58rem 1.1rem;
        font-weight: 700;
        border-radius: 8px;
        font-size: 0.84rem;
        cursor: pointer;
        border: 1px solid transparent;
        transition: opacity 0.15s;
      }
      .btn:hover { opacity: 0.9; }
      .btn.primary { background: var(--navy-900); color: var(--white); }
      .btn.secondary { background: var(--cream-50); color: var(--navy-900); border-color: var(--border); }
      .btn:disabled { opacity: 0.6; cursor: not-allowed; }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        border: 2px dashed var(--border);
        border-radius: 12px;
        color: var(--muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .empty-state p { margin: 0; }

      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; text-align: left; }
      th, td { padding: 0.75rem 0.65rem; border-bottom: 1px solid var(--border); font-size: 0.84rem; }
      th { text-transform: uppercase; font-size: 0.72rem; color: var(--muted); letter-spacing: 0.05em; font-weight: 800; }
      
      .td-desc { max-width: 260px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: var(--muted); }

      .badge {
        display: inline-block;
        padding: 0.2rem 0.45rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        background: rgba(11,37,64,0.06);
        color: var(--navy-900);
      }
      .badge.servicio { background: rgba(201, 162, 39, 0.12); color: #8C6A00; }
      .badge.evento { background: rgba(74, 144, 226, 0.12); color: #1A5FB4; }
      .badge.habitacion { background: rgba(46, 125, 50, 0.12); color: #1F5F23; }

      .priority-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.45rem;
        border-radius: 4px;
      }
      .priority-badge.alta { background: #FDF2F2; color: #9C1A1A; }
      .priority-badge.media { background: #FEF7EC; color: #945B00; }
      .priority-badge.baja { background: #F0FDF4; color: #166534; }

      .row-actions { display: flex; gap: 0.35rem; }
      .action {
        border: 1px solid var(--border);
        background: var(--cream-50);
        color: var(--navy-900);
        border-radius: 6px;
        padding: 0.25rem 0.45rem;
        font-size: 0.74rem;
        cursor: pointer;
      }
      .action.danger { color: #8A1E18; border-color: rgba(179,38,30,.25); }

      .empty-workspace { text-align: center; color: var(--muted); padding: 4rem 1.5rem; }

      /* Modal */
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
      .modal-card { width: 100%; max-width: 480px; }
      .modal-card form { display: grid; gap: 1rem; margin-top: 1rem; }
      .modal-card label { display: grid; gap: 0.35rem; font-weight: 700; color: var(--navy-900); font-size: 0.8rem; }
      .modal-card input, .modal-card select, .modal-card textarea {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 0.55rem 0.65rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }
      .modal-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }

      .alert { border-radius: 8px; padding: 0.6rem 0.8rem; font-weight: 600; font-size: 0.8rem; }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.2); }
      
      @media (max-width: 1080px) {
        .workspace-grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class RecomendacionesAdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  huespedes: Huesped[] = [];
  huespedSeleccionado: Huesped | null = null;
  historial: DocumentoHistorial | null = null;
  items: ItemRecomendacion[] = [];

  cargandoHistorial = false;
  cargandoRecoms = false;
  guardando = false;

  mostrarModal = false;
  editIndex: number | null = null;
  modalError = "";

  readonly form = this.fb.group({
    categoria: ["Servicio", [Validators.required]],
    nombre: ["", [Validators.required]],
    descripcion: ["", [Validators.required]],
    prioridad: [5, [Validators.required]]
  });

  async ngOnInit() {
    await this.cargarHuespedes();
  }

  async cargarHuespedes() {
    try {
      this.huespedes = await firstValueFrom(this.api.get<Huesped[]>("/huespedes"));
    } catch (e) {
      console.error("Error al cargar huéspedes:", e);
    }
  }

  async onHuespedChange(idStr: string) {
    const id = Number(idStr);
    const huesped = this.huespedes.find((h) => h.ID_HUESPED === id);
    this.huespedSeleccionado = huesped || null;
    this.historial = null;
    this.items = [];

    if (this.huespedSeleccionado) {
      await Promise.all([
        this.cargarHistorial(id),
        this.cargarRecomendaciones(id)
      ]);
    }
  }

  async cargarHistorial(idHuesped: number) {
    this.cargandoHistorial = true;
    try {
      const data = await firstValueFrom(this.api.get<DocumentoHistorial>(`/historial-cliente/huesped/${idHuesped}`));
      this.historial = data;
    } catch (e) {
      this.historial = null;
    } finally {
      this.cargandoHistorial = false;
    }
  }

  async cargarRecomendaciones(idHuesped: number) {
    this.cargandoRecoms = true;
    try {
      const data = await firstValueFrom(this.api.get<DocumentoRecomendaciones[]>(`/recomendaciones/huesped/${idHuesped}`));
      if (data && data.length > 0) {
        this.items = data[0].recomendaciones || [];
      } else {
        this.items = [];
      }
    } catch (e) {
      this.items = [];
    } finally {
      this.cargandoRecoms = false;
    }
  }

  abrirModalCrear() {
    this.editIndex = null;
    this.modalError = "";
    this.form.reset({
      categoria: "Servicio",
      nombre: "",
      descripcion: "",
      prioridad: 5
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(item: ItemRecomendacion, idx: number) {
    this.editIndex = idx;
    this.modalError = "";
    this.form.patchValue({
      categoria: item.categoria,
      nombre: item.nombre,
      descripcion: item.descripcion,
      prioridad: item.prioridad
    });
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.editIndex = null;
  }

  async guardarRecomendacion() {
    if (this.form.invalid || !this.huespedSeleccionado) return;
    this.guardando = true;
    this.modalError = "";

    try {
      const formVal = this.form.value;
      const newItem: ItemRecomendacion = {
        categoria: String(formVal.categoria || ""),
        nombre: String(formVal.nombre || ""),
        descripcion: String(formVal.descripcion || ""),
        prioridad: Number(formVal.prioridad || 5)
      };

      const updated = [...this.items];
      if (this.editIndex !== null) {
        updated[this.editIndex] = newItem;
      } else {
        updated.push(newItem);
      }

      await firstValueFrom(
        this.api.put(`/recomendaciones/huesped/${this.huespedSeleccionado.ID_HUESPED}`, {
          recomendaciones: updated
        })
      );

      this.items = updated;
      this.cerrarModal();
    } catch (e) {
      this.modalError = "Error al intentar guardar la recomendación en MongoDB.";
    } finally {
      this.guardando = false;
    }
  }

  async eliminarRecomendacion(idx: number) {
    if (!this.huespedSeleccionado) return;
    const ok = confirm("¿Deseas eliminar esta recomendación?");
    if (!ok) return;

    try {
      const updated = this.items.filter((_, i) => i !== idx);
      await firstValueFrom(
        this.api.put(`/recomendaciones/huesped/${this.huespedSeleccionado.ID_HUESPED}`, {
          recomendaciones: updated
        })
      );
      this.items = updated;
    } catch (e) {
      alert("Error al intentar eliminar la recomendación.");
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
