"use client";

import { formatShort, isToday, todayKey } from "@/lib/date";

interface Props {
  days: string[];
  currentDate: string;
  pendingByDate: Record<string, number>;
  onSelect: (date: string) => void;
}

export function Sidebar({ days, currentDate, pendingByDate, onSelect }: Props) {
  const today = todayKey();
  const hasToday = days.some(isToday);

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="p-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          Días
        </h2>
        <ul className="space-y-1">
          {!hasToday && (
            <DayButton
              date={today}
              isCurrent={today === currentDate}
              pending={0}
              onSelect={onSelect}
              badge="hoy"
            />
          )}
          {days.map((d) => (
            <DayButton
              key={d}
              date={d}
              isCurrent={d === currentDate}
              pending={pendingByDate[d] ?? 0}
              onSelect={onSelect}
              badge={isToday(d) ? "hoy" : undefined}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}

function DayButton({
  date,
  isCurrent,
  pending,
  onSelect,
  badge,
}: {
  date: string;
  isCurrent: boolean;
  pending: number;
  onSelect: (d: string) => void;
  badge?: string;
}) {
  return (
    <li>
      <button
        onClick={() => onSelect(date)}
        className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between gap-2 transition ${
          isCurrent
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}
      >
        <span className="truncate">{formatShort(date)}</span>
        <span className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                isCurrent
                  ? "bg-white/20 dark:bg-black/20"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
              }`}
            >
              {badge}
            </span>
          )}
          {pending > 0 && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isCurrent
                  ? "bg-white/20 dark:bg-black/20"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
              }`}
            >
              {pending}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}