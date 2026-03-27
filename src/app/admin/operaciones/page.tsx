"use client";

import { useState } from "react";

type JobState = {
  loading: boolean;
  message: string;
  isError: boolean;
};

async function runAction(url: string) {
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Error interno");
  }

  return data;
}

function OperationButton({
  title,
  description,
  endpoint,
}: {
  title: string;
  description: string;
  endpoint: string;
}) {
  const [state, setState] = useState<JobState>({
    loading: false,
    message: "",
    isError: false,
  });

  const onClick = async () => {
    setState({ loading: true, message: "Ejecutando...", isError: false });

    try {
      const data = await runAction(endpoint);
      setState({
        loading: false,
        message: data?.message ?? "Proceso ejecutado correctamente.",
        isError: false,
      });
    } catch (error) {
      setState({
        loading: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        isError: true,
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={state.loading}
        className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white disabled:opacity-60"
      >
        {state.loading ? "Ejecutando..." : "Ejecutar"}
      </button>

      {state.message ? (
        <p className={`mt-3 text-sm ${state.isError ? "text-red-300" : "text-emerald-300"}`}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminOperationsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Operaciones internas</h3>
        <p className="mt-2 text-sm text-slate-400">
          Zona para acciones técnicas que no deben estar expuestas al front público.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OperationButton
          title="Revalidar rutas"
          description="Revalida rutas clave después de cambios estructurales o editoriales."
          endpoint="/api/admin/revalidate-content"
        />

        <OperationButton
          title="Chequeo de archivos"
          description="Valida existencia básica de PDFs y previews según el catálogo."
          endpoint="/api/admin/check-assets"
        />
      </div>
    </div>
  );
}
