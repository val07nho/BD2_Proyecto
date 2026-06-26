import { Routes } from "@angular/router";

import { LandingShellComponent } from "./landing-shell.component";
import { HomeComponent } from "./home/home.component";
import { HabitacionesComponent } from "./habitaciones/habitacion.components";
import { SectionPageComponent } from "../shared/components/section-page.component";

export const landingRoutes: Routes = [
  {
    path: "",
    component: LandingShellComponent,
    children: [
      {
        path: "",
        component: HomeComponent
      },
      {
        path: "habitaciones",
        component: HabitacionesComponent   // 👈 antes era SectionPageComponent
      },
      {
        path: "eventos",
        component: SectionPageComponent,
        data: { title: "Eventos", description: "Explora eventos y paquetes para tu estancia." }
      },
      {
        path: "servicios",
        component: SectionPageComponent,
        data: { title: "Servicios", description: "Conoce los servicios del hotel y beneficios adicionales." }
      },
      {
        path: "nosotros",
        component: SectionPageComponent,
        data: { title: "Nosotros", description: "Historia, vision y equipo del hotel." }
      },
      {
        path: "contacto",
        component: SectionPageComponent,
        data: { title: "Contacto", description: "Contactanos para reservas corporativas o soporte." }
      }
    ]
  }
];