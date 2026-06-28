import { Routes } from "@angular/router";

import { GerenteShellComponent } from "./gerente-shell.component";
import { ReportesGerenteComponent } from "./reportes-gerente.component";

export const gerenteRoutes: Routes = [
  {
    path: "",
    component: GerenteShellComponent,
    children: [
      { path: "", component: ReportesGerenteComponent, data: { vista: "dashboard", title: "Dashboard gerencial" } },
      { path: "dashboard", component: ReportesGerenteComponent, data: { vista: "dashboard", title: "Dashboard gerencial" } },
      { path: "ocupacion", component: ReportesGerenteComponent, data: { vista: "ocupacion", title: "Analisis de ocupacion" } },
      { path: "ingresos", component: ReportesGerenteComponent, data: { vista: "ingresos", title: "Ingresos del hotel" } },
      { path: "facturacion", component: ReportesGerenteComponent, data: { vista: "facturacion", title: "Facturacion" } },
      { path: "encuestas", component: ReportesGerenteComponent, data: { vista: "encuestas", title: "Encuestas de satisfaccion" } },
      { path: "preferencias", component: ReportesGerenteComponent, data: { vista: "preferencias", title: "Preferencias de huespedes" } },
      { path: "reportes", component: ReportesGerenteComponent, data: { vista: "reportes", title: "Reportes ejecutivos" } }
    ]
  }
];
