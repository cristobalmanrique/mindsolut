"use client";

import { useState } from "react";

type JobState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

async function runJob(url: string, body?: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? "Error interno");
  }
  return data;
}

function ActionCard({
  title,
  description,
  buttonLabel,
  onRun,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onRun: () => Promise<void>;
}) {
  const [job, setJob] = useState<JobState>({ status: "idle", message: "" });

  const handleClick = async () => {
    setJob({ status: "loading", message: "Ejecutando..." });

    try {
      await onRun();
      setJob({ status: "success", message: "Proceso ejecutado correctamente." });
    } catch (error) {
      setJob({
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <button
        type="button"
        onClick={handleClick}
        disabled={job.status === "loading"}
        className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {job.status === "loading" ? "Ejecutando..." : buttonLabel}
      </button>

      {job.message ? (
        <p
          className={`mt-3 text-sm ${
            job.status === "error"
              ? "text-red-300"
              : job.status === "success"
              ? "text-emerald-300"
              : "text-slate-400"
          }`}
        >
          {job.message}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminGeneracionPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Generación interna</h3>
        <p className="mt-2 text-sm text-slate-400">
          Estas acciones no están pensadas para el usuario público. Son utilidades operativas para producción.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          title="Generar PDFs"
          description="Dispara el proceso interno de generación de PDFs para assets en estado draft o ready."
          buttonLabel="Ejecutar generación"
          onRun={() => runJob("/api/admin/generate-pdfs")}
        />

        <ActionCard
          title="Generar previews"
          description="Dispara el proceso interno de creación o regeneración de previews."
          buttonLabel="Generar previews"
          onRun={() => runJob("/api/admin/generate-previews")}
        />
      </div>
    </div>
  );
}
