import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

interface Testimonio {
  nombre: string;
  origen: string;
  texto: string;
  avatar: string;
  estrellas: number;
}

interface Habitacion {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
}

@Component({
  selector: "app-landing-home",
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- HERO -->
    <section class="hero" [style.backgroundImage]="'url(' + heroImagen + ')'">
      <div class="hero-overlay">
        <span class="eyebrow">Aurea Resort &amp; Spa</span>
        <h1>Vive una experiencia inolvidable</h1>
        <p>
          Frente al mar, rodeado de naturaleza y con el servicio que mereces.
          Reserva tu próxima estancia en minutos.
        </p>
        <div class="hero-actions">
          <a class="btn-gold-lg" routerLink="/auth/register">Reservar ahora</a>
          <a class="btn-outline-lg-light" routerLink="/habitaciones">Ver habitaciones</a>
        </div>
      </div>
    </section>

    <!-- BUSCADOR FLOTANTE -->
    <section class="booking-wrap">
      <div class="booking-card">
        <div class="booking-grid">
          <label>
            Llegada
            <input type="date" />
          </label>
          <label>
            Salida
            <input type="date" />
          </label>
          <label>
            Huéspedes
            <select>
              <option>2 Adultos, 0 Niños</option>
              <option>1 Adulto</option>
              <option>2 Adultos, 1 Niño</option>
            </select>
          </label>
          <label>
            Habitaciones
            <select>
              <option>1 Habitación</option>
              <option>2 Habitaciones</option>
            </select>
          </label>
          <button class="btn-search">Buscar disponibilidad</button>
        </div>
      </div>
    </section>

    <!-- POR QUÉ ELEGIRNOS -->
    <section class="ventajas">
      <div class="ventajas-grid">
        @for (v of ventajas; track v.titulo) {
          <div class="ventaja">
            <span class="ventaja-icono">{{ v.icono }}</span>
            <h3>{{ v.titulo }}</h3>
            <p>{{ v.texto }}</p>
          </div>
        }
      </div>
    </section>

    <!-- HABITACIONES DESTACADAS -->
    <section class="habitaciones">
      <div class="section-head">
        <span class="eyebrow eyebrow-dark">Alojamiento</span>
        <h2>Habitaciones pensadas para descansar</h2>
        <p>Espacios elegantes con vista al mar y todas las comodidades.</p>
      </div>

      <div class="habitaciones-grid">
        @for (h of habitaciones; track h.nombre) {
          <article class="habitacion-card">
            <img [src]="h.imagen" [alt]="h.nombre" />
            <div class="habitacion-info">
              <h3>{{ h.nombre }}</h3>
              <p>{{ h.descripcion }}</p>
              <div class="habitacion-footer">
                <span class="precio">{{ h.precio }} <small>/ noche</small></span>
                <a class="btn-gold" routerLink="/habitaciones">Ver más</a>
              </div>
            </div>
          </article>
        }
      </div>
    </section>

    <!-- GALERÍA -->
    <section class="galeria">
      <div class="section-head">
        <span class="eyebrow eyebrow-dark">Galería</span>
        <h2>Un vistazo a Aurea</h2>
      </div>
      <div class="galeria-grid">
        @for (img of galeria; track img) {
          <div class="galeria-item">
            <img [src]="img" alt="Vista del resort" />
          </div>
        }
      </div>
    </section>

    <!-- TESTIMONIOS -->
    <section class="testimonios">
      <div class="section-head">
        <span class="eyebrow eyebrow-light">Opiniones</span>
        <h2>Lo que dicen nuestros huéspedes</h2>
      </div>

      <div class="testimonios-grid">
        @for (t of testimonios; track t.nombre) {
          <article class="testimonio-card">
            <div class="estrellas">
              @for (e of [1,2,3,4,5]; track e) {
                <span [class.activa]="e <= t.estrellas">★</span>
              }
            </div>
            <p class="testimonio-texto">"{{ t.texto }}"</p>
            <div class="testimonio-autor">
              <img [src]="t.avatar" [alt]="t.nombre" />
              <div>
                <strong>{{ t.nombre }}</strong>
                <small>{{ t.origen }}</small>
              </div>
            </div>
          </article>
        }
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta-final">
      <h2>Tu próxima estancia empieza aquí</h2>
      <p>Crea tu cuenta gratis y reserva en pocos pasos.</p>
      <div class="cta-actions">
        <a class="btn-gold-lg" routerLink="/auth/register">Crear cuenta</a>
        <a class="btn-outline-lg" routerLink="/auth/login">Iniciar sesión</a>
      </div>
    </section>
  `,
  styles: [`
    :host {
      --navy-900: #0B2540;
      --navy-700: #16395E;
      --gold-500: #C9A227;
      --gold-300: #E3C77E;
      --cream-50: #FBF8F2;
      --ink-700: #233044;
      --muted: #5C6B80;
      display: block;
    }

    /* ===== HERO ===== */
    .hero {
      position: relative;
      min-height: 78vh;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11,37,64,0.55), rgba(11,37,64,0.75));
    }
    .hero-overlay {
      position: relative;
      z-index: 1;
      color: white;
      max-width: 680px;
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .eyebrow {
      font-size: 0.8rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--gold-300);
      margin-bottom: 0.7rem;
    }
    .hero-overlay h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      line-height: 1.15;
      margin: 0 0 1rem;
    }
    .hero-overlay p {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.92);
      margin-bottom: 1.8rem;
    }
    .hero-actions { display: flex; gap: 0.9rem; flex-wrap: wrap; justify-content: center; }

    /* ===== BUSCADOR FLOTANTE ===== */
    .booking-wrap {
      display: flex;
      justify-content: center;
      padding: 0 1.5rem;
      margin-top: -3.2rem;
      position: relative;
      z-index: 2;
    }
    .booking-card {
      background: white;
      border-radius: 14px;
      padding: 1.4rem 1.6rem;
      box-shadow: 0 18px 40px rgba(11,37,64,0.22);
      width: 100%;
      max-width: 1000px;
    }
    .booking-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 1rem;
      align-items: end;
    }
    .booking-grid label {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--navy-700);
    }
    .booking-grid input, .booking-grid select {
      border: 1px solid #D9DEE6;
      border-radius: 8px;
      padding: 0.55rem 0.6rem;
      font-size: 0.88rem;
      font-family: inherit;
    }
    .btn-search {
      background: var(--gold-500);
      color: var(--navy-900);
      border: none;
      border-radius: 8px;
      padding: 0.65rem 1.4rem;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
    }
    .btn-search:hover { background: var(--gold-300); }

    /* ===== SECCIONES GENERALES ===== */
    .section-head {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 2.4rem;
    }
    .eyebrow-dark { color: var(--gold-500); }
    .eyebrow-light { color: var(--gold-300); }
    .section-head h2 {
      font-family: 'Playfair Display', serif;
      color: var(--navy-900);
      font-size: 2rem;
      margin: 0.3rem 0 0.5rem;
    }
    .section-head p { color: var(--muted); margin: 0; }

    /* ===== VENTAJAS ===== */
    .ventajas { padding: 5rem 1.5rem 2rem; max-width: 1100px; margin: 0 auto; }
    .ventajas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.6rem;
      text-align: center;
    }
    .ventaja-icono { font-size: 1.8rem; display: block; margin-bottom: 0.6rem; }
    .ventaja h3 { color: var(--navy-900); font-size: 1.05rem; margin: 0 0 0.4rem; }
    .ventaja p { color: var(--muted); font-size: 0.88rem; margin: 0; }

    /* ===== HABITACIONES ===== */
    .habitaciones { padding: 3rem 1.5rem; max-width: 1100px; margin: 0 auto; }
    .habitaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.6rem;
    }
    .habitacion-card {
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 24px rgba(11,37,64,0.08);
      display: flex;
      flex-direction: column;
    }
    .habitacion-card img { width: 100%; height: 200px; object-fit: cover; }
    .habitacion-info { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .habitacion-info h3 { color: var(--navy-900); margin: 0; font-size: 1.1rem; }
    .habitacion-info p { color: var(--muted); font-size: 0.88rem; margin: 0; }
    .habitacion-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.4rem;
    }
    .precio { color: var(--navy-900); font-weight: 700; }
    .precio small { color: var(--muted); font-weight: 400; }
    .btn-gold {
      background: var(--gold-500);
      color: var(--navy-900);
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-gold:hover { background: var(--gold-300); }

    /* ===== GALERÍA ===== */
    .galeria { padding: 3rem 1.5rem; max-width: 1200px; margin: 0 auto; }
    .galeria-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .galeria-item { border-radius: 12px; overflow: hidden; aspect-ratio: 4/5; }
    .galeria-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .galeria-item:hover img { transform: scale(1.06); }

    /* ===== TESTIMONIOS ===== */
    .testimonios {
      background: var(--navy-900);
      padding: 4rem 1.5rem;
      margin-top: 3rem;
    }
    .testimonios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.4rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    .testimonio-card {
      background: var(--navy-700);
      border-radius: 14px;
      padding: 1.5rem;
      color: white;
    }
    .estrellas { color: rgba(255,255,255,0.3); margin-bottom: 0.8rem; letter-spacing: 0.1em; }
    .estrellas .activa { color: var(--gold-500); }
    .testimonio-texto { font-size: 0.92rem; color: rgba(255,255,255,0.9); margin-bottom: 1.1rem; line-height: 1.5; }
    .testimonio-autor { display: flex; align-items: center; gap: 0.7rem; }
    .testimonio-autor img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
    .testimonio-autor strong { display: block; font-size: 0.9rem; }
    .testimonio-autor small { color: var(--gold-300); font-size: 0.78rem; }

    /* ===== CTA FINAL ===== */
    .cta-final {
      background: var(--cream-50);
      text-align: center;
      padding: 3.5rem 1.5rem;
    }
    .cta-final h2 {
      font-family: 'Playfair Display', serif;
      color: var(--navy-900);
      margin-bottom: 0.4rem;
      font-size: 1.8rem;
    }
    .cta-final p { color: var(--muted); margin-bottom: 1.4rem; }
    .cta-actions { display: flex; justify-content: center; gap: 0.8rem; flex-wrap: wrap; }
    .btn-gold-lg, .btn-outline-lg, .btn-outline-lg-light {
      padding: 0.7rem 1.6rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      transition: transform 0.15s, background 0.2s;
    }
    .btn-gold-lg { background: var(--gold-500); color: var(--navy-900); }
    .btn-gold-lg:hover { background: var(--gold-300); transform: translateY(-1px); }
    .btn-outline-lg { border: 1px solid var(--navy-700); color: var(--navy-700); }
    .btn-outline-lg:hover { background: white; }
    .btn-outline-lg-light { border: 1px solid rgba(255,255,255,0.6); color: white; }
    .btn-outline-lg-light:hover { background: rgba(255,255,255,0.12); }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 900px) {
      .hero-overlay h1 { font-size: 2.2rem; }
      .booking-grid { grid-template-columns: 1fr 1fr; }
      .btn-search { grid-column: 1 / -1; }
      .galeria-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class HomeComponent {
  // 👉 Reemplaza estas URLs por fotos reales del hotel cuando las tengas
  heroImagen = "https://picsum.photos/seed/aurea-hero/1800/1000";

  ventajas = [
    { icono: "📍", titulo: "Ubicación privilegiada", texto: "Frente al mar, a minutos del centro de la ciudad." },
    { icono: "🛎️", titulo: "Servicio personalizado", texto: "Atención dedicada desde el check-in hasta el check-out." },
    { icono: "🍽️", titulo: "Gastronomía de autor", texto: "Cocina local e internacional preparada por nuestros chefs." },
    { icono: "🌿", titulo: "Spa &amp; bienestar", texto: "Espacios pensados para relajarte y desconectar." }
  ];

  habitaciones: Habitacion[] = [
    {
      nombre: "Deluxe Ocean View Suite",
      descripcion: "Cama king size, terraza privada, jacuzzi y Wi-Fi gratis. 55 m².",
      precio: "$299",
      imagen: "https://picsum.photos/seed/aurea-room1/600/450"
    },
    {
      nombre: "Presidential Villa",
      descripcion: "Piscina privada, jardín y total privacidad. 120 m².",
      precio: "$549",
      imagen: "https://picsum.photos/seed/aurea-room2/600/450"
    },
    {
      nombre: "Junior Suite Garden",
      descripcion: "Vista al jardín, balcón y desayuno incluido. 42 m².",
      precio: "$189",
      imagen: "https://picsum.photos/seed/aurea-room3/600/450"
    }
  ];

  galeria = [
    "https://picsum.photos/seed/aurea-g1/500/600",
    "https://picsum.photos/seed/aurea-g2/500/600",
    "https://picsum.photos/seed/aurea-g3/500/600",
    "https://picsum.photos/seed/aurea-g4/500/600"
  ];

  testimonios: Testimonio[] = [
    {
      nombre: "Lucía Fernández",
      origen: "Lima, Perú",
      texto: "La atención fue excelente desde la reserva hasta el check-out. Las habitaciones superaron mis expectativas.",
      avatar: "https://picsum.photos/seed/aurea-av1/120/120",
      estrellas: 5
    },
    {
      nombre: "Carlos Medina",
      origen: "Bogotá, Colombia",
      texto: "El spa y la gastronomía hicieron de nuestra escapada algo inolvidable. Sin duda volveremos.",
      avatar: "https://picsum.photos/seed/aurea-av2/120/120",
      estrellas: 5
    },
    {
      nombre: "Andrea Salas",
      origen: "Santiago, Chile",
      texto: "Reservar fue muy sencillo y el personal estuvo atento a cada detalle de nuestra estancia.",
      avatar: "https://picsum.photos/seed/aurea-av3/120/120",
      estrellas: 4
    }
  ];
}