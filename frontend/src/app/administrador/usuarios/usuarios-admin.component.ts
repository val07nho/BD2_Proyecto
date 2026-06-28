import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiService } from "../../core/services/api.service";

interface UsuarioAdmin {
  ID_USUARIO: number;
  USERNAME: string;
  ID_ROL: number;
  ROL: string;
  ESTADO: "A" | "I";
  FECHA_CREACION?: string;
}

interface RolOption {
  ID_ROL: number;
  NOMBRE: string;
}

@Component({
  selector: "app-usuarios-admin",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="crud-page">
      <div class="breadcrumb">Administrador <span>/</span> Usuarios</div>

      <header class="head">
        <div>
          <span class="eyebrow">Gestión de accesos</span>
          <h2>Usuarios</h2>
          <p>Administra cuentas, rol y estado de acceso.</p>
        </div>
        <button class="btn primary" type="button" (click)="nuevo()">Nuevo usuario</button>
      </header>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="stats-row">
        <article class="stat-card"><div><strong>{{ total }}</strong><small>Total usuarios</small></div></article>
        <article class="stat-card"><div><strong>{{ activos }}</strong><small>Activos</small></div></article>
        <article class="stat-card"><div><strong>{{ inactivos }}</strong><small>Inactivos</small></div></article>
      </section>

      <section class="filters card">
        <div class="filters-head">
          <h3>Filtros</h3>
          <button class="btn ghost" type="button" (click)="limpiarFiltros()">Limpiar</button>
        </div>

        <div class="filters-grid">
          <label>
            Buscar
            <input type="text" [value]="filtroTexto" (input)="filtroTexto = $any($event.target).value" placeholder="Username o rol" />
          </label>

          <label>
            Rol
            <select [value]="filtroRol" (change)="filtroRol = $any($event.target).value">
              <option value="">Todos</option>
              @for (r of roles; track r.ID_ROL) {
                <option [value]="r.NOMBRE">{{ r.NOMBRE }}</option>
              }
            </select>
          </label>

          <label>
            Estado
            <select [value]="filtroEstado" (change)="filtroEstado = $any($event.target).value">
              <option value="">Todos</option>
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </label>
        </div>
      </section>

      <div class="grid">
        <article class="card form-card">
          <h3>{{ editando ? 'Editar usuario' : 'Crear usuario' }}</h3>
          <form [formGroup]="form" (ngSubmit)="guardar()" class="form-grid">
            <label>
              Username
              <input type="text" formControlName="username" placeholder="usuario@correo.com" />
            </label>

            <label>
              Contraseña {{ editando ? '(opcional)' : '' }}
              <input type="text" formControlName="password" placeholder="••••••" />
            </label>

            <label>
              Rol
              <select formControlName="id_rol">
                <option [ngValue]="null">Selecciona...</option>
                @for (r of roles; track r.ID_ROL) {
                  <option [ngValue]="r.ID_ROL">{{ r.NOMBRE }} (#{{ r.ID_ROL }})</option>
                }
              </select>
            </label>

            <label>
              Estado
              <select formControlName="estado">
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
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
            <div class="empty-state"><p>Cargando usuarios...</p></div>
          } @else if (usuariosFiltrados.length === 0) {
            <div class="empty-state"><p>No hay usuarios que coincidan con el filtro.</p></div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of usuariosFiltrados; track u.ID_USUARIO) {
                    <tr>
                      <td class="muted">#{{ u.ID_USUARIO }}</td>
                      <td class="strong">{{ u.USERNAME }}</td>
                      <td>{{ u.ROL }}</td>
                      <td><span class="status-badge" [class]="u.ESTADO === 'A' ? 'disponible' : 'mantenimiento'">{{ u.ESTADO === 'A' ? 'Activo' : 'Inactivo' }}</span></td>
                      <td>{{ u.FECHA_CREACION | date:'yyyy-MM-dd' }}</td>
                      <td>
                        <div class="row-actions">
                          <button class="icon-action" type="button" (click)="editar(u)">Editar</button>
                          <button class="icon-action danger" type="button" (click)="eliminar(u)">Eliminar</button>
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
      .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:.9rem; }
      .stat-card { background:var(--white); border:1px solid var(--border); border-radius:18px; padding:1rem 1.1rem; box-shadow:var(--shadow); }
      .stat-card strong { display:block; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.4rem; line-height:1; }
      .stat-card small { color:var(--text-600); font-size:.78rem; }
      .filters { display:grid; gap:.8rem; }
      .filters-head { display:flex; justify-content:space-between; align-items:center; }
      .filters-head h3 { margin:0; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.2rem; }
      .filters-grid { display:grid; grid-template-columns:1.6fr 1fr 1fr; gap:.8rem; }
      .grid { display:grid; grid-template-columns:minmax(300px,380px) 1fr; gap:1.1rem; align-items:start; }
      .card { background:var(--white); border:1px solid var(--border); border-radius:20px; padding:1.25rem 1.35rem; box-shadow:var(--shadow); }
      .card h3 { margin:0 0 1rem; color:var(--navy-900); font-family:'Playfair Display', serif; font-size:1.25rem; }
      .form-grid { display:grid; gap:.9rem; }
      label { display:grid; gap:.4rem; color:var(--navy-900); font-weight:700; font-size:.85rem; }
      input, select { width:100%; padding:.65rem .75rem; border:1px solid var(--border); border-radius:12px; font:inherit; color:var(--text-900); background:var(--cream-50); }
      .actions { display:flex; gap:.6rem; margin-top:.3rem; }
      .table-wrap { overflow-x:auto; }
      table { width:100%; border-collapse:collapse; min-width:720px; }
      th, td { text-align:left; border-bottom:1px solid var(--border); padding:.75rem .6rem; font-size:.88rem; color:var(--text-900); }
      th { color:var(--text-600); font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; font-weight:800; }
      tbody tr:hover { background:var(--cream-50); }
      td.muted { color:var(--text-600); }
      td.strong { font-weight:800; color:var(--navy-900); }
      .status-badge { display:inline-flex; align-items:center; padding:.3rem .65rem; border-radius:999px; font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.03em; }
      .status-badge.disponible { background:var(--navy-900); color:var(--white); }
      .status-badge.mantenimiento { background:#7A2E2E; color:var(--white); }
      .row-actions { display:flex; gap:.4rem; }
      .icon-action { border:1px solid var(--border); background:var(--cream-50); color:var(--navy-900); border-radius:10px; padding:.35rem .55rem; cursor:pointer; font-size:.78rem; }
      .icon-action.danger { color:#b91c1c; border-color:rgba(185,28,28,.35); }
      .empty-state { display:grid; justify-items:center; gap:.6rem; padding:2rem 0; color:var(--text-600); }
      @media (max-width:1100px) { .stats-row { grid-template-columns:1fr; } }
      @media (max-width:980px) { .filters-grid,.grid { grid-template-columns:1fr; } }
    `
  ]
})
export class UsuariosAdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  usuarios: UsuarioAdmin[] = [];
  roles: RolOption[] = [];
  cargando = false;
  guardando = false;
  editando = false;
  idEditando: number | null = null;
  mensaje = "";
  error = "";
  filtroTexto = "";
  filtroRol = "";
  filtroEstado = "";

  readonly form = this.fb.group({
    username: ["", [Validators.required]],
    password: [""],
    id_rol: [null as number | null, [Validators.required]],
    estado: ["A", [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarRoles();
    this.cargar();
  }

  get total(): number { return this.usuarios.length; }
  get activos(): number { return this.usuarios.filter((u) => u.ESTADO === "A").length; }
  get inactivos(): number { return this.usuarios.filter((u) => u.ESTADO === "I").length; }

  get usuariosFiltrados(): UsuarioAdmin[] {
    const txt = this.filtroTexto.trim().toLowerCase();
    return this.usuarios.filter((u) => {
      const mText = !txt || u.USERNAME.toLowerCase().includes(txt) || String(u.ROL || "").toLowerCase().includes(txt);
      const mRol = !this.filtroRol || (u.ROL || "").toUpperCase() === this.filtroRol.toUpperCase();
      const mEstado = !this.filtroEstado || u.ESTADO === this.filtroEstado;
      return mText && mRol && mEstado;
    });
  }

  limpiarFiltros(): void {
    this.filtroTexto = "";
    this.filtroRol = "";
    this.filtroEstado = "";
  }

  cargarRoles(): void {
    this.api.get<RolOption[]>("/roles").subscribe({
      next: (rows) => { this.roles = rows; },
      error: () => { this.error = "No se pudieron cargar los roles para el formulario."; }
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = "";
    this.api.get<UsuarioAdmin[]>("/usuarios").subscribe({
      next: (rows) => { this.usuarios = rows; this.cargando = false; },
      error: () => { this.error = "No se pudo cargar el listado de usuarios."; this.cargando = false; }
    });
  }

  nuevo(): void {
    this.editando = false;
    this.idEditando = null;
    this.form.reset({ username: "", password: "", id_rol: null, estado: "A" });
    this.mensaje = "";
    this.error = "";
  }

  editar(u: UsuarioAdmin): void {
    this.editando = true;
    this.idEditando = u.ID_USUARIO;
    this.form.patchValue({ username: u.USERNAME, password: "", id_rol: u.ID_ROL, estado: u.ESTADO });
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
    const payload: any = {
      username: body.username,
      id_rol: Number(body.id_rol),
      estado: body.estado || "A"
    };

    if (body.password) payload.password = body.password;

    const request$ = this.editando && this.idEditando
      ? this.api.put(`/usuarios/${this.idEditando}`, payload)
      : this.api.post("/usuarios", { ...payload, password: body.password || "123456" });

    request$.subscribe({
      next: () => {
        this.mensaje = this.editando ? "Usuario actualizado." : "Usuario creado.";
        this.guardando = false;
        this.nuevo();
        this.cargar();
      },
      error: () => {
        this.error = this.editando ? "No se pudo actualizar el usuario." : "No se pudo crear el usuario.";
        this.guardando = false;
      }
    });
  }

  eliminar(u: UsuarioAdmin): void {
    const ok = confirm(`¿Eliminar usuario ${u.USERNAME}?`);
    if (!ok) return;

    this.error = "";
    this.mensaje = "";

    this.api.delete(`/usuarios/${u.ID_USUARIO}`).subscribe({
      next: () => {
        this.mensaje = "Usuario eliminado.";
        if (this.idEditando === u.ID_USUARIO) this.nuevo();
        this.cargar();
      },
      error: () => { this.error = "No se pudo eliminar el usuario."; }
    });
  }
}
