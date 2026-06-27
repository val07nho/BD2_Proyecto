import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-admin-home",
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <div class="breadcrumb">Inicio</div>

      <div class="welcome-card">
        <div class="welcome-content">
          <span class="eyebrow">Bienvenido al</span>
          <h2>Portal Administrador</h2>
          <span class="title-line"></span>
          <p>
            Desde aquí puedes gestionar todos los módulos del sistema de
            Aurea Resort & Spa de manera eficiente, segura y organizada.
          </p>

          <div class="date-badge">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M3 9.5h18"/>
                <path d="M8 3v4"/>
                <path d="M16 3v4"/>
              </svg>
              {{ formattedDate }}
            </span>
            <span class="divider"></span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3.5 2"/>
              </svg>
              {{ formattedTime }}
            </span>
          </div>
        </div>

        <div class="welcome-emblem">
          <svg viewBox="0 0 160 160" class="laurel" aria-hidden="true">
            <path d="M70 26 L75 14 L80 24 L85 14 L90 26 Z"/>

            <path d="M48 96 Q36 90 36 78 Q36 66 44 58"/>
            <ellipse cx="42" cy="62" rx="5" ry="9.5" transform="rotate(-35 42 62)"/>
            <ellipse cx="37" cy="74" rx="5" ry="9.5" transform="rotate(-18 37 74)"/>
            <ellipse cx="35" cy="87" rx="5" ry="9.5" transform="rotate(0 35 87)"/>
            <ellipse cx="38" cy="100" rx="5" ry="9.5" transform="rotate(18 38 100)"/>
            <ellipse cx="44" cy="112" rx="5" ry="9.5" transform="rotate(35 44 112)"/>

            <path d="M112 96 Q124 90 124 78 Q124 66 116 58"/>
            <ellipse cx="118" cy="62" rx="5" ry="9.5" transform="rotate(35 118 62)"/>
            <ellipse cx="123" cy="74" rx="5" ry="9.5" transform="rotate(18 123 74)"/>
            <ellipse cx="125" cy="87" rx="5" ry="9.5" transform="rotate(0 125 87)"/>
            <ellipse cx="122" cy="100" rx="5" ry="9.5" transform="rotate(-18 122 100)"/>
            <ellipse cx="116" cy="112" rx="5" ry="9.5" transform="rotate(-35 116 112)"/>
          </svg>
          <span>A</span>
        </div>
      </div>

      <section class="kpi-grid">
        <article class="kpi-card">
          <div>
            <span class="kpi-label">Reservas activas</span>
            <strong>56</strong>
            <small>+12 vs. ayer</small>
          </div>
          <span class="kpi-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <path d="M3 9.5h18"/>
              <path d="M8 3v4"/>
              <path d="M16 3v4"/>
            </svg>
          </span>
        </article>

        <article class="kpi-card">
          <div>
            <span class="kpi-label">Habitaciones ocupadas</span>
            <strong>78%</strong>
            <small>+5% vs. ayer</small>
          </div>
          <span class="kpi-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
              <path d="M3 18v2"/>
              <path d="M21 18v2"/>
              <path d="M3 13h18"/>
              <path d="M7 13V9.5A1.5 1.5 0 0 1 8.5 8h2A1.5 1.5 0 0 1 12 9.5V13"/>
            </svg>
          </span>
        </article>

        <article class="kpi-card">
          <div>
            <span class="kpi-label">Ingresos del día</span>
            <strong>S/ 24,850</strong>
            <small>+8.2% vs. ayer</small>
          </div>
          <span class="kpi-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v10"/>
              <path d="M15 9.5c0-1.4-1.3-2.3-3-2.3s-3 .9-3 2.1c0 1.3 1.2 1.8 3 2.2 2 .5 3.3 1 3.3 2.4 0 1.3-1.4 2.1-3.3 2.1-1.8 0-3.1-.8-3.3-2.1"/>
            </svg>
          </span>
        </article>

        <article class="kpi-card">
          <div>
            <span class="kpi-label">Check-in hoy</span>
            <strong>23</strong>
            <small>+4 vs. ayer</small>
          </div>
          <span class="kpi-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="8" r="3.2"/>
              <path d="M2.8 19.5c.6-3.4 3-5.5 6.2-5.5 1 0 1.9.18 2.7.5"/>
              <path d="M15.5 13.5l2 2 3.5-4"/>
            </svg>
          </span>
        </article>
      </section>

      <section class="modules-section">
        <h3>Módulos del sistema</h3>

        <div class="module-grid">
          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="8" r="3.2"/>
                <path d="M2.8 19.5c.6-3.4 3-5.5 6.2-5.5s5.6 2.1 6.2 5.5"/>
                <path d="M16.2 6.2a3.2 3.2 0 0 1 0 6.3"/>
                <path d="M18.6 14.3c2.3.6 3.9 2.3 4.3 5.2h-3.4"/>
              </svg>
            </span>
            <h4>Usuarios</h4>
            <p>Gestiona clientes, gerentes y administradores.</p>
          </article>

          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3 5 5.8v5.4c0 4.4 2.8 8.2 7 9.8 4.2-1.6 7-5.4 7-9.8V5.8L12 3z"/>
              </svg>
            </span>
            <h4>Roles</h4>
            <p>Administra permisos y asignación de roles.</p>
          </article>

          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
                <path d="M3 18v2"/>
                <path d="M21 18v2"/>
                <path d="M3 13h18"/>
                <path d="M7 13V9.5A1.5 1.5 0 0 1 8.5 8h2A1.5 1.5 0 0 1 12 9.5V13"/>
              </svg>
            </span>
            <h4>Habitaciones</h4>
            <p>Controla inventario, disponibilidad y estado.</p>
          </article>

          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 16a9 9 0 0 1 18 0"/>
                <path d="M2.5 16h19"/>
                <path d="M12 7V4"/>
                <path d="M10 4h4"/>
              </svg>
            </span>
            <h4>Servicios</h4>
            <p>Gestiona los servicios disponibles del hotel.</p>
          </article>

          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z"/>
                <path d="M8.5 8h7"/>
                <path d="M8.5 11.5h7"/>
                <path d="M8.5 15h4.5"/>
              </svg>
            </span>
            <h4>Facturas</h4>
            <p>Administra facturación y comprobantes.</p>
          </article>

          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2.5" y="5.5" width="19" height="13" rx="2.2"/>
                <path d="M2.5 10h19"/>
                <path d="M6 14.5h5"/>
              </svg>
            </span>
            <h4>Pagos</h4>
            <p>Registra, valida y consulta pagos realizados.</p>
          </article>

          <article class="module-card">
            <span class="module-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 20h16"/>
                <path d="M7 20v-7"/>
                <path d="M12 20V6"/>
                <path d="M17 20v-11"/>
              </svg>
            </span>
            <h4>Reportes</h4>
            <p>Visualiza reportes operativos y financieros.</p>
          </article>
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host {
      --navy-950: #061A2E;
      --navy-900: #0B2540;
      --navy-800: #123456;
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

    * {
      box-sizing: border-box;
    }

    .dashboard {
      display: grid;
      gap: 1.1rem;
    }

    .breadcrumb {
      font-weight: 700;
      font-size: .95rem;
      color: var(--navy-900);
    }

    .welcome-card {
      position: relative;
      overflow: hidden;
      min-height: 270px;
      border-radius: 26px;
      background:
        radial-gradient(circle at 82% 28%, rgba(201,162,39,.18), transparent 22%),
        linear-gradient(135deg, var(--navy-950), var(--navy-800));
      color: white;
      padding: 2.2rem 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      box-shadow: var(--shadow);
    }

    .welcome-card::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px);
      background-size: 34px 34px;
      opacity: .18;
      pointer-events: none;
    }

    .welcome-content {
      position: relative;
      z-index: 1;
      max-width: 720px;
    }

    .eyebrow {
      display: inline-block;
      color: var(--gold-300);
      text-transform: uppercase;
      letter-spacing: .16em;
      font-size: .78rem;
      font-weight: 900;
      margin-bottom: .65rem;
    }

    h2 {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 2.45rem;
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -.02em;
    }

    .title-line {
      display: block;
      width: 74px;
      height: 3px;
      border-radius: 99px;
      background: var(--gold-500);
      margin: 1rem 0;
    }

    .welcome-content p {
      margin: 0;
      max-width: 640px;
      color: rgba(255,255,255,.82);
      font-size: 1rem;
      line-height: 1.7;
    }

    .date-badge {
      display: inline-flex;
      align-items: center;
      gap: .7rem;
      margin-top: 1.3rem;
      padding: .55rem .95rem;
      border-radius: 999px;
      background: rgba(201,162,39,.16);
      border: 1px solid rgba(227,199,126,.35);
      color: var(--gold-300);
      font-size: .82rem;
      font-weight: 700;
    }

    .date-badge span {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
    }

    .date-badge svg {
      width: 15px;
      height: 15px;
    }

    .date-badge .divider {
      width: 1px;
      height: 14px;
      background: rgba(227,199,126,.35);
    }

    .welcome-emblem {
      position: relative;
      z-index: 1;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      border: 1px solid rgba(227,199,126,.45);
      background: rgba(255,255,255,.06);
      box-shadow: inset 0 0 40px rgba(201,162,39,.08);
      flex: 0 0 auto;
    }

    .welcome-emblem .laurel {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      color: var(--gold-300);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.4;
    }

    .welcome-emblem span {
      position: relative;
      z-index: 1;
      font-family: 'Playfair Display', serif;
      font-size: 4.4rem;
      color: var(--gold-300);
      font-weight: 800;
      line-height: 1;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .kpi-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 1.35rem 1.45rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: var(--shadow);
      transition: .22s ease;
    }

    .kpi-card:hover {
      transform: translateY(-3px);
      border-color: rgba(201,162,39,.45);
    }

    .kpi-label {
      display: block;
      color: var(--text-900);
      font-size: .9rem;
      font-weight: 800;
      margin-bottom: .55rem;
    }

    .kpi-card strong {
      display: block;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      line-height: 1;
      margin-bottom: .45rem;
    }

    .kpi-card small {
      color: var(--gold-500);
      font-weight: 800;
      font-size: .78rem;
    }

    .kpi-icon {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: var(--cream-50);
      color: var(--gold-500);
      border: 1px solid rgba(201,162,39,.16);
      flex: 0 0 auto;
    }

    .kpi-icon svg {
      width: 26px;
      height: 26px;
    }

    .modules-section {
      display: grid;
      gap: 1rem;
      margin-top: .4rem;
    }

    .modules-section h3 {
      margin: 0;
      color: var(--navy-900);
      font-family: 'Playfair Display', serif;
      font-size: 1.7rem;
      line-height: 1;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: .9rem;
    }

    .module-card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 1.25rem 1rem;
      text-align: center;
      box-shadow: 0 14px 28px rgba(11,37,64,.07);
      transition: .22s ease;
    }

    .module-card:hover {
      transform: translateY(-4px);
      border-color: rgba(201,162,39,.55);
      box-shadow: 0 20px 36px rgba(11,37,64,.11);
    }

    .module-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto .8rem;
      border-radius: 18px;
      display: grid;
      place-items: center;
      color: var(--gold-500);
      background: linear-gradient(180deg, #fff, var(--cream-50));
      border: 1px solid rgba(201,162,39,.18);
    }

    .module-icon svg {
      width: 27px;
      height: 27px;
    }

    .module-card h4 {
      margin: 0 0 .45rem;
      color: var(--navy-900);
      font-size: .98rem;
      font-weight: 900;
    }

    .module-card p {
      margin: 0;
      color: var(--text-600);
      font-size: .78rem;
      line-height: 1.45;
    }

    @media (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .module-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 760px) {
      .welcome-card {
        flex-direction: column;
        align-items: flex-start;
        padding: 1.6rem;
      }

      .welcome-emblem {
        width: 110px;
        height: 110px;
      }

      .welcome-emblem span {
        font-size: 3rem;
      }

      h2 {
        font-size: 2rem;
      }

      .kpi-grid,
      .module-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  now = new Date();
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timer = setInterval(() => (this.now = new Date()), 60000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  get formattedDate(): string {
    return this.now.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  get formattedTime(): string {
    return this.now.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}