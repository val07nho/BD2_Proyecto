import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
  selector: "app-contacto-landing",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="contacto-landing">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Contacto</span>
          <h1>Comunícate con Nosotros</h1>
          <p>¿Tienes dudas sobre tu reserva o deseas planificar un evento corporativo? Nuestro equipo de conserjería está a tu entera disposición.</p>
        </div>
      </section>

      <div class="container">
        <div class="contact-grid">
          <!-- Formulario de Contacto -->
          <article class="card form-card">
            <h3>Envíanos un Mensaje</h3>
            <p class="subtitle">Completa el formulario y te responderemos en un plazo de 24 horas.</p>

            @if (mensajeEnviado) {
              <div class="success-block">
                <span class="success-icon">✉️</span>
                <h4>¡Mensaje Recibido!</h4>
                <p>Gracias por ponerte en contacto con Aurea. Hemos recibido tu mensaje y nos comunicaremos contigo a la brevedad.</p>
                <button class="btn primary" type="button" (click)="mensajeEnviado = false">Enviar otro mensaje</button>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="enviarMensaje()">
                <div class="form-row-2col">
                  <label class="form-label">
                    Nombre Completo
                    <input type="text" formControlName="nombre" placeholder="Tu nombre" />
                  </label>
                  <label class="form-label">
                    Correo Electrónico
                    <input type="email" formControlName="correo" placeholder="correo@ejemplo.com" />
                  </label>
                </div>

                <label class="form-label">
                  Asunto
                  <select formControlName="asunto">
                    <option value="Reservas">Consultas sobre Reservas</option>
                    <option value="Eventos">Eventos Corporativos y Bodas</option>
                    <option value="Soporte">Soporte Técnico / Facturación</option>
                    <option value="Otros">Otros Asuntos</option>
                  </select>
                </label>

                <label class="form-label">
                  Mensaje
                  <textarea rows="5" formControlName="mensaje" placeholder="Escribe aquí tu consulta detalladamente..."></textarea>
                </label>

                <button class="btn primary" type="submit" [disabled]="form.invalid">
                  Enviar Mensaje
                </button>
              </form>
            }
          </article>

          <!-- Información y Canales -->
          <div class="info-column">
            <article class="card info-card">
              <h3>Oficina del Resort</h3>
              
              <ul class="info-list">
                <li>
                  <span class="icon">📍</span>
                  <div>
                    <strong>Dirección</strong>
                    <p>Av. Costanera Sur N.º 405, Paracas, Ica - Perú</p>
                  </div>
                </li>
                <li>
                  <span class="icon">📞</span>
                  <div>
                    <strong>Teléfono</strong>
                    <p>+51 (056) 404-900 / +51 999 111 222</p>
                  </div>
                </li>
                <li>
                  <span class="icon">✉️</span>
                  <div>
                    <strong>Correo Electrónico</strong>
                    <p>reservas&#64;aurearesort.com / info&#64;aurearesort.com</p>
                  </div>
                </li>
              </ul>
            </article>

            <!-- Mapa Mock -->
            <article class="card map-card">
              <div class="map-placeholder">
                <span class="map-icon">🗺️</span>
                <strong>Mapa de Ubicación</strong>
                <p>Ver en Google Maps &rarr;</p>
              </div>
            </article>
          </div>
        </div>
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
        padding: 4rem 1.5rem;
      }
      .hero {
        min-height: 320px;
        background-image: linear-gradient(180deg, rgba(11,37,64,.55), rgba(11,37,64,.85)), url('https://picsum.photos/seed/landing-contacto-hero/1600/700');
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

      .contact-grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 2.5rem;
      }

      .card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: var(--shadow);
      }

      .form-card h3, .info-card h3 {
        margin: 0 0 0.25rem;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 1.5rem;
      }
      .subtitle {
        margin: 0 0 1.5rem;
        color: var(--muted);
        font-size: 0.88rem;
      }

      form {
        display: grid;
        gap: 1.25rem;
      }
      .form-row-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }
      .form-label {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-weight: 700;
        color: var(--navy-700);
        font-size: 0.82rem;
      }
      .form-label input, .form-label select, .form-label textarea {
        border: 2px solid #E2E8F0;
        border-radius: 10px;
        padding: 0.7rem 0.85rem;
        font: inherit;
        background: #F8FAFC;
        outline: none;
        transition: all 0.2s;
        color: var(--navy-900);
      }
      .form-label input:focus, .form-label select:focus, .form-label textarea:focus {
        border-color: var(--gold-500);
        background: var(--white);
        box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
      }

      .btn {
        padding: 0.75rem 1.6rem;
        font-weight: 700;
        border-radius: 10px;
        font-size: 0.9rem;
        cursor: pointer;
        border: none;
        transition: opacity 0.2s;
      }
      .btn:hover { opacity: 0.9; }
      .btn.primary { background: var(--navy-900); color: var(--white); }

      .success-block {
        text-align: center;
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      .success-icon { font-size: 3rem; }
      .success-block h4 { margin: 0; color: var(--navy-900); font-family: 'Playfair Display', serif; font-size: 1.3rem; }
      .success-block p { margin: 0 0 0.5rem; color: var(--muted); max-width: 380px; font-size: 0.9rem; }

      .info-column {
        display: grid;
        gap: 1.5rem;
      }

      .info-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1.25rem;
      }
      .info-list li {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }
      .info-list .icon {
        font-size: 1.5rem;
        margin-top: 0.2rem;
      }
      .info-list strong {
        color: var(--navy-900);
        font-size: 0.9rem;
        display: block;
      }
      .info-list p {
        margin: 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.4;
      }

      .map-card {
        padding: 0;
        overflow: hidden;
      }
      .map-placeholder {
        height: 180px;
        background: linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(11, 37, 64, 0.05)), url('https://picsum.photos/seed/map/500/250');
        background-size: cover;
        background-position: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--navy-900);
        cursor: pointer;
        text-align: center;
        padding: 1rem;
      }
      .map-icon { font-size: 2rem; margin-bottom: 0.25rem; }
      .map-placeholder strong { font-family: 'Playfair Display', serif; font-size: 1.1rem; }
      .map-placeholder p { margin: 0.15rem 0 0; font-size: 0.8rem; font-weight: 700; color: var(--gold-500); }

      @media (max-width: 900px) {
        .contact-grid {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .hero h1 { font-size: 2.1rem; }
        .form-row-2col {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }
    `
  ]
})
export class ContactoLandingComponent {
  private readonly fb = inject(FormBuilder);

  mensajeEnviado = false;

  readonly form = this.fb.group({
    nombre: ["", [Validators.required]],
    correo: ["", [Validators.required, Validators.email]],
    asunto: ["Reservas", [Validators.required]],
    mensaje: ["", [Validators.required]]
  });

  enviarMensaje() {
    if (this.form.invalid) return;
    this.mensajeEnviado = true;
    this.form.reset({
      nombre: "",
      correo: "",
      asunto: "Reservas",
      mensaje: ""
    });
  }
}
