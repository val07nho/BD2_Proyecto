import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { forkJoin } from "rxjs";

import { ApiService } from "../core/services/api.service";

type VistaGerente = "dashboard" | "ocupacion" | "ingresos" | "facturacion" | "encuestas" | "preferencias" | "reportes";

interface Habitacion {
  ID_HABITACION: number;
  NUMERO_HABITACION?: string;
  TIPO?: string;
  PRECIO_NOCHE?: number;
  CAPACIDAD?: number;
  ESTADO?: string;
}

interface Reserva {
  ID_RESERVA: number;
  HUESPED?: string;
  NUMERO_HABITACION?: string;
  FECHA_INGRESO?: string;
  FECHA_SALIDA?: string;
  ESTADO?: string;
  TOTAL?: number;
}

interface Factura {
  ID_FACTURA: number;
  ID_RESERVA?: number;
  FECHA_EMISION?: string;
  SUBTOTAL?: number;
  IGV?: number;
  TOTAL?: number;
  ESTADO_PAGO?: string;
}

interface Pago {
  ID_PAGO: number;
  ID_FACTURA?: number;
  METODO_PAGO?: string;
  MONTO?: number;
  FECHA_PAGO?: string;
}

interface PerfilCliente {
  idHuesped: number;
  preferencias?: {
    tipoHabitacion?: string;
    vista?: string;
    tipoCama?: string;
    dieta?: string[];
    serviciosFavoritos?: string[];
  };
  idiomas?: string[];
}

interface EncuestaStats {
  totalEncuestas: number;
  promedioSatisfaccion: number;
  distribucion: Array<{ _id: number; total: number }>;
  comentariosRecientes: Array<{ idHuesped: number; comentario: string; fecha?: string; calificacion?: number; calificacionGeneral?: number }>;
}

@Component({
  selector: "app-reportes-gerente",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="manager-page">
      <header class="page-head">
        <div>
          <p class="eyebrow">{{ area }}</p>
          <h2>{{ titulo }}</h2>
          <span class="title-line"></span>
        </div>
        <button class="refresh-btn" type="button" (click)="cargarDatos()" [disabled]="cargando">
          {{ cargando ? "Actualizando..." : "Actualizar" }}
        </button>
      </header>

      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      @if (cargando) {
        <div class="loading">Cargando indicadores...</div>
      } @else {
        @if (vista === "dashboard" || vista === "reportes") {
          <div class="kpi-grid">
            <article class="metric">
              <span>Ocupacion</span>
              <strong>{{ ocupacionPorcentaje }}%</strong>
              <small>{{ habitacionesOcupadas }} de {{ habitaciones.length }} habitaciones</small>
            </article>
            <article class="metric">
              <span>Ingresos pagados</span>
              <strong>{{ moneda(totalPagado) }}</strong>
              <small>{{ pagos.length }} pagos registrados</small>
            </article>
            <article class="metric">
              <span>Facturacion total</span>
              <strong>{{ moneda(totalFacturado) }}</strong>
              <small>{{ facturasPendientes }} facturas pendientes</small>
            </article>
            <article class="metric">
              <span>Satisfaccion</span>
              <strong>{{ encuestaStats.promedioSatisfaccion || 0 }}/5</strong>
              <small>{{ encuestaStats.totalEncuestas || 0 }} encuestas</small>
            </article>
          </div>

          <div class="two-columns">
            <section class="panel">
              <h3>Reservas recientes</h3>
              <div class="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Huesped</th><th>Habitacion</th><th>Estado</th><th>Total</th></tr></thead>
                  <tbody>
                    @for (reserva of reservas.slice(0, 8); track reserva.ID_RESERVA) {
                      <tr>
                        <td>{{ reserva.ID_RESERVA }}</td>
                        <td>{{ reserva.HUESPED || "-" }}</td>
                        <td>{{ reserva.NUMERO_HABITACION || "-" }}</td>
                        <td><span class="status">{{ reserva.ESTADO || "-" }}</span></td>
                        <td>{{ moneda(reserva.TOTAL) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>

            <section class="panel">
              <h3>Alertas operativas</h3>
              <div class="alert-list">
                <div><strong>{{ habitacionesMantenimiento }}</strong><span>habitaciones en mantenimiento</span></div>
                <div><strong>{{ reservasPendientes }}</strong><span>reservas pendientes</span></div>
                <div><strong>{{ facturasPendientes }}</strong><span>facturas por cobrar</span></div>
                <div><strong>{{ perfiles.length }}</strong><span>perfiles con preferencias</span></div>
              </div>
            </section>
          </div>
        }

        @if (vista === "ocupacion") {
          <section class="panel">
            <h3>Estado de habitaciones</h3>
            <div class="bar-list">
              @for (item of ocupacionPorEstado; track item.label) {
                <div class="bar-row">
                  <span>{{ item.label }}</span>
                  <div class="bar-track"><div class="bar-fill" [style.width.%]="item.porcentaje"></div></div>
                  <strong>{{ item.total }}</strong>
                </div>
              }
            </div>
          </section>

          <section class="panel">
            <h3>Habitaciones por tipo</h3>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Tipo</th><th>Cantidad</th><th>Tarifa promedio</th></tr></thead>
                <tbody>
                  @for (item of habitacionesPorTipo; track item.tipo) {
                    <tr><td>{{ item.tipo }}</td><td>{{ item.total }}</td><td>{{ moneda(item.promedio) }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (vista === "ingresos" || vista === "facturacion") {
          <div class="kpi-grid compact">
            <article class="metric"><span>Total facturado</span><strong>{{ moneda(totalFacturado) }}</strong></article>
            <article class="metric"><span>Total pagado</span><strong>{{ moneda(totalPagado) }}</strong></article>
            <article class="metric"><span>Pendiente de cobro</span><strong>{{ moneda(totalPendiente) }}</strong></article>
          </div>

          <section class="panel">
            <h3>Facturas por estado</h3>
            <div class="bar-list">
              @for (item of facturasPorEstado; track item.label) {
                <div class="bar-row">
                  <span>{{ item.label }}</span>
                  <div class="bar-track"><div class="bar-fill" [style.width.%]="item.porcentaje"></div></div>
                  <strong>{{ item.total }}</strong>
                </div>
              }
            </div>
          </section>

          <section class="panel">
            <h3>Ultimas facturas</h3>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Factura</th><th>Reserva</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
                <tbody>
                  @for (factura of facturas.slice(0, 10); track factura.ID_FACTURA) {
                    <tr>
                      <td>{{ factura.ID_FACTURA }}</td>
                      <td>{{ factura.ID_RESERVA || "-" }}</td>
                      <td><span class="status">{{ factura.ESTADO_PAGO || "-" }}</span></td>
                      <td>{{ moneda(factura.TOTAL) }}</td>
                      <td>{{ fecha(factura.FECHA_EMISION) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (vista === "encuestas") {
          <div class="kpi-grid compact">
            <article class="metric"><span>Encuestas</span><strong>{{ encuestaStats.totalEncuestas || 0 }}</strong></article>
            <article class="metric"><span>Promedio</span><strong>{{ encuestaStats.promedioSatisfaccion || 0 }}/5</strong></article>
          </div>

          <section class="panel">
            <h3>Distribucion de calificaciones</h3>
            <div class="bar-list">
              @for (item of distribucionEncuestas; track item.label) {
                <div class="bar-row">
                  <span>{{ item.label }}</span>
                  <div class="bar-track"><div class="bar-fill" [style.width.%]="item.porcentaje"></div></div>
                  <strong>{{ item.total }}</strong>
                </div>
              }
            </div>
          </section>

          <section class="panel">
            <h3>Comentarios recientes</h3>
            <div class="comment-list">
              @for (comentario of encuestaStats.comentariosRecientes || []; track comentario.idHuesped + comentario.comentario) {
                <article>
                  <strong>Huesped {{ comentario.idHuesped }} · {{ comentario.calificacionGeneral || comentario.calificacion || "-" }}/5</strong>
                  <p>{{ comentario.comentario }}</p>
                </article>
              }
            </div>
          </section>
        }

        @if (vista === "preferencias") {
          <div class="kpi-grid compact">
            <article class="metric"><span>Perfiles</span><strong>{{ perfiles.length }}</strong></article>
            <article class="metric"><span>Tipo favorito</span><strong>{{ topTipoHabitacion }}</strong></article>
            <article class="metric"><span>Vista favorita</span><strong>{{ topVista }}</strong></article>
          </div>

          <section class="panel">
            <h3>Preferencias de habitacion</h3>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Preferencia</th><th>Top</th><th>Registros</th></tr></thead>
                <tbody>
                  <tr><td>Tipo de habitacion</td><td>{{ topTipoHabitacion }}</td><td>{{ conteoPreferencias("tipoHabitacion").length }}</td></tr>
                  <tr><td>Vista</td><td>{{ topVista }}</td><td>{{ conteoPreferencias("vista").length }}</td></tr>
                  <tr><td>Tipo de cama</td><td>{{ topTipoCama }}</td><td>{{ conteoPreferencias("tipoCama").length }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="panel">
            <h3>Servicios favoritos</h3>
            <div class="tag-list">
              @for (item of serviciosFavoritos; track item.label) {
                <span>{{ item.label }} · {{ item.total }}</span>
              }
            </div>
          </section>
        }
      }
    </section>
  `,
  styles: [`
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
      color: var(--text-900);
    }

    * { box-sizing: border-box; }

    .manager-page { display: grid; gap: 1rem; }

    .page-head {
      min-height: 150px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      border-radius: 16px;
      padding: 1.4rem;
      background:
        linear-gradient(135deg, rgba(6, 26, 46, .92), rgba(11, 37, 64, .82)),
        url("https://picsum.photos/seed/aurea-manager/1200/420") center/cover;
      color: var(--white);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .eyebrow {
      margin: 0 0 .3rem;
      color: var(--gold-300);
      font-weight: 900;
      text-transform: uppercase;
      font-size: .72rem;
      letter-spacing: .18em;
    }

    h2 {
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.7rem, 3vw, 2.35rem);
      line-height: 1.05;
      color: inherit;
    }

    h3 {
      margin: 0 0 .8rem;
      font-family: 'Playfair Display', Georgia, serif;
      color: var(--navy-900);
      font-size: 1.25rem;
    }

    p { margin-top: 0; }

    .title-line {
      display: block;
      width: 58px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--gold-300), var(--gold-500));
      margin-top: .65rem;
    }

    .refresh-btn {
      border: 1px solid rgba(255,255,255,.26);
      background: rgba(255,255,255,.12);
      color: var(--white);
      border-radius: 10px;
      padding: .65rem .95rem;
      font-weight: 900;
      cursor: pointer;
      backdrop-filter: blur(6px);
    }

    .refresh-btn:disabled { opacity: .65; cursor: default; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
    .kpi-grid.compact { grid-template-columns: repeat(3, minmax(0, 1fr)); }

    .metric, .panel {
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--white);
      box-shadow: 0 12px 30px rgba(11, 37, 64, .06);
    }

    .metric {
      position: relative;
      overflow: hidden;
      padding: 1rem;
      display: grid;
      gap: .25rem;
    }

    .metric::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: linear-gradient(180deg, var(--gold-300), var(--gold-500));
    }

    .metric span, .metric small { color: var(--text-600); }
    .metric span { font-weight: 800; font-size: .82rem; }
    .metric strong { font-size: 1.55rem; color: var(--navy-900); font-family: 'Playfair Display', Georgia, serif; }
    .two-columns { display: grid; grid-template-columns: 1.4fr .8fr; gap: .75rem; }
    .panel { padding: 1rem; }
    .loading, .alert { border-radius: 10px; padding: .8rem 1rem; background: #F7F0DF; color: var(--navy-900); border: 1px solid rgba(201, 162, 39, .22); }
    .alert.error { background: #fef2f2; color: #991b1b; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 620px; }
    th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: .55rem; }
    th { color: var(--navy-900); font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; }
    td { color: #344054; }
    .status { display: inline-block; border: 1px solid #E7D7A2; border-radius: 999px; padding: .15rem .45rem; font-size: .78rem; background: #FFFAEB; color: var(--navy-900); font-weight: 800; }
    .alert-list { display: grid; gap: .7rem; }
    .alert-list div { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: .55rem; }
    .alert-list strong { color: var(--navy-900); font-family: 'Playfair Display', Georgia, serif; font-size: 1.2rem; }
    .alert-list span { color: var(--text-600); font-weight: 700; }
    .bar-list { display: grid; gap: .7rem; }
    .bar-row { display: grid; grid-template-columns: 140px 1fr 48px; align-items: center; gap: .7rem; }
    .bar-row span { color: var(--text-600); font-weight: 800; }
    .bar-row strong { color: var(--navy-900); }
    .bar-track { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold-300), var(--gold-500)); border-radius: 999px; }
    .comment-list { display: grid; gap: .75rem; }
    .comment-list article { border-bottom: 1px solid #e5e7eb; padding-bottom: .65rem; }
    .comment-list strong { color: var(--navy-900); }
    .comment-list p { margin: .25rem 0 0; color: var(--text-600); }
    .tag-list { display: flex; flex-wrap: wrap; gap: .5rem; }
    .tag-list span { border: 1px solid #E7D7A2; border-radius: 999px; padding: .35rem .6rem; background: #FFFAEB; color: var(--navy-900); font-weight: 800; }
    @media (max-width: 900px) {
      .kpi-grid, .kpi-grid.compact, .two-columns { grid-template-columns: 1fr; }
      .page-head { align-items: flex-start; flex-direction: column; }
      .bar-row { grid-template-columns: 110px 1fr 40px; }
    }
  `]
})
export class ReportesGerenteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  vista: VistaGerente = "dashboard";
  titulo = "Dashboard gerencial";
  area = "Gerencia";
  cargando = true;
  error = "";

  habitaciones: Habitacion[] = [];
  reservas: Reserva[] = [];
  facturas: Factura[] = [];
  pagos: Pago[] = [];
  perfiles: PerfilCliente[] = [];
  encuestaStats: EncuestaStats = { totalEncuestas: 0, promedioSatisfaccion: 0, distribucion: [], comentariosRecientes: [] };

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.vista = (data["vista"] || "dashboard") as VistaGerente;
      this.titulo = data["title"] || "Dashboard gerencial";
      this.area = data["area"] || "Gerencia";
    });
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = "";

    forkJoin({
      habitaciones: this.api.get<Habitacion[]>("/habitaciones"),
      reservas: this.api.get<Reserva[]>("/reservas"),
      facturas: this.api.get<Factura[]>("/facturas"),
      pagos: this.api.get<Pago[]>("/pagos"),
      perfiles: this.api.get<PerfilCliente[]>("/perfiles-cliente"),
      encuestaStats: this.api.get<EncuestaStats>("/encuestas/stats")
    }).subscribe({
      next: (data) => {
        this.habitaciones = data.habitaciones || [];
        this.reservas = data.reservas || [];
        this.facturas = data.facturas || [];
        this.pagos = data.pagos || [];
        this.perfiles = data.perfiles || [];
        this.encuestaStats = data.encuestaStats || this.encuestaStats;
        this.cargando = false;
      },
      error: () => {
        this.error = "No se pudieron cargar los indicadores gerenciales. Revisa que el backend y las bases de datos esten disponibles.";
        this.cargando = false;
      }
    });
  }

  get habitacionesOcupadas(): number {
    return this.habitaciones.filter((h) => this.normalizar(h.ESTADO) === "OCUPADA").length;
  }

  get habitacionesMantenimiento(): number {
    return this.habitaciones.filter((h) => this.normalizar(h.ESTADO) === "MANTENIMIENTO").length;
  }

  get ocupacionPorcentaje(): number {
    return this.habitaciones.length ? Math.round((this.habitacionesOcupadas / this.habitaciones.length) * 100) : 0;
  }

  get reservasPendientes(): number {
    return this.reservas.filter((r) => this.normalizar(r.ESTADO) === "PENDIENTE").length;
  }

  get totalFacturado(): number {
    return this.suma(this.facturas.map((f) => f.TOTAL));
  }

  get totalPagado(): number {
    return this.suma(this.pagos.map((p) => p.MONTO));
  }

  get facturasPendientes(): number {
    return this.facturas.filter((f) => this.normalizar(f.ESTADO_PAGO) === "PENDIENTE").length;
  }

  get totalPendiente(): number {
    return this.suma(this.facturas.filter((f) => this.normalizar(f.ESTADO_PAGO) === "PENDIENTE").map((f) => f.TOTAL));
  }

  get ocupacionPorEstado() {
    return this.conteoConPorcentaje(this.habitaciones.map((h) => h.ESTADO || "Sin estado"));
  }

  get habitacionesPorTipo() {
    const grupos = new Map<string, { total: number; suma: number }>();
    for (const habitacion of this.habitaciones) {
      const tipo = habitacion.TIPO || "Sin tipo";
      const actual = grupos.get(tipo) || { total: 0, suma: 0 };
      actual.total += 1;
      actual.suma += Number(habitacion.PRECIO_NOCHE || 0);
      grupos.set(tipo, actual);
    }
    return [...grupos.entries()].map(([tipo, data]) => ({ tipo, total: data.total, promedio: data.total ? data.suma / data.total : 0 }));
  }

  get facturasPorEstado() {
    return this.conteoConPorcentaje(this.facturas.map((f) => f.ESTADO_PAGO || "Sin estado"));
  }

  get distribucionEncuestas() {
    const total = this.suma(this.encuestaStats.distribucion.map((d) => d.total));
    return this.encuestaStats.distribucion.map((d) => ({
      label: `${d._id} estrellas`,
      total: d.total,
      porcentaje: total ? Math.round((d.total / total) * 100) : 0
    }));
  }

  get topTipoHabitacion(): string {
    return this.topPreferencia("tipoHabitacion");
  }

  get topVista(): string {
    return this.topPreferencia("vista");
  }

  get topTipoCama(): string {
    return this.topPreferencia("tipoCama");
  }

  get serviciosFavoritos() {
    const valores = this.perfiles.flatMap((p) => p.preferencias?.serviciosFavoritos || []);
    return this.conteoConPorcentaje(valores).slice(0, 8);
  }

  conteoPreferencias(campo: "tipoHabitacion" | "vista" | "tipoCama") {
    return this.conteoConPorcentaje(this.perfiles.map((p) => p.preferencias?.[campo] || "").filter(Boolean));
  }

  moneda(value: unknown): string {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(value || 0));
  }

  fecha(value?: string): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("es-PE").format(date);
  }

  private topPreferencia(campo: "tipoHabitacion" | "vista" | "tipoCama"): string {
    return this.conteoPreferencias(campo)[0]?.label || "-";
  }

  private conteoConPorcentaje(valores: string[]) {
    const grupos = new Map<string, number>();
    for (const valor of valores) {
      const label = valor || "Sin dato";
      grupos.set(label, (grupos.get(label) || 0) + 1);
    }
    const total = this.suma([...grupos.values()]);
    return [...grupos.entries()]
      .map(([label, count]) => ({ label, total: count, porcentaje: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }

  private suma(values: Array<unknown>): number {
    return values.reduce<number>((total, value) => total + Number(value || 0), 0);
  }

  private normalizar(value?: string): string {
    return String(value || "").trim().toUpperCase();
  }
}
