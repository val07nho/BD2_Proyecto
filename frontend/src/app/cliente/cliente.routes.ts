import { Routes } from "@angular/router";

import { ClienteShellComponent } from "./cliente-shell.component";
import { HomeComponent } from "./home/home.component";
import { SectionPageComponent } from "../shared/components/section-page.component";

export const clienteRoutes: Routes = [
  {
    path: "",
    component: ClienteShellComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "habitaciones", component: SectionPageComponent, data: { title: "Habitaciones", description: "Consulta habitaciones disponibles para tus fechas." } },
      { path: "reservas", component: SectionPageComponent, data: { title: "Reservas", description: "Gestiona tus reservas activas y tu historial." } },
      { path: "eventos", component: SectionPageComponent, data: { title: "Eventos", description: "Revisa eventos y registra tu participacion." } },
      { path: "facturas", component: SectionPageComponent, data: { title: "Facturas", description: "Consulta tus facturas y estado de pago." } },
      { path: "perfil", component: SectionPageComponent, data: { title: "Perfil", description: "Edita tus datos personales y de contacto." } },
      { path: "preferencias", component: SectionPageComponent, data: { title: "Preferencias", description: "Configura preferencias de hospedaje y servicios." } },
      { path: "encuestas", component: SectionPageComponent, data: { title: "Encuestas", description: "Responde encuestas de satisfaccion del hotel." } }
    ]
  }
];
