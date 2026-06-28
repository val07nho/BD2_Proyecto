import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";

@Injectable({ providedIn: "root" })
export class TrackingService {
  private readonly api = inject(ApiService);
  private searchTimeout: any = null;

  registrarVisita(modulo: string, accion: string): void {
    const idHuespedStr = localStorage.getItem("hrms_id_huesped");
    if (!idHuespedStr) return;
    const idHuesped = Number(idHuespedStr);

    this.api.post(`/historial-cliente/huesped/${idHuesped}/visita`, { modulo, accion }).subscribe({
      error: (err) => console.error("Error al registrar visita:", err)
    });
  }

  registrarBusqueda(texto: string): void {
    if (!texto || !texto.trim()) return;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const idHuespedStr = localStorage.getItem("hrms_id_huesped");
      if (!idHuespedStr) return;
      const idHuesped = Number(idHuespedStr);

      this.api.post(`/historial-cliente/huesped/${idHuesped}/busqueda`, { texto: texto.trim() }).subscribe({
        next: () => console.log(`[Tracking] Búsqueda registrada: "${texto.trim()}"`),
        error: (err) => console.error("Error al registrar búsqueda:", err)
      });
    }, 800); // Debounce de 800ms para evitar spamear por cada tecla
  }
}
