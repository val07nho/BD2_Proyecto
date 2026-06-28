import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface Huesped {
  ID_HUESPED: number;
  ID_USUARIO: number | null;
}

interface Reserva {
  ID_RESERVA: number;
  ID_HUESPED: number;
  FECHA_INGRESO?: string;
  FECHA_SALIDA?: string;
  ESTADO?: string;
  NUMERO_HABITACION?: string;
}

interface Encuesta {
  _id?: string;
  idHuesped: number;
  idReserva?: number;
  fecha?: string;
  calificacionGeneral?: number;
  calificacion?: number;
  comentario?: string;
}

@Component({
  selector: "app-encuestas-cliente",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  template: `
    <section class="cliente-encuestas">
      <section class="hero">
        <div>
          <span class="eyebrow">Encuestas</span>
          <h1>Tu experiencia nos importa</h1>
          <p>Responde la encuesta de tus reservas finalizadas y ayúdanos a mejorar tu próxima estadía.</p>
        </div>

        <div class="hero-stats">
          <article>
            <strong>{{ reservasElegibles.length }}</strong>
            <small>Reservas por evaluar</small>
          </article>
          <article>
            <strong>{{ encuestas.length }}</strong>
            <small>Encuestas enviadas</small>
          </article>
          <article>
            <strong>{{ promedio }}</strong>
            <small>Promedio</small>
          </article>
        </div>
      </section>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }
      @if (error) {
        <div class="alert error">{{ error }}</div>
      }

      <section class="grid">
        <article class="card form-card">
          <h3>Responder encuesta</h3>

          <form [formGroup]="form" (ngSubmit)="enviarEncuesta()" class="form-grid">
            <label>
              Reserva finalizada
              <select formControlName="idReserva">
                <option [ngValue]="null">Selecciona una reserva</option>
                @for (reserva of reservasElegibles; track reserva.ID_RESERVA) {
                  <option [ngValue]="reserva.ID_RESERVA">
                    #{{ reserva.ID_RESERVA }} · {{ reserva.FECHA_INGRESO | date: 'yyyy-MM-dd' }}
                  </option>
                }
              </select>
            </label>

            <label>
              Calificación general
              <select formControlName="calificacionGeneral">
                <option [ngValue]="5">5 - Excelente</option>
                <option [ngValue]="4">4 - Muy buena</option>
                <option [ngValue]="3">3 - Buena</option>
                <option [ngValue]="2">2 - Regular</option>
                <option [ngValue]="1">1 - Mala</option>
              </select>
            </label>

            <label>
              Comentario
              <textarea rows="5" formControlName="comentario" placeholder="Cuéntanos tu experiencia..."></textarea>
            </label>

            <button class="btn primary" type="submit" [disabled]="form.invalid || enviando || !idHuespedActual">
              {{ enviando ? 'Enviando...' : 'Enviar encuesta' }}
            </button>
          </form>
        </article>

        <article class="card list-card">
          <div class="card-head">
            <h3>Mis encuestas recientes</h3>
            <button class="btn ghost" type="button" (click)="cargar()" [disabled]="cargando">Actualizar</button>
          </div>

          @if (cargando) {
            <p class="empty">Cargando encuestas...</p>
          } @else if (!encuestas.length) {
            <p class="empty">Aún no has enviado encuestas.</p>
          } @else {
            <div class="survey-list">
              @for (encuesta of encuestas; track $index) {
                <article class="survey-item">
                  <div class="survey-top">
                    <strong>{{ encuesta.calificacionGeneral ?? encuesta.calificacion ?? '—' }}/5</strong>
                    <small>{{ encuesta.fecha | date: 'yyyy-MM-dd HH:mm' }}</small>
                  </div>
                  <p>{{ encuesta.comentario || 'Sin comentario.' }}</p>
                  <span class="meta">Reserva #{{ encuesta.idReserva || '—' }}</span>
                </article>
              }
            </div>
          }
        </article>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        --navy-900: #0B2540;
        --navy-700: #16395E;
        --gold-500: #C9A227;
        --cream-50: #FBF8F2;
        --white: #FFFFFF;
        --muted: #5C6B80;
        --border: #E7EAF0;
        --shadow: 0 18px 40px rgba(11, 37, 64, .1);
        display: block;
        font-family: 'Inter', system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      .cliente-encuestas { display: grid; gap: 1rem; }
      .hero {
        border-radius: 24px;
        padding: 1.5rem;
        background: linear-gradient(120deg, #F3E9D6, var(--cream-50));
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .eyebrow { color: var(--gold-500); text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; font-weight: 900; }
      h1 { margin: .3rem 0 .45rem; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.95rem; }
      p { margin: 0; color: var(--muted); }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: .65rem; align-content: start; }
      .hero-stats article { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: .75rem .8rem; }
      .hero-stats strong { display: block; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.2rem; }
      .hero-stats small { color: var(--muted); font-size: .76rem; }

      .grid { display: grid; grid-template-columns: minmax(320px, 430px) 1fr; gap: 1rem; align-items: start; }
      .card {
        border-radius: 16px;
        background: var(--white);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 1rem 1.05rem;
      }
      h3 { margin: 0 0 .85rem; color: var(--navy-900); font-family: 'Playfair Display', serif; }
      .form-grid { display: grid; gap: .75rem; }
      label { display: grid; gap: .35rem; font-size: .78rem; font-weight: 700; color: var(--navy-700); }
      input, select, textarea {
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: .58rem .62rem;
        font: inherit;
        background: var(--cream-50);
        color: var(--navy-900);
      }
      textarea { resize: vertical; }
      .btn { border: none; border-radius: 8px; padding: .54rem .84rem; font-size: .8rem; font-weight: 700; cursor: pointer; }
      .btn.primary { background: var(--gold-500); color: #10233B; }
      .btn.ghost { background: transparent; color: var(--navy-700); border: 1px solid var(--border); }

      .card-head { display: flex; justify-content: space-between; align-items: center; gap: .7rem; margin-bottom: .8rem; }
      .survey-list { display: grid; gap: .68rem; }
      .survey-item { border: 1px solid var(--border); border-radius: 12px; padding: .75rem .82rem; background: #fff; }
      .survey-top { display: flex; justify-content: space-between; gap: .6rem; align-items: center; margin-bottom: .35rem; }
      .survey-top strong { color: var(--navy-900); }
      .survey-top small, .meta { color: var(--muted); font-size: .76rem; }
      .survey-item p { margin: 0; color: var(--navy-700); }
      .meta { display: block; margin-top: .35rem; }
      .empty { margin: 0; color: var(--muted); }
      .alert { border-radius: 10px; padding: .72rem .92rem; }
      .alert.success { background: rgba(46,125,50,.12); color: #1F5F23; border: 1px solid rgba(46,125,50,.24); }
      .alert.error { background: rgba(179,38,30,.1); color: #8A1E18; border: 1px solid rgba(179,38,30,.25); }

      @media (max-width: 960px) {
        .hero-stats { grid-template-columns: 1fr; }
        .grid { grid-template-columns: 1fr; }
      }
    `
  ]
})
export class EncuestasClienteComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    idReserva: [null as number | null, Validators.required],
    calificacionGeneral: [5, Validators.required],
    comentario: ["", Validators.required]
  });

  cargando = true;
  enviando = false;
  mensaje = "";
  error = "";
  promedio = "0.0";

  idHuespedActual: number | null = null;
  reservasElegibles: Reserva[] = [];
  encuestas: Encuesta[] = [];

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando = true;
    this.error = "";

    try {
      const idUsuario = this.auth.getUserId();
      if (!idUsuario) throw new Error("No se pudo identificar al usuario.");

      const [huespedes, reservas] = await Promise.all([
        firstValueFrom(this.api.get<Huesped[]>('/huespedes')),
        firstValueFrom(this.api.get<Reserva[]>('/reservas'))
      ]);

      const huesped = huespedes.find((item) => Number(item.ID_USUARIO) === idUsuario);
      if (!huesped) {
        this.idHuespedActual = null;
        this.reservasElegibles = [];
        this.encuestas = [];
        return;
      }

      this.idHuespedActual = huesped.ID_HUESPED;
      const misReservas = reservas.filter((item) => Number(item.ID_HUESPED) === Number(huesped.ID_HUESPED));
      const finalizadas = misReservas.filter((item) => this.normalizar(item.ESTADO) === "FINALIZADA");

      const encuestas = await firstValueFrom(this.api.get<Encuesta[]>(`/encuestas/huesped/${huesped.ID_HUESPED}`));
      const encuestasOrdenadas = [...encuestas].sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());
      const reservasConEncuesta = new Set(encuestasOrdenadas.map((item) => Number(item.idReserva)).filter((id) => Number.isFinite(id)));

      this.encuestas = encuestasOrdenadas;
      this.reservasElegibles = finalizadas.filter((item) => !reservasConEncuesta.has(Number(item.ID_RESERVA)));

      const values = this.encuestas
        .map((item) => Number(item.calificacionGeneral ?? item.calificacion ?? 0))
        .filter((item) => Number.isFinite(item) && item > 0);
      const avg = values.length ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;
      this.promedio = avg.toFixed(1);

      const firstReserva = this.reservasElegibles[0]?.ID_RESERVA || null;
      this.form.patchValue({ idReserva: firstReserva });
    } catch (error) {
      this.error = this.extraerMensaje(error, "No se pudieron cargar las encuestas.");
    } finally {
      this.cargando = false;
    }
  }

  async enviarEncuesta() {
    if (this.form.invalid || !this.idHuespedActual) {
      return;
    }

    this.enviando = true;
    this.mensaje = "";
    this.error = "";

    try {
      const value = this.form.value;
      await firstValueFrom(this.api.post('/encuestas', {
        idHuesped: this.idHuespedActual,
        idReserva: value.idReserva,
        calificacionGeneral: Number(value.calificacionGeneral),
        comentario: String(value.comentario || "").trim(),
        fecha: new Date().toISOString()
      }));

      this.mensaje = "Encuesta enviada correctamente. Gracias por tu opinión.";
      this.form.patchValue({ comentario: "" });
      await this.cargar();
    } catch (error) {
      this.error = this.extraerMensaje(error, "No se pudo enviar la encuesta.");
    } finally {
      this.enviando = false;
    }
  }

  private normalizar(estado: string | undefined) {
    return String(estado || "").toUpperCase().trim();
  }

  private extraerMensaje(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "object" && error && "error" in error) {
      const response = (error as { error?: { message?: string } }).error;
      if (response?.message) return response.message;
    }
    return fallback;
  }
}
