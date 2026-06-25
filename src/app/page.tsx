"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Tasks } from "@/components/Tasks";
import { NotesEditor } from "@/components/NotesEditor";
import { useStore } from "@/lib/store";
import { addDays, formatHuman, isToday, todayKey } from "@/lib/date";
import { Day } from "@/lib/types";

export default function Home() {
  const store = useStore();
  const [currentDate, setCurrentDate] = useState<string>(() => todayKey());

  // Tareas pendientes por día para los badges de la sidebar.
  const pendingByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const day of Object.values(store.state.days)) {
      const pending = day.tasks.filter((t) => !t.done).length;
      if (pending > 0) map[day.date] = pending;
    }
    return map;
  }, [store.state]);

  const day: Day = store.getDay(currentDate);
  const showTodayBanner = !isToday(currentDate);

  if (!store.hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-400 text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        days={store.knownDays}
        currentDate={currentDate}
        pendingByDate={pendingByDate}
        onSelect={setCurrentDate}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
          <header className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight capitalize">
                {formatHuman(currentDate)}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                {currentDate}
              </p>
            </div>
            {showTodayBanner && (
              <button
                onClick={() => setCurrentDate(todayKey())}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Ir a hoy
              </button>
            )}
          </header>

          <NotesEditor
            value={day.notes}
            onChange={(v) => store.setNotes(currentDate, v)}
          />

          <Tasks
            date={currentDate}
            tasks={day.tasks}
            onAdd={(t) => store.addTask(currentDate, t)}
            onToggle={(id) => store.toggleTask(currentDate, id)}
            onDelete={(id) => store.deleteTask(currentDate, id)}
            onMove={(id, to) => store.moveTask(currentDate, id, to)}
          />

          <UpNextSummary
            fromDate={currentDate}
            getDay={store.getDay}
          />

          <footer className="pt-8 pb-4 text-xs text-zinc-400 text-center border-t border-zinc-100 dark:border-zinc-900">
            Hoy · todo se guarda localmente en tu navegador
          </footer>
        </div>
      </main>
    </div>
  );
}

function UpNextSummary({
  fromDate,
  getDay,
}: {
  fromDate: string;
  getDay: (d: string) => Day;
}) {
  // Saca tareas pendientes de los próximos 6 días desde fromDate.
  const days = Array.from({ length: 6 }, (_, i) => addDays(fromDate, i + 1));
  const lines = days
    .map((d) => ({
      date: d,
      tasks: getDay(d).tasks.filter((t) => !t.done),
    }))
    .filter((x) => x.tasks.length > 0);

  if (lines.length === 0) return null;

  return (
    <section className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
        Vienen después
      </h3>
      <ul className="space-y-2">
        {lines.map(({ date, tasks }) => (
          <li key={date}>
            <div className="text-[11px] font-mono text-zinc-500">{date}</div>
            <ul className="mt-1">
              {tasks.map((t) => (
                <li key={t.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                  · {t.text}
                  {t.movedTo && (
                    <span className="ml-1 text-[10px] text-amber-700 dark:text-amber-400">
                      (arrastrada desde {t.createdOn})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}