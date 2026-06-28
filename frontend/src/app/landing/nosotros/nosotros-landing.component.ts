import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-nosotros-landing",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="nosotros-landing">
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Nuestra Historia</span>
          <h1>Sobre Aurea Resort</h1>
          <p>Un refugio de lujo y tranquilidad a orillas del pacífico, donde la tradición y el confort moderno se unen para crear recuerdos inolvidables.</p>
        </div>
      </section>

      <div class="container">
        <section class="history-grid">
          <div class="text-block">
            <span class="section-tag">Nuestros Orígenes</span>
            <h2>Más de una década brindando experiencias de ensueño</h2>
            <p>Aurea nació en 2012 con la visión de crear un espacio donde la naturaleza y la arquitectura de lujo coexistieran en perfecta armonía. Diseñado por arquitectos de renombre internacional, nuestro resort ha sido galardonado en múltiples ocasiones por su compromiso con el diseño y la sostenibilidad.</p>
            <p>Desde el primer día, nuestra misión ha sido superar las expectativas de cada huésped, brindando un servicio cálido y personalizado que capture la esencia de la hospitalidad peruana.</p>
          </div>
          <div class="image-block">
            <img src="https://picsum.photos/seed/aurea-history/700/500" alt="Historia de Aurea" />
          </div>
        </section>

        <section class="values-section card">
          <div class="value-item">
            <span class="value-icon">👁️</span>
            <h3>Visión</h3>
            <p>Ser reconocidos como el resort de lujo líder en la costa peruana, destacando por nuestro servicio personalizado, innovación y sostenibilidad ecológica.</p>
          </div>
          <div class="value-item">
            <span class="value-icon">🎯</span>
            <h3>Misión</h3>
            <p>Brindar experiencias de hospedaje excepcionales que reconecten a nuestros huéspedes con el descanso y la exclusividad, asegurando los más altos estándares de calidad.</p>
          </div>
          <div class="value-item">
            <span class="value-icon">💎</span>
            <h3>Valores</h3>
            <p>Exclusividad, integridad, sostenibilidad, vocación de servicio y el máximo respeto por el entorno cultural y natural que nos rodea.</p>
          </div>
        </section>

        <section class="team-section">
          <div class="section-heading">
            <span class="section-tag">Nuestro Equipo</span>
            <h2>Líderes apasionados por el servicio</h2>
            <p>El alma de Aurea radica en las personas que cuidan cada detalle de tu estancia.</p>
          </div>

          <div class="team-grid">
            <article class="team-card">
              <img src="https://picsum.photos/seed/member-1/300/320" alt="Director General" />
              <h4>Alejandro Varela</h4>
              <p class="role">Director General</p>
            </article>

            <article class="team-card">
              <img src="https://picsum.photos/seed/member-2/300/320" alt="Directora de Operaciones" />
              <h4>Mariana Torres</h4>
              <p class="role">Directora de Operaciones</p>
            </article>

            <article class="team-card">
              <img src="https://picsum.photos/seed/member-3/300/320" alt="Chef Ejecutivo" />
              <h4>Chef Carlos Rossi</h4>
              <p class="role">Chef Ejecutivo</p>
            </article>
          </div>
        </section>
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
        display: grid;
        gap: 5rem;
      }
      .hero {
        min-height: 320px;
        background-image: linear-gradient(180deg, rgba(11,37,64,.55), rgba(11,37,64,.85)), url('https://picsum.photos/seed/landing-nosotros-hero/1600/700');
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

      .history-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 3rem;
        align-items: center;
      }
      .section-tag {
        color: var(--gold-500);
        text-transform: uppercase;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
      }
      .history-grid h2 {
        margin: 0.4rem 0 1rem;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 2.2rem;
        line-height: 1.25;
      }
      .history-grid p {
        color: var(--muted);
        font-size: 0.95rem;
        line-height: 1.65;
        margin-bottom: 1rem;
      }
      .image-block img {
        width: 100%;
        border-radius: 20px;
        box-shadow: var(--shadow);
      }

      .values-section {
        background: var(--white);
        border-radius: 24px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        padding: 3rem 2rem;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2.5rem;
      }
      .value-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .value-icon {
        font-size: 2rem;
        margin-bottom: 0.25rem;
      }
      .value-item h3 {
        margin: 0;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 1.4rem;
      }
      .value-item p {
        margin: 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.6;
      }

      .team-section {
        display: grid;
        gap: 2.5rem;
      }
      .section-heading {
        text-align: center;
        max-width: 600px;
        margin: 0 auto;
      }
      .section-heading h2 {
        margin: 0.4rem 0 0.5rem;
        font-family: 'Playfair Display', serif;
        color: var(--navy-900);
        font-size: 2.2rem;
      }
      .section-heading p {
        margin: 0;
        color: var(--muted);
      }

      .team-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }
      .team-card {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1.25rem;
        text-align: center;
        box-shadow: var(--shadow);
      }
      .team-card img {
        width: 100%;
        border-radius: 12px;
        object-fit: cover;
        margin-bottom: 1rem;
      }
      .team-card h4 {
        margin: 0 0 0.25rem;
        color: var(--navy-900);
        font-size: 1.1rem;
        font-weight: 700;
      }
      .team-card .role {
        margin: 0;
        color: var(--gold-500);
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      @media (max-width: 900px) {
        .history-grid, .values-section, .team-grid {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .hero h1 { font-size: 2.1rem; }
      }
    `
  ]
})
export class NosotrosLandingComponent {}
