"use client";

import { useState } from "react";

type CheckAssetsResult = {
  ok?: boolean;
  job?: string;
  message?: string;
  missingDownloads?: string[];
  missingPreviews?: string[];
};

type JobState = {
  loading: boolean;
  message: string;
  isError: boolean;
  data?: CheckAssetsResult | null;
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
    data: null,
  });

  const onClick = async () => {
    setState({
      loading: true,
      message: "Ejecutando...",
      isError: false,
      data: null,
    });

    try {
      const data = await runAction(endpoint);
      setState({
        loading: false,
        message: data?.message ?? "Proceso ejecutado correctamente.",
        isError: false,
        data,
      });
    } catch (error) {
      setState({
        loading: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        isError: true,
        data: null,
      });
    }
  };

  const missingDownloads = state.data?.missingDownloads ?? [];
  const missingPreviews = state.data?.missingPreviews ?? [];
  const isCheckAssets = endpoint === "/api/admin/check-assets";

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

      {isCheckAssets && !state.isError && state.data ? (
        <div className="mt-4 space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-slate-400">PDFs faltantes</p>
              <p className="mt-2 text-2xl font-bold text-white">{missingDownloads.length}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-slate-400">Previews faltantes</p>
              <p className="mt-2 text-2xl font-bold text-white">{missingPreviews.length}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-semibold text-white">Lista de PDFs faltantes</h4>
              {missingDownloads.length > 0 ? (
                <ul className="mt-3 max-h-64 list-disc space-y-1 overflow-auto pl-5 text-slate-300">
                  {missingDownloads.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-emerald-300">No faltan PDFs.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-semibold text-white">Lista de previews faltantes</h4>
              {missingPreviews.length > 0 ? (
                <ul className="mt-3 max-h-64 list-disc space-y-1 overflow-auto pl-5 text-slate-300">
                  {missingPreviews.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-emerald-300">No faltan previews.</p>
              )}
            </div>
          </div>
        </div>
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