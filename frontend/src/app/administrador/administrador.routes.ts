import { Routes } from "@angular/router";

import { AdministradorShellComponent } from "./administrador-shell.component";
import { HomeComponent } from "./home/home.component";
import { SectionPageComponent } from "../shared/components/section-page.component";

export const administradorRoutes: Routes = [
  {
    path: "",
    component: AdministradorShellComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "usuarios", component: SectionPageComponent, data: { title: "Usuarios", description: "Gestion de usuarios del sistema." } },
      { path: "roles", component: SectionPageComponent, data: { title: "Roles", description: "Asignacion y control de roles." } },
      { path: "habitaciones", component: SectionPageComponent, data: { title: "Habitaciones", description: "Administracion del inventario de habitaciones." } },
      { path: "reservas", component: SectionPageComponent, data: { title: "Reservas", description: "Control operativo de reservas." } },
      { path: "eventos", component: SectionPageComponent, data: { title: "Eventos", description: "Programacion y gestion de eventos." } },
      { path: "servicios", component: SectionPageComponent, data: { title: "Servicios", description: "Gestion de servicios disponibles en hotel." } },
      { path: "facturas", component: SectionPageComponent, data: { title: "Facturas", description: "Administracion de facturacion." } },
      { path: "pagos", component: SectionPageComponent, data: { title: "Pagos", description: "Registro y validacion de pagos." } },
      { path: "reportes", component: SectionPageComponent, data: { title: "Reportes", description: "Reportes administrativos y operativos." } }
    ]
  }
];
