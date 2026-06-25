"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { addDays } from "@/lib/date";

interface Props {
  date: string;
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, toDate: string) => void;
}

export function Tasks({ date, tasks, onAdd, onToggle, onDelete, onMove }: Props) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
        Tareas{" "}
        {pending.length > 0 && (
          <span className="font-mono text-zinc-400">({pending.length})</span>
        )}
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Añadir tarea..."
          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition"
        >
          Añadir
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-400 italic px-1">
          Sin tareas todavía. Añade la primera arriba.
        </p>
      ) : (
        <ul className="space-y-1">
          {pending.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              date={date}
              onToggle={onToggle}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
          {done.length > 0 && (
            <>
              <li className="pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-400">
                Hechas
              </li>
              {done.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  date={date}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onMove={onMove}
                />
              ))}
            </>
          )}
        </ul>
      )}
    </section>
  );
}

function TaskRow({
  task,
  date,
  onToggle,
  onDelete,
  onMove,
}: {
  task: Task;
  date: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, toDate: string) => void;
}) {
  const [showMove, setShowMove] = useState(false);
  const tomorrow = addDays(date, 1);

  return (
    <li className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 cursor-pointer accent-zinc-900 dark:accent-white"
      />
      <span
        className={`flex-1 text-sm ${
          task.done ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"
        }`}
      >
        {task.text}
        {task.movedTo && task.movedTo !== date && (
          <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
            arrastrada
          </span>
        )}
      </span>

      {!task.done && (
        <div className="relative">
          <button
            onClick={() => setShowMove((s) => !s)}
            className="opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
            title="Mover a otro día"
          >
            →
          </button>
          {showMove && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg p-1 min-w-[160px]">
              <button
                onClick={() => {
                  onMove(task.id, tomorrow);
                  setShowMove(false);
                }}
                className="w-full text-left text-xs px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Mañana
              </button>
              {[2, 3, 7].map((n) => {
                const target = addDays(date, n);
                return (
                  <button
                    key={target}
                    onClick={() => {
                      onMove(task.id, target);
                      setShowMove(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    En {n} días
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition"
        title="Eliminar"
      >
        ✕
      </button>
    </li>
  );
}