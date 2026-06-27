import { Routes } from "@angular/router";

import { ClienteShellComponent } from "./cliente-shell.component";
import { HomeComponent } from "./home/home.component";
import { SectionPageComponent } from "../shared/components/section-page.component";
import { HabitacionesClienteComponent } from "./habitaciones/habitaciones-cliente.component";
import { EventosClienteComponent } from "./eventos/eventos-cliente.component";
import { ReservasClienteComponent } from "./reservas/reservas-cliente.component";

export const clienteRoutes: Routes = [
  {
    path: "",
    component: ClienteShellComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "habitaciones", component: HabitacionesClienteComponent },
      { path: "reservas", component: ReservasClienteComponent },
      { path: "eventos", component: EventosClienteComponent },
      { path: "facturas", component: SectionPageComponent, data: { title: "Facturas", description: "Consulta tus facturas y estado de pago." } },
      { path: "perfil", component: SectionPageComponent, data: { title: "Perfil", description: "Edita tus datos personales y de contacto." } },
      { path: "preferencias", component: SectionPageComponent, data: { title: "Preferencias", description: "Configura preferencias de hospedaje y servicios." } },
      { path: "encuestas", component: SectionPageComponent, data: { title: "Encuestas", description: "Responde encuestas de satisfaccion del hotel." } }
    ]
  }
];
