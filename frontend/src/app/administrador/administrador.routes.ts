import { Routes } from "@angular/router";

import { AdministradorShellComponent } from "./administrador-shell.component";
import { HomeComponent } from "./home/home.component";
import { HabitacionesAdminComponent } from "./habitaciones/habitaciones-admin.component";
import { AdminCrudPageComponent } from "./admin-crud-page.component";
import { UsuariosAdminComponent } from "./usuarios/usuarios-admin.component";
import { RolesAdminComponent } from "./roles/roles-admin.component";
import { RecomendacionesAdminComponent } from "./recomendaciones/recomendaciones-admin.component";
import { ReportesGerenteComponent } from "../gerente/reportes-gerente.component";

export const administradorRoutes: Routes = [
  {
    path: "",
    component: AdministradorShellComponent,
    children: [
      { path: "", component: HomeComponent },
      { path: "usuarios", component: UsuariosAdminComponent },
      { path: "roles", component: RolesAdminComponent },
      { path: "habitaciones", component: HabitacionesAdminComponent },
      { path: "reservas", component: AdminCrudPageComponent },
      { path: "eventos", component: AdminCrudPageComponent },
      { path: "servicios", component: AdminCrudPageComponent },
      { path: "facturas", component: AdminCrudPageComponent },
      { path: "pagos", component: AdminCrudPageComponent },
      { path: "recomendaciones", component: RecomendacionesAdminComponent },
      { path: "reportes", component: ReportesGerenteComponent, data: { vista: "reportes", title: "Reportes administrativos", area: "Administracion" } }
    ]
  }
];
