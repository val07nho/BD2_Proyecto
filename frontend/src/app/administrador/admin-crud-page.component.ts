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
  title: string;
  description: string;
  endpoint: string;
  idKey: string;
  columns: string[];
  fields: FieldDef[];
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
    title: "Usuarios",
    description: "CRUD de usuarios y asignacion de rol.",
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
    title: "Roles",
    description: "CRUD de roles del sistema.",
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
    title: "Reservas",
    description: "CRUD de reservas.",
    endpoint: "/reservas",
    idKey: "ID_RESERVA",
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
    title: "Eventos",
    description: "CRUD de eventos.",
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
    title: "Servicios",
    description: "CRUD de servicios.",
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
    title: "Facturas",
    description: "CRUD de facturas.",
    endpoint: "/facturas",
    idKey: "ID_FACTURA",
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
    title: "Pagos",
    description: "CRUD de pagos.",
    endpoint: "/pagos",
    idKey: "ID_PAGO",
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
      <header class="head">
        <div>
          <h2>{{ config?.title }}</h2>
          <p>{{ config?.description }}</p>
        </div>
        <button class="btn primary" type="button" (click)="nuevo()">Nuevo</button>
      </header>

      @if (error) {
        <p class="error">{{ error }}</p>
      }
      @if (message) {
        <p class="message">{{ message }}</p>
      }

      @if (!config) {
        <p>Modulo no configurado.</p>
      } @else {
        <div class="grid">
          <article class="card form-card">
            <h3>{{ editId ? 'Editar' : 'Crear' }} {{ config.title.toLowerCase() }}</h3>
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
                    <input
                      [type]="field.type"
                      [(ngModel)]="formModel[field.key]"
                      [name]="field.key"
                      [required]="field.required || false"
                    />
                  }
                </label>
              }

              <div class="actions">
                <button class="btn primary" type="submit" [disabled]="saving">{{ saving ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear') }}</button>
                <button class="btn ghost" type="button" (click)="nuevo()">Cancelar</button>
              </div>
            </form>
          </article>

          <article class="card table-card">
            <h3>Listado</h3>
            @if (loading) {
              <p>Cargando...</p>
            } @else if (rows.length === 0) {
              <p>Sin registros.</p>
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
                            <button class="btn tiny" type="button" (click)="editar(row)">Editar</button>
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
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .crud-page {
        display: grid;
        gap: 1rem;
      }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .head h2 {
        margin: 0;
        color: #0b2540;
      }

      .head p {
        margin: 0.25rem 0 0;
        color: #5c6b80;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(280px, 360px) 1fr;
        gap: 1rem;
      }

      .card {
        background: #fff;
        border: 1px solid #e7eaf0;
        border-radius: 16px;
        padding: 1rem;
      }

      .form-grid {
        display: grid;
        gap: 0.7rem;
      }

      label {
        display: grid;
        gap: 0.35rem;
        color: #0b2540;
        font-weight: 600;
        font-size: 0.88rem;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 0.6rem 0.7rem;
        border: 1px solid #d7dce6;
        border-radius: 10px;
        font: inherit;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn {
        border: none;
        border-radius: 10px;
        padding: 0.55rem 0.85rem;
        font-weight: 700;
        cursor: pointer;
      }

      .btn.primary {
        background: #c9a227;
        color: #0b2540;
      }

      .btn.ghost {
        background: #eef2f7;
        color: #1f2937;
      }

      .btn.tiny {
        background: #e9eff8;
        color: #0b2540;
        font-size: 0.78rem;
        padding: 0.35rem 0.55rem;
      }

      .btn.tiny.danger {
        background: #fee2e2;
        color: #991b1b;
      }

      .error,
      .message {
        margin: 0;
        padding: 0.6rem 0.8rem;
        border-radius: 10px;
      }

      .error {
        background: #fef2f2;
        color: #b91c1c;
      }

      .message {
        background: #ecfdf3;
        color: #166534;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid #eceff4;
        padding: 0.55rem 0.45rem;
      }

      th {
        font-size: 0.82rem;
        color: #0b2540;
      }

      .row-actions {
        display: flex;
        gap: 0.35rem;
      }

      @media (max-width: 980px) {
        .grid {
          grid-template-columns: 1fr;
        }
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
  }

  guardar(): void {
    if (!this.config) return;

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
