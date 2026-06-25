// Modelo de datos central. Cada día es la unidad; dentro de un día viven
// notas en markdown y tareas. Las tareas tienen un origen (qué día las
// creó) y, opcionalmente, un día donde se arrastraron.

export interface Task {
  id: string;
  text: string;
  done: boolean;
  /** Día donde se creó la tarea. */
  createdOn: string; // YYYY-MM-DD
  /** Si la tarea fue movida hacia adelante, día al que se movió. */
  movedTo?: string; // YYYY-MM-DD
}

export interface Day {
  /** YYYY-MM-DD */
  date: string;
  notes: string;
  tasks: Task[];
}

export interface AppState {
  days: Record<string, Day>; // indexada por date
}