import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiService } from "../../core/services/api.service";

interface RolAdmin {
  ID_ROL: number;
  NOMBRE: string;
  DESCRIPCION?: string | null;
}

@Component({
  selector: "app-roles-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="crud-page">
      <div class="breadcrumb">Administrador <span>/</span> Roles</div>

      <header class="head">
        <div>
          <span class="eyebrow">Gestión de permisos</span>
          <h2>Roles</h2>
          <p>Administra roles del sistema y sus descripciones.</p>
        </div>
        <button class="btn primary" type="button" (click)="nuevo()">Nuevo rol</button>
      </header>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="stats-row">
        <article class="stat-card"><div><strong>{{ total }}</strong><small>Total roles</small></div></article>
      </section>

      <section class="filters card">
        <div class="filters-head">
          <h3>Filtros</h3>
          <button class="btn ghost" type="button" (click)="limpiarFiltros()">Limpiar</button>
        </div>

        <div class="filters-grid">
          <label>
            Buscar
            <input type="text" [value]="filtroTexto" (input)="filtroTexto = $any($event.target).value" placeholder="Nombre o descripción" />
          </label>
        </div>
      </section>

      <div class="grid">
        <article class="card form-card">
          <h3>{{ editando ? 'Editar rol' : 'Crear rol' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
            <label>
              Nombre
              <input type="text" formControlName="nombre" placeholder="Ej: CLIENTE" />
            </label>

            <label>
              Descripción
              <textarea rows="3" formControlName="descripcion" placeholder="Descripción opcional"></textarea>
            </label>

            <div class="actions">
              <button class="btn primary" type="submit" [disabled]="form.invalid || guardando">{{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear') }}</button>
              <button class="btn ghost" type="button" (click)="cancelar()">Cancelar</button>
            </div>
          </form>
        </article>

        <article class="card table-card">
          <h3>Listado</h3>

          @if (cargando) {
            <div class="empty-state"><p>Cargando roles...</p></div>
          } @else if (rolesFiltrados.length === 0) {
            <div class="empty-state"><p>No hay roles que coincidan con el filtro.</p></div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of rolesFiltrados; track r.ID_ROL) {
                    <tr>
                      <td class="muted">#{{ r.ID_ROL }}</td>
                      <td class="strong">{{ r.NOMBRE }}</td>
                      <td>{{ r.DESCRIPCION || '-' }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-action" type="button" (click)="editar(r)">Editar</button>
                          <button class="icon-action danger" type="button" (click)="eliminar(r)">Eliminar</button>
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
    </section>
  `,
  styles: [
    `
      :host {
        --navy-950: #061A2E;
        --navy-900: #0B2540;
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
      * { box-sizing: border-box; }
      .crud-page { display:grid; gap:1.1rem; }
      .breadcrumb { font-weight:700; font-size:.95rem; color:var(--navy-900); }
      .breadcrumb span { color:var(--text-600); margin:0 .3rem; font-weight:500; }
      .head {
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        gap:1rem;
        flex-wrap:wrap;
        background:var(--white);
        border:1px solid var(--border);
        border-radius:20px;
        padding:1.25rem 1.35rem;
        box-shadow:var(--shadow);
      }
      .eyebrow { display:inline-block; color:var(--gold-500); text-transform:uppercase; letter-spacing:.14em; font-size:.74rem; font-weight:900; margin-bottom:.35rem; }
      .head h2 { margin:0; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.85rem; line-height:1.1; }
      .head p { margin:.35rem 0 0; color:var(--text-600); font-size:.9rem; }
      .btn { border:none; border-radius:12px; padding:.65rem 1rem; font-weight:800; font-size:.86rem; cursor:pointer; }
      .btn.primary { background:linear-gradient(135deg, var(--gold-300), var(--gold-500)); color:var(--navy-950); }
      .btn.ghost { background:var(--cream-50); color:var(--navy-900); border:1px solid var(--border); }
      .alert { margin:0; padding:.7rem .9rem; border-radius:12px; font-size:.88rem; font-weight:650; }
      .alert.success { background:rgba(201,162,39,.14); color:var(--navy-900); border:1px solid rgba(201,162,39,.35); }
      .alert.error { background:rgba(122,46,46,.1); color:#7A2E2E; border:1px solid rgba(122,46,46,.25); }
      .stats-row { display:grid; grid-template-columns:repeat(1,1fr); gap:.9rem; }
      .stat-card { background:var(--white); border:1px solid var(--border); border-radius:18px; padding:1rem 1.1rem; box-shadow:var(--shadow); max-width:260px; }
      .stat-card strong { display:block; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.4rem; line-height:1; }
      .stat-card small { color:var(--text-600); font-size:.78rem; }
      .filters { display:grid; gap:.8rem; }
      .filters-head { display:flex; justify-content:space-between; align-items:center; }
      .filters-head h3 { margin:0; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.2rem; }
      .filters-grid { display:grid; grid-template-columns:1fr; gap:.8rem; max-width:420px; }
      .grid { display:grid; grid-template-columns:minmax(300px,380px) 1fr; gap:1.1rem; align-items:start; }
      .card { background:var(--white); border:1px solid var(--border); border-radius:20px; padding:1.25rem 1.35rem; box-shadow:var(--shadow); }
      .card h3 { margin:0 0 1rem; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.25rem; }
      .form-grid { display:grid; gap:.9rem; }
      label { display:grid; gap:.4rem; color:var(--navy-900); font-weight:700; font-size:.85rem; }
      input, textarea { width:100%; padding:.65rem .75rem; border:1px solid var(--border); border-radius:12px; font:inherit; color:var(--text-900); background:var(--cream-50); }
      textarea { resize:vertical; }
      .actions { display:flex; gap:.6rem; margin-top:.3rem; }
      .table-wrap { overflow-x:auto; }
      table { width:100%; border-collapse:collapse; min-width:640px; }
      th, td { text-align:left; border-bottom:1px solid var(--border); padding:.75rem .6rem; font-size:.88rem; color:var(--text-900); }
      th { color:var(--text-600); font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; font-weight:800; }
      tbody tr:hover { background:var(--cream-50); }
      td.muted { color:var(--text-600); }
      td.strong { font-weight:800; color:var(--navy-900); }
      .row-actions { display:flex; gap:.4rem; }
      .icon-action { border:1px solid var(--border); background:var(--cream-50); color:var(--navy-900); border-radius:10px; padding:.35rem .55rem; cursor:pointer; font-size:.78rem; }
      .icon-action.danger { color:#b91c1c; border-color:rgba(185,28,28,.35); }
      .empty-state { display:grid; justify-items:center; gap:.6rem; padding:2rem 0; color:var(--text-600); }
      @media (max-width:980px) { .grid { grid-template-columns:1fr; } }
    `
  ]
})
export class RolesAdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  roles: RolAdmin[] = [];
  cargando = false;
  guardando = false;
  editando = false;
  idEditando: number | null = null;
  mensaje = "";
  error = "";
  filtroTexto = "";

  readonly form = this.fb.group({
    nombre: ["", [Validators.required]],
    descripcion: [""]
  });

  ngOnInit(): void { this.cargar(); }

  get total(): number { return this.roles.length; }

  get rolesFiltrados(): RolAdmin[] {
    const txt = this.filtroTexto.trim().toLowerCase();
    return this.roles.filter((r) => !txt || r.NOMBRE.toLowerCase().includes(txt) || String(r.DESCRIPCION || "").toLowerCase().includes(txt));
  }

  limpiarFiltros(): void { this.filtroTexto = ""; }

  cargar(): void {
    this.cargando = true;
    this.error = "";
    this.api.get<RolAdmin[]>("/roles").subscribe({
      next: (rows) => { this.roles = rows; this.cargando = false; },
      error: () => { this.error = "No se pudo cargar el listado de roles."; this.cargando = false; }
    });
  }

  nuevo(): void {
    this.editando = false;
    this.idEditando = null;
    this.form.reset({ nombre: "", descripcion: "" });
    this.mensaje = "";
    this.error = "";
  }

  editar(r: RolAdmin): void {
    this.editando = true;
    this.idEditando = r.ID_ROL;
    this.form.patchValue({ nombre: r.NOMBRE, descripcion: r.DESCRIPCION || "" });
    this.mensaje = "";
    this.error = "";
  }

  cancelar(): void { this.nuevo(); }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.error = "";
    this.mensaje = "";

    const body = this.form.getRawValue();
    const payload = { nombre: body.nombre, descripcion: body.descripcion || null };

    const request$ = this.editando && this.idEditando
      ? this.api.put(`/roles/${this.idEditando}`, payload)
      : this.api.post("/roles", payload);

    request$.subscribe({
      next: () => {
        this.mensaje = this.editando ? "Rol actualizado." : "Rol creado.";
        this.guardando = false;
        this.nuevo();
        this.cargar();
      },
      error: () => {
        this.error = this.editando ? "No se pudo actualizar el rol." : "No se pudo crear el rol.";
        this.guardando = false;
      }
    });
  }

  eliminar(r: RolAdmin): void {
    const ok = confirm(`¿Eliminar rol ${r.NOMBRE}?`);
    if (!ok) return;

    this.error = "";
    this.mensaje = "";

    this.api.delete(`/roles/${r.ID_ROL}`).subscribe({
      next: () => {
        this.mensaje = "Rol eliminado.";
        if (this.idEditando === r.ID_ROL) this.nuevo();
        this.cargar();
      },
      error: () => { this.error = "No se pudo eliminar el rol."; }
    });
  }
}
