import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { Habitacion } from "../../landing/habitaciones/habitacion.model";

@Injectable({ providedIn: "root" })
export class HabitacionesService {
  private api = inject(ApiService);

  obtenerHabitaciones(): Observable<Habitacion[]> {
    return this.api.get<Habitacion[]>("/habitaciones");
  }
}