"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function NotesEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Notas
        </h3>
        <div className="flex gap-1 text-xs">
          <TabButton active={tab === "write"} onClick={() => setTab("write")}>
            Escribir
          </TabButton>
          <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
            Vista previa
          </TabButton>
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe lo que quieras. Soporta markdown: **negrita**, *cursiva*, listas, enlaces..."
          className="w-full min-h-[300px] resize-y rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
        />
      ) : (
        <div className="w-full min-h-[300px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm leading-relaxed prose prose-zinc dark:prose-invert max-w-none">
          {value.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-zinc-400 italic">Nada que previsualizar todavía.</p>
          )}
        </div>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded transition ${
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}