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
      <div class="breadcrumb">Administrador <span>/</span> Recomendaciones</div>

      <header class="head">
        <span class="eyebrow">Personalizacion de experiencia</span>
        <h2>Recomendaciones</h2>
        <p>Administra sugerencias exclusivas para cada huesped segun su historial registrado en MongoDB.</p>
      </header>

      <section class="filters card">
        <div>
          <h3>Seleccionar huesped</h3>
          <p class="subtitle">Elige un cliente para revisar historial, busquedas y recomendaciones.</p>
        </div>

        <div class="selector-row">
          <label for="huesped-select">Huesped</label>
          <select id="huesped-select" (change)="onHuespedChange($any($event.target).value)">
            <option value="">Selecciona un huesped</option>
            @for (h of huespedes; track h.ID_HUESPED) {
              <option [value]="h.ID_HUESPED">{{ h.NOMBRES }} {{ h.APELLIDOS }} ({{ h.CORREO }})</option>
            }
          </select>
        </div>
      </section>

      @if (huespedSeleccionado) {
        <div class="workspace-grid">
          <article class="card history-section">
            <h3>Historial del cliente</h3>
            <p class="subtitle">Actividad reciente de {{ huespedSeleccionado.NOMBRES }} registrada en MongoDB.</p>

            @if (cargandoHistorial) {
              <p class="loading-text">Cargando historial...</p>
            } @else {
              <div class="history-lists">
                <div class="history-block">
                  <h4>Ultimas busquedas</h4>
                  @if (!historial?.busquedas?.length) {
                    <p class="empty-list">No hay busquedas registradas.</p>
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
                  <h4>Ultimas visitas y acciones</h4>
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

          <article class="card recommendations-section">
            <div class="recom-header">
              <div>
                <h3>Recomendaciones personalizadas</h3>
                <p class="subtitle">Sugerencias visibles para el cliente en su experiencia.</p>
              </div>
              <button class="btn primary" type="button" (click)="abrirModalCrear()">Nueva recomendacion</button>
            </div>

            @if (cargandoRecoms) {
              <p class="loading-text">Cargando recomendaciones...</p>
            } @else if (!items.length) {
              <div class="empty-state">
                <p>Aun no hay recomendaciones personalizadas para este huesped.</p>
                <button class="btn secondary" type="button" (click)="abrirModalCrear()">Crear primera sugerencia</button>
              </div>
            } @else {
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Nombre</th>
                      <th>Descripcion</th>
                      <th>Prioridad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of items; track $index; let i = $index) {
                      <tr>
                        <td><span class="badge" [class]="item.categoria.toLowerCase()">{{ item.categoria }}</span></td>
                        <td><strong>{{ item.nombre }}</strong></td>
                        <td class="td-desc">{{ item.descripcion }}</td>
                        <td><span class="priority-badge" [class]="getPriorityClass(item.prioridad)">{{ getPriorityLabel(item.prioridad) }}</span></td>
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
          <p>Selecciona un huesped para administrar sus recomendaciones e historial.</p>
        </div>
      }

      @if (mostrarModal) {
        <div class="modal-overlay">
          <div class="modal-card card">
            <h3>{{ editIndex !== null ? 'Editar recomendacion' : 'Nueva recomendacion' }}</h3>

            <form [formGroup]="form" (ngSubmit)="guardarRecomendacion()">
              <label>
                Categoria
                <select formControlName="categoria">
                  <option value="Servicio">Servicio</option>
                  <option value="Evento">Evento</option>
                  <option value="Habitacion">Habitacion</option>
                </select>
              </label>

              <label>
                Nombre de la recomendacion
                <input type="text" formControlName="nombre" placeholder="Ej. Spa Premium" />
              </label>

              <label>
                Descripcion explicativa
                <textarea rows="3" formControlName="descripcion" placeholder="Ej. Recomendado por tus busquedas recientes..."></textarea>
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
        --navy-950: #071B2D;
        --navy-900: #0B2540;
        --navy-800: #123456;
        --navy-700: #16395E;
        --gold-500: #C9A227;
        --gold-300: #E3C77E;
        --cream-50: #FBF8F2;
        --white: #FFFFFF;
        --text-900: #0B2540;
        --text-600: #5C6B80;
        --border: #E7EAF0;
        --shadow: 0 18px 40px rgba(11, 37, 64, .08);
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      .recomendaciones-admin { display: grid; gap: 1.35rem; }
      .breadcrumb { font-weight: 700; font-size: .95rem; color: var(--navy-900); }
      .breadcrumb span { color: var(--text-600); margin: 0 .3rem; font-weight: 500; }

      .head,
      .card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 1.35rem;
        box-shadow: var(--shadow);
      }

      .head {
        display: grid;
        gap: .35rem;
      }
      .eyebrow {
        color: var(--gold-500);
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .head h2,
      h3 {
        margin: 0;
        color: var(--navy-900);
        font-family: 'Playfair Display', serif;
      }
      .head h2 { font-size: 1.85rem; line-height: 1.1; }
      .head p,
      .subtitle {
        margin: .35rem 0 0;
        color: var(--text-600);
        font-size: .9rem;
      }

      .filters {
        display: grid;
        gap: 1rem;
      }
      .selector-row {
        display: grid;
        grid-template-columns: 160px minmax(260px, 1fr);
        gap: .8rem;
        align-items: center;
        background: var(--cream-50);
        padding: .85rem 1rem;
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      .selector-row label {
        color: var(--navy-900);
        font-size: .88rem;
        font-weight: 800;
      }
      .selector-row select,
      .modal-card input,
      .modal-card select,
      .modal-card textarea {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: .6rem .75rem;
        background: var(--white);
        color: var(--navy-900);
        font: inherit;
      }

      .workspace-grid {
        display: grid;
        grid-template-columns: minmax(320px, 1fr) minmax(460px, 1.6fr);
        gap: 1.35rem;
      }
      .history-lists { display: grid; gap: 1.3rem; margin-top: 1.1rem; }
      .history-block h4 {
        margin: 0 0 .75rem;
        color: var(--navy-700);
        font-size: .85rem;
        padding-bottom: .45rem;
        border-bottom: 1px solid var(--border);
      }
      .loading-text,
      .empty-list,
      .empty-workspace {
        color: var(--text-600);
      }
      .loading-text { text-align: center; padding: 2rem; font-size: .88rem; }
      .empty-workspace { text-align: center; padding: 4rem 1.5rem; }

      .tag-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
      }
      .tag-list li {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        background: var(--cream-50);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: .3rem .55rem;
        font-size: .76rem;
      }
      .tag-text { color: var(--navy-900); font-weight: 700; }
      .tag-date { color: var(--text-600); font-size: .68rem; }

      .visits-timeline { display: grid; gap: .75rem; }
      .timeline-item {
        display: flex;
        flex-direction: column;
        background: var(--cream-50);
        border-left: 3px solid var(--gold-500);
        border-radius: 0 8px 8px 0;
        padding: .55rem .75rem;
        font-size: .78rem;
      }
      .timeline-date {
        margin-bottom: .15rem;
        color: var(--text-600);
        font-size: .68rem;
        font-weight: 800;
      }
      .timeline-item strong { color: var(--navy-900); }

      .recom-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .btn {
        min-height: 40px;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: .58rem 1.1rem;
        font-size: .84rem;
        font-weight: 800;
        cursor: pointer;
        transition: opacity .15s, transform .15s;
      }
      .btn:hover { opacity: .92; transform: translateY(-1px); }
      .btn.primary {
        background: linear-gradient(135deg, var(--gold-300), var(--gold-500));
        color: var(--navy-950);
      }
      .btn.secondary {
        background: var(--cream-50);
        color: var(--navy-900);
        border-color: var(--border);
      }
      .btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        border: 1px dashed var(--border);
        border-radius: 14px;
        padding: 3rem 1rem;
        color: var(--text-600);
        text-align: center;
      }
      .empty-state p { margin: 0; }

      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; text-align: left; }
      th,
      td {
        padding: .75rem .65rem;
        border-bottom: 1px solid var(--border);
        font-size: .84rem;
      }
      th {
        color: var(--text-600);
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .05em;
        text-transform: uppercase;
      }
      .td-desc {
        max-width: 260px;
        color: var(--text-600);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge,
      .priority-badge {
        display: inline-block;
        border-radius: 7px;
        padding: .22rem .5rem;
        font-size: .7rem;
        font-weight: 900;
        text-transform: uppercase;
      }
      .badge {
        background: rgba(11, 37, 64, .07);
        color: var(--navy-900);
        border: 1px solid rgba(11, 37, 64, .08);
      }
      .badge.servicio { background: rgba(201, 162, 39, .16); color: #6F5200; }
      .badge.evento { background: rgba(11, 37, 64, .08); color: var(--navy-900); }
      .badge.habitacion { background: rgba(122, 46, 46, .10); color: #7A2E2E; }
      .priority-badge.alta { background: #7A2E2E; color: var(--white); }
      .priority-badge.media { background: rgba(201, 162, 39, .22); color: #6F5200; }
      .priority-badge.baja { background: rgba(11, 37, 64, .08); color: var(--navy-900); }

      .row-actions { display: flex; gap: .4rem; }
      .action {
        border: 1px solid var(--border);
        background: var(--cream-50);
        color: var(--navy-900);
        border-radius: 8px;
        padding: .32rem .55rem;
        font-size: .74rem;
        font-weight: 800;
        cursor: pointer;
      }
      .action.danger {
        color: #8A1E18;
        border-color: rgba(179, 38, 30, .25);
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(11, 37, 64, .5);
        padding: 1rem;
        backdrop-filter: blur(4px);
      }
      .modal-card { width: min(100%, 480px); }
      .modal-card form { display: grid; gap: 1rem; margin-top: 1rem; }
      .modal-card label {
        display: grid;
        gap: .35rem;
        color: var(--navy-900);
        font-size: .8rem;
        font-weight: 800;
      }
      .modal-card input,
      .modal-card select,
      .modal-card textarea {
        background: var(--cream-50);
      }
      .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: .5rem;
        margin-top: .5rem;
      }
      .alert {
        border-radius: 10px;
        padding: .6rem .8rem;
        font-size: .8rem;
        font-weight: 700;
      }
      .alert.error {
        background: rgba(179, 38, 30, .10);
        color: #8A1E18;
        border: 1px solid rgba(179, 38, 30, .20);
      }

      @media (max-width: 1080px) {
        .workspace-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 720px) {
        .selector-row { grid-template-columns: 1fr; }
        .recom-header { flex-direction: column; }
        .btn { width: 100%; }
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
      console.error("Error al cargar huespedes:", e);
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
      const data = await firstValueFrom(
        this.api.get<DocumentoRecomendaciones | DocumentoRecomendaciones[]>(`/recomendaciones/huesped/${idHuesped}`)
      );
      const doc = Array.isArray(data) ? data[0] : data;
      this.items = doc?.recomendaciones || [];
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
      this.modalError = "Error al intentar guardar la recomendacion en MongoDB.";
    } finally {
      this.guardando = false;
    }
  }

  async eliminarRecomendacion(idx: number) {
    if (!this.huespedSeleccionado) return;
    const ok = confirm("Deseas eliminar esta recomendacion?");
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
      alert("Error al intentar eliminar la recomendacion.");
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
