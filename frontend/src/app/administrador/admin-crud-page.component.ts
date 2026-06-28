import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "../core/services/api.service";

type FieldType = "text" | "number" | "date" | "select" | "textarea";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

interface ModuleConfig {
  eyebrow: string;
  title: string;
  description: string;
  endpoint: string;
  idKey: string;
  columns: string[];
  fields: FieldDef[];
  allowCreate?: boolean;
  fromRow?: (row: any) => Record<string, any>;
  toPayload?: (form: Record<string, any>) => Record<string, any>;
}

function toDateInput(value: any): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  usuarios: {
    eyebrow: "Gestion de accesos",
    title: "Usuarios",
    description: "Administra cuentas, roles y estado de acceso.",
    endpoint: "/usuarios",
    idKey: "ID_USUARIO",
    columns: ["ID_USUARIO", "USERNAME", "ROL", "ESTADO", "FECHA_CREACION"],
    fields: [
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "text" },
      { key: "id_rol", label: "ID Rol", type: "number", required: true },
      { key: "estado", label: "Estado", type: "select", options: ["A", "I"], required: true }
    ],
    fromRow: (row) => ({
      username: row.USERNAME || "",
      password: "",
      id_rol: row.ID_ROL || "",
      estado: row.ESTADO || "A"
    })
  },
  roles: {
    eyebrow: "Gestion de permisos",
    title: "Roles",
    description: "Administra los perfiles de acceso del sistema.",
    endpoint: "/roles",
    idKey: "ID_ROL",
    columns: ["ID_ROL", "NOMBRE", "DESCRIPCION"],
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripcion", type: "textarea" }
    ],
    fromRow: (row) => ({ nombre: row.NOMBRE || "", descripcion: row.DESCRIPCION || "" })
  },
  reservas: {
    eyebrow: "Operacion hotelera",
    title: "Reservas",
    description: "Consulta y actualiza reservas registradas por clientes.",
    endpoint: "/reservas",
    idKey: "ID_RESERVA",
    allowCreate: false,
    columns: ["ID_RESERVA", "HUESPED", "NUMERO_HABITACION", "FECHA_INGRESO", "FECHA_SALIDA", "ESTADO", "TOTAL"],
    fields: [
      { key: "fecha_ingreso", label: "Fecha ingreso", type: "date", required: true },
      { key: "fecha_salida", label: "Fecha salida", type: "date", required: true },
      { key: "estado", label: "Estado", type: "select", options: ["PENDIENTE", "CONFIRMADA", "FINALIZADA", "CANCELADA"], required: true },
      { key: "id_huesped", label: "ID Huesped", type: "number", required: true },
      { key: "id_habitacion", label: "ID Habitacion", type: "number" },
      { key: "precio_noche", label: "Precio noche", type: "number" },
      { key: "cantidad_noches", label: "Cantidad noches", type: "number" },
      { key: "total", label: "Total", type: "number" }
    ],
    fromRow: (row) => ({
      fecha_ingreso: toDateInput(row.FECHA_INGRESO),
      fecha_salida: toDateInput(row.FECHA_SALIDA),
      estado: String(row.ESTADO || "PENDIENTE").toUpperCase(),
      id_huesped: row.ID_HUESPED || "",
      id_habitacion: row.ID_HABITACION || "",
      precio_noche: row.PRECIO_NOCHE || "",
      cantidad_noches: row.CANTIDAD_NOCHES || "",
      total: row.TOTAL || ""
    })
  },
  eventos: {
    eyebrow: "Actividades del resort",
    title: "Eventos",
    description: "Gestiona eventos y actividades disponibles.",
    endpoint: "/eventos",
    idKey: "ID_EVENTO",
    columns: ["ID_EVENTO", "NOMBRE", "FECHA_EVENTO", "COSTO", "CUPOS", "ESTADO"],
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripcion", type: "textarea" },
      { key: "fecha_evento", label: "Fecha evento", type: "date", required: true },
      { key: "costo", label: "Costo", type: "number", required: true },
      { key: "cupos", label: "Cupos", type: "number" },
      { key: "estado", label: "Estado", type: "select", options: ["A", "I"], required: true }
    ],
    fromRow: (row) => ({
      nombre: row.NOMBRE || "",
      descripcion: row.DESCRIPCION || "",
      fecha_evento: toDateInput(row.FECHA_EVENTO),
      costo: row.COSTO || "",
      cupos: row.CUPOS || "",
      estado: row.ESTADO || "A"
    })
  },
  servicios: {
    eyebrow: "Catalogo operativo",
    title: "Servicios",
    description: "Gestiona servicios disponibles para los huespedes.",
    endpoint: "/servicios",
    idKey: "ID_SERVICIO",
    columns: ["ID_SERVICIO", "NOMBRE", "PRECIO", "ESTADO", "DESCRIPCION"],
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "descripcion", label: "Descripcion", type: "textarea" },
      { key: "precio", label: "Precio", type: "number", required: true },
      { key: "estado", label: "Estado", type: "select", options: ["A", "I"], required: true }
    ],
    fromRow: (row) => ({
      nombre: row.NOMBRE || "",
      descripcion: row.DESCRIPCION || "",
      precio: row.PRECIO || "",
      estado: row.ESTADO || "A"
    })
  },
  facturas: {
    eyebrow: "Facturacion",
    title: "Facturas",
    description: "Consulta y actualiza comprobantes generados por reservas.",
    endpoint: "/facturas",
    idKey: "ID_FACTURA",
    allowCreate: false,
    columns: ["ID_FACTURA", "ID_RESERVA", "FECHA_EMISION", "SUBTOTAL", "IGV", "TOTAL", "ESTADO_PAGO"],
    fields: [
      { key: "id_reserva", label: "ID Reserva", type: "number", required: true },
      { key: "fecha_emision", label: "Fecha emision", type: "date", required: true },
      { key: "subtotal", label: "Subtotal", type: "number" },
      { key: "igv", label: "IGV", type: "number" },
      { key: "total", label: "Total", type: "number", required: true },
      { key: "estado_pago", label: "Estado pago", type: "select", options: ["PENDIENTE", "PAGADO", "ANULADO"], required: true }
    ],
    fromRow: (row) => ({
      id_reserva: row.ID_RESERVA || "",
      fecha_emision: toDateInput(row.FECHA_EMISION),
      subtotal: row.SUBTOTAL || "",
      igv: row.IGV || "",
      total: row.TOTAL || "",
      estado_pago: String(row.ESTADO_PAGO || "PENDIENTE").toUpperCase()
    })
  },
  pagos: {
    eyebrow: "Control financiero",
    title: "Pagos",
    description: "Consulta y actualiza pagos asociados a facturas.",
    endpoint: "/pagos",
    idKey: "ID_PAGO",
    allowCreate: false,
    columns: ["ID_PAGO", "ID_FACTURA", "FECHA_PAGO", "METODO_PAGO", "MONTO"],
    fields: [
      { key: "id_factura", label: "ID Factura", type: "number", required: true },
      { key: "fecha_pago", label: "Fecha pago", type: "date", required: true },
      { key: "metodo_pago", label: "Metodo de pago", type: "text", required: true },
      { key: "monto", label: "Monto", type: "number", required: true }
    ],
    fromRow: (row) => ({
      id_factura: row.ID_FACTURA || "",
      fecha_pago: toDateInput(row.FECHA_PAGO),
      metodo_pago: row.METODO_PAGO || "",
      monto: row.MONTO || ""
    })
  }
};

@Component({
  selector: "app-admin-crud-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="crud-page">
      <div class="breadcrumb">Administrador <span>/</span> {{ config?.title || 'Modulo' }}</div>

      <header class="head">
        <div>
          <span class="eyebrow">{{ config?.eyebrow }}</span>
          <h2>{{ config?.title }}</h2>
          <p>{{ config?.description }}</p>
        </div>
        @if (config?.allowCreate !== false) {
          <button class="btn primary" type="button" (click)="abrirNuevo()">Nuevo registro</button>
        }
      </header>

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }
      @if (message) {
        <div class="alert success">{{ message }}</div>
      }

      @if (!config) {
        <div class="empty-state"><p>Modulo no configurado.</p></div>
      } @else {
        <section class="stats-row">
          <article class="stat-card"><strong>{{ rows.length }}</strong><small>Total registros</small></article>
          <article class="stat-card"><strong>{{ config.columns.length }}</strong><small>Columnas visibles</small></article>
          <article class="stat-card"><strong>{{ config.allowCreate === false ? 'No' : 'Si' }}</strong><small>Creacion manual</small></article>
        </section>

        <article class="card table-card">
          <div class="table-head">
            <h3>Listado</h3>
            <button class="btn ghost" type="button" (click)="cargar()">Actualizar</button>
          </div>

            @if (loading) {
              <div class="empty-state"><p>Cargando registros...</p></div>
            } @else if (rows.length === 0) {
              <div class="empty-state"><p>Sin registros disponibles.</p></div>
            } @else {
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      @for (col of config.columns; track col) {
                        <th>{{ col }}</th>
                      }
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of rows; track row[config.idKey]) {
                      <tr>
                        @for (col of config.columns; track col) {
                          <td>{{ row[col] }}</td>
                        }
                        <td>
                          <div class="row-actions">
                            <button class="icon-action" type="button" (click)="editar(row)">Editar</button>
                            <button class="btn tiny danger" type="button" (click)="eliminar(row)">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
        </article>
      }

      @if (modalOpen && config) {
        <div class="modal-backdrop" (click)="cerrarModal()">
          <article class="modal-card" (click)="$event.stopPropagation()">
            <header class="modal-head">
              <div>
                <span class="eyebrow">{{ editId ? 'Edicion' : 'Nuevo registro' }}</span>
                <h3>{{ editId ? 'Editar ' + config.title.toLowerCase() : 'Crear ' + config.title.toLowerCase() }}</h3>
              </div>
              <button class="modal-close" type="button" (click)="cerrarModal()">×</button>
            </header>

            <form (ngSubmit)="guardar()" class="form-grid">
              @for (field of config.fields; track field.key) {
                <label>
                  {{ field.label }}

                  @if (field.type === 'select') {
                    <select [(ngModel)]="formModel[field.key]" [name]="field.key" [required]="field.required || false">
                      <option [ngValue]="''">Selecciona...</option>
                      @for (opt of field.options || []; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  } @else if (field.type === 'textarea') {
                    <textarea rows="3" [(ngModel)]="formModel[field.key]" [name]="field.key" [required]="field.required || false"></textarea>
                  } @else {
                    <input [type]="field.type" [(ngModel)]="formModel[field.key]" [name]="field.key" [required]="field.required || false" />
                  }
                </label>
              }

              <div class="actions">
                <button class="btn primary" type="submit" [disabled]="saving">{{ saving ? 'Guardando...' : 'Guardar cambios' }}</button>
                <button class="btn ghost" type="button" (click)="cerrarModal()">Cancelar</button>
              </div>
            </form>
          </article>
        </div>
      }
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

      .crud-page { display: grid; gap: 1.1rem; }

      .breadcrumb { font-weight: 700; font-size: .95rem; color: var(--navy-900); }
      .breadcrumb span { color: var(--text-600); margin: 0 .3rem; font-weight: 500; }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 1rem;
        flex-wrap: wrap;
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 1.25rem 1.35rem;
        box-shadow: var(--shadow);
      }

      .eyebrow {
        display: inline-block;
        color: var(--gold-500);
        text-transform: uppercase;
        letter-spacing: .14em;
        font-size: .74rem;
        font-weight: 900;
        margin-bottom: .35rem;
      }

      .head h2 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.85rem; line-height: 1.1; }
      .head p { margin: .35rem 0 0; color: var(--text-600); font-size: .9rem; }

      .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .9rem; }
      .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 18px; padding: 1rem 1.1rem; box-shadow: var(--shadow); }
      .stat-card strong { display: block; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.4rem; line-height: 1; }
      .stat-card small { color: var(--text-600); font-size: .78rem; }

      .card { background: var(--white); border: 1px solid var(--border); border-radius: 20px; padding: 1.25rem 1.35rem; box-shadow: var(--shadow); }
      .table-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
      .table-head h3, .modal-head h3 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.25rem; }

      .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
      .form-grid label:has(textarea) { grid-column: 1 / -1; }

      label {
        display: grid;
        gap: .4rem;
        color: var(--navy-900);
        font-weight: 700;
        font-size: .85rem;
      }

      input, select, textarea {
        width: 100%;
        padding: .65rem .75rem;
        border: 1px solid var(--border);
        border-radius: 12px;
        font: inherit;
        color: var(--text-900);
        background: var(--cream-50);
      }

      .actions { display: flex; gap: .6rem; justify-content: flex-end; grid-column: 1 / -1; margin-top: .3rem; }

      .btn {
        border: none;
        border-radius: 12px;
        padding: .65rem 1rem;
        font-weight: 800;
        font-size: .86rem;
        cursor: pointer;
      }

      .btn.primary { background: linear-gradient(135deg, var(--gold-300), var(--gold-500)); color: var(--navy-950); }
      .btn.ghost { background: var(--cream-50); color: var(--navy-900); border: 1px solid var(--border); }

      .btn.tiny { background: var(--cream-50); color: var(--navy-900); font-size: .78rem; padding: .35rem .55rem; border: 1px solid var(--border); }
      .btn.tiny.danger { background: #fff5f5; color: #b91c1c; border-color: rgba(185,28,28,.35); }

      .alert { margin: 0; padding: .7rem .9rem; border-radius: 12px; font-size: .88rem; font-weight: 650; }
      .alert.success { background: rgba(201,162,39,.14); color: var(--navy-900); border: 1px solid rgba(201,162,39,.35); }
      .alert.error { background: rgba(122,46,46,.1); color: #7A2E2E; border: 1px solid rgba(122,46,46,.25); }

      .table-wrap { overflow-x: auto; }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid var(--border);
        padding: .75rem .6rem;
        font-size: .88rem;
        color: var(--text-900);
      }

      th { color: var(--text-600); font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; font-weight: 800; }
      tbody tr:hover { background: var(--cream-50); }

      .row-actions { display: flex; gap: .4rem; }
      .icon-action { border: 1px solid var(--border); background: var(--cream-50); color: var(--navy-900); border-radius: 10px; padding: .35rem .55rem; cursor: pointer; font-size: .78rem; }

      .empty-state { display: grid; justify-items: center; gap: .6rem; padding: 2rem 0; color: var(--text-600); }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: rgba(6, 26, 46, .58);
        backdrop-filter: blur(4px);
      }

      .modal-card {
        width: min(720px, 100%);
        max-height: min(86vh, 760px);
        overflow: auto;
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 1.25rem;
        box-shadow: 0 26px 70px rgba(6, 26, 46, .28);
      }

      .modal-head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
      .modal-close { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 10px; background: var(--cream-50); color: var(--navy-900); font-size: 1.4rem; line-height: 1; cursor: pointer; }

      @media (max-width: 980px) {
        .stats-row, .form-grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class AdminCrudPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  config: ModuleConfig | null = null;
  rows: any[] = [];
  formModel: Record<string, any> = {};
  loading = false;
  saving = false;
  error = "";
  message = "";
  editId: number | null = null;
  modalOpen = false;

  ngOnInit(): void {
    const moduleKey = this.route.snapshot.routeConfig?.path || "";
    this.config = MODULE_CONFIGS[moduleKey] ?? null;

    if (!this.config) {
      this.error = "No existe configuracion para este modulo.";
      return;
    }

    this.nuevo();
    this.cargar();
  }

  nuevo(): void {
    this.editId = null;
    this.message = "";
    this.error = "";

    if (!this.config) return;

    const model: Record<string, any> = {};
    for (const field of this.config.fields) {
      if (field.type === "select") {
        model[field.key] = field.options?.[0] ?? "";
      } else {
        model[field.key] = "";
      }
    }
    this.formModel = model;
  }

  abrirNuevo(): void {
    if (!this.config || this.config.allowCreate === false) return;
    this.nuevo();
    this.modalOpen = true;
  }

  cerrarModal(): void {
    this.modalOpen = false;
    this.saving = false;
  }

  cargar(): void {
    if (!this.config) return;
    this.loading = true;

    this.api.get<any[]>(this.config.endpoint).subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: () => {
        this.error = "No se pudo cargar el listado.";
        this.loading = false;
      }
    });
  }

  editar(row: any): void {
    if (!this.config) return;

    this.editId = Number(row[this.config.idKey]);
    const mapped = this.config.fromRow ? this.config.fromRow(row) : row;
    this.formModel = { ...mapped };
    this.message = "";
    this.error = "";
    this.modalOpen = true;
  }

  guardar(): void {
    if (!this.config) return;
    if (!this.editId && this.config.allowCreate === false) {
      this.error = "Este modulo no permite creacion manual desde administracion.";
      return;
    }

    for (const field of this.config.fields) {
      if (field.required && !this.formModel[field.key]) {
        this.error = `El campo ${field.label} es obligatorio.`;
        return;
      }
    }

    this.saving = true;
    this.error = "";
    this.message = "";

    const payload = this.config.toPayload ? this.config.toPayload(this.formModel) : this.formModel;
    const request$ = this.editId
      ? this.api.put(`${this.config.endpoint}/${this.editId}`, payload)
      : this.api.post(this.config.endpoint, payload);

    request$.subscribe({
      next: () => {
        this.message = this.editId ? "Registro actualizado." : "Registro creado.";
        this.saving = false;
        this.cerrarModal();
        this.nuevo();
        this.cargar();
      },
      error: () => {
        this.error = "No se pudo guardar el registro.";
        this.saving = false;
      }
    });
  }

  eliminar(row: any): void {
    if (!this.config) return;

    const id = Number(row[this.config.idKey]);
    const ok = confirm(`Eliminar registro ${id}?`);
    if (!ok) return;

    this.error = "";
    this.message = "";

    this.api.delete(`${this.config.endpoint}/${id}`).subscribe({
      next: () => {
        this.message = "Registro eliminado.";
        if (this.editId === id) {
          this.nuevo();
        }
        this.cargar();
      },
      error: () => {
        this.error = "No se pudo eliminar el registro.";
      }
    });
  }
}
