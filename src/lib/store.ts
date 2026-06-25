"use client";

// Capa de persistencia + estado reactivo. Toda la app vive de useStore().
// Mantenemos todo en localStorage para que la app sea 100% offline.

import { useCallback, useEffect, useState } from "react";
import { AppState, Day, Task } from "./types";
import { todayKey } from "./date";

const STORAGE_KEY = "hoy:state:v1";

function newId(): string {
  // crypto.randomUUID no está disponible en navegadores antiguos o contextos
  // inseguros. Caemos a un id basado en timestamp + random, suficiente para uso
  // local offline.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidDay(value: unknown): value is Day {
  if (!value || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d.date === "string" &&
    typeof d.notes === "string" &&
    Array.isArray(d.tasks) &&
    d.tasks.every(
      (t) =>
        t &&
        typeof t === "object" &&
        typeof (t as Task).id === "string" &&
        typeof (t as Task).text === "string" &&
        typeof (t as Task).done === "boolean" &&
        typeof (t as Task).createdOn === "string",
    )
  );
}

function loadState(): AppState {
  if (typeof window === "undefined") return { days: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { days: {} };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return { days: {} };
    const days = (parsed as { days?: unknown }).days;
    if (!days || typeof days !== "object") return { days: {} };
    const out: AppState = { days: {} };
    for (const [date, day] of Object.entries(days as Record<string, unknown>)) {
      if (isValidDay(day)) out.days[date] = day;
    }
    return out;
  } catch {
    return { days: {} };
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage lleno o deshabilitado: la app sigue funcionando en memoria.
  }
}

export function useStore() {
  const [state, setState] = useState<AppState>({ days: {} });
  const [hydrated, setHydrated] = useState(false);

  // Hidratación: leer de localStorage una sola vez al montar en cliente.
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persistencia automática en cada cambio.
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const getDay = useCallback(
    (date: string): Day => {
      return (
        state.days[date] ?? { date, notes: "", tasks: [] }
      );
    },
    [state],
  );

  const updateDay = useCallback((date: string, patch: Partial<Day>) => {
    setState((prev) => {
      const current = prev.days[date] ?? { date, notes: "", tasks: [] };
      return {
        ...prev,
        days: { ...prev.days, [date]: { ...current, ...patch } },
      };
    });
  }, []);

  const setNotes = useCallback(
    (date: string, notes: string) => updateDay(date, { notes }),
    [updateDay],
  );

  const addTask = useCallback(
    (date: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const task: Task = {
        id: newId(),
        text: trimmed,
        done: false,
        createdOn: date,
      };
      setState((prev) => {
        const current = prev.days[date] ?? { date, notes: "", tasks: [] };
        return {
          ...prev,
          days: {
            ...prev.days,
            [date]: { ...current, tasks: [...current.tasks, task] },
          },
        };
      });
    },
    [],
  );

  const toggleTask = useCallback((date: string, id: string) => {
    setState((prev) => {
      const current = prev.days[date];
      if (!current) return prev;
      const tasks = current.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      );
      return {
        ...prev,
        days: { ...prev.days, [date]: { ...current, tasks } },
      };
    });
  }, []);

  const deleteTask = useCallback((date: string, id: string) => {
    setState((prev) => {
      const current = prev.days[date];
      if (!current) return prev;
      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...current,
            tasks: current.tasks.filter((t) => t.id !== id),
          },
        },
      };
    });
  }, []);

  // Mueve una tarea pendiente a otro día. Si ya estaba movida, la actualiza.
  const moveTask = useCallback(
    (fromDate: string, id: string, toDate: string) => {
      if (fromDate === toDate) return;
      setState((prev) => {
        const source = prev.days[fromDate];
        if (!source) return prev;
        const task = source.tasks.find((t) => t.id === id);
        if (!task || task.done) return prev;

        // Quitar del origen.
        const remainingTasks = source.tasks.filter((t) => t.id !== id);
        const updatedSource: Day = { ...source, tasks: remainingTasks };

        // Insertar al final del destino.
        const target = prev.days[toDate] ?? { date: toDate, notes: "", tasks: [] };
        const updatedTarget: Day = {
          ...target,
          tasks: [
            ...target.tasks,
            { ...task, movedTo: toDate === task.createdOn ? undefined : toDate },
          ],
        };

        return {
          ...prev,
          days: {
            ...prev.days,
            [fromDate]: updatedSource,
            [toDate]: updatedTarget,
          },
        };
      });
    },
    [],
  );

  // Lista de días conocidos ordenados desc (más reciente primero), incluye hoy.
  const knownDays = Object.values(state.days)
    .map((d) => d.date)
    .sort((a, b) => (a < b ? 1 : -1));

  return {
    state,
    hydrated,
    today: todayKey(),
    knownDays,
    getDay,
    setNotes,
    addTask,
    toggleTask,
    deleteTask,
    moveTask,
  };
}