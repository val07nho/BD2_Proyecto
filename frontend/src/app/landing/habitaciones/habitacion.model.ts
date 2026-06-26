export interface Habitacion {
  ID_HABITACION: number;
  NUMERO_HABITACION: string;
  TIPO: string;
  PRECIO_NOCHE: number;
  CAPACIDAD: number;
  ESTADO: "Disponible" | "Ocupada" | "Mantenimiento";
}