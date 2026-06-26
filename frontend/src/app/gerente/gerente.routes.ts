import { Routes } from "@angular/router";

import { GerenteShellComponent } from "./gerente-shell.component";
import { HomeComponent } from "./home/home.component";
import { SectionPageComponent } from "../shared/components/section-page.component";

export const gerenteRoutes: Routes = [
  {
    path: "",
    component: GerenteShellComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "dashboard", component: SectionPageComponent, data: { title: "Dashboard", description: "Vista general de indicadores clave." } },
      { path: "ocupacion", component: SectionPageComponent, data: { title: "Ocupacion", description: "Analisis de ocupacion por periodo." } },
      { path: "ingresos", component: SectionPageComponent, data: { title: "Ingresos", description: "Seguimiento de ingresos del hotel." } },
      { path: "facturacion", component: SectionPageComponent, data: { title: "Facturacion", description: "Monitoreo de procesos de facturacion." } },
      { path: "encuestas", component: SectionPageComponent, data: { title: "Encuestas", description: "Resultados de experiencia de clientes." } },
      { path: "preferencias", component: SectionPageComponent, data: { title: "Preferencias", description: "Tendencias de preferencias de huespedes." } },
      { path: "reportes", component: SectionPageComponent, data: { title: "Reportes", description: "Reportes gerenciales de alto nivel." } }
    ]
  }
];
