import { Routes } from "@angular/router";

import { ClienteShellComponent } from "./cliente-shell.component";
import { HomeComponent } from "./home/home.component";
import { SectionPageComponent } from "../shared/components/section-page.component";
import { HabitacionesClienteComponent } from "./habitaciones/habitaciones-cliente.component";
import { EventosClienteComponent } from "./eventos/eventos-cliente.component";
import { ReservasClienteComponent } from "./reservas/reservas-cliente.component";
import { PerfilClienteComponent } from "./perfil/perfil-cliente.component";
import { FacturasClienteComponent } from "./facturas/facturas-cliente.component";
import { EncuestasClienteComponent } from "./encuestas/encuestas-cliente.component";

export const clienteRoutes: Routes = [
  {
    path: "",
    component: ClienteShellComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "habitaciones", component: HabitacionesClienteComponent },
      { path: "reservas", component: ReservasClienteComponent },
      { path: "eventos", component: EventosClienteComponent },
      { path: "facturas", component: FacturasClienteComponent },
      { path: "perfil", component: PerfilClienteComponent },
      { path: "preferencias", component: SectionPageComponent, data: { title: "Preferencias", description: "Configura preferencias de hospedaje y servicios." } },
      { path: "encuestas", component: EncuestasClienteComponent }
    ]
  }
];
