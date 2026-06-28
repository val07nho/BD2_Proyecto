import { Routes } from "@angular/router";

import { LandingShellComponent } from "./landing-shell.component";
import { HomeComponent } from "./home/home.component";
import { HabitacionesComponent } from "./habitaciones/habitacion.components";
import { EventosLandingComponent } from "./eventos/eventos-landing.component";
import { ServiciosLandingComponent } from "./servicios/servicios-landing.component";
import { NosotrosLandingComponent } from "./nosotros/nosotros-landing.component";
import { ContactoLandingComponent } from "./contacto/contacto-landing.component";

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
        component: HabitacionesComponent
      },
      {
        path: "eventos",
        component: EventosLandingComponent
      },
      {
        path: "servicios",
        component: ServiciosLandingComponent
      },
      {
        path: "nosotros",
        component: NosotrosLandingComponent
      },
      {
        path: "contacto",
        component: ContactoLandingComponent
      }
    ]
  }
];