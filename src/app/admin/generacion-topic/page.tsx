"use client";

import { useMemo, useState } from "react";
import { topics } from "@/data/topics";

type GenerateResponse = {
  ok: boolean;
  topicId: string;
  operation: string;
  generatedCount: number;
  skippedCount: number;
  failedCount: number;
  files: string[];
  previews: string[];
  skipped: { file: string; reason: string }[];
  failed: { file: string; reason: string }[];
  message: string;
};

export default function AdminGenerateByTopicPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState("");

  const topicOptions = useMemo(() => topics, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/admin/generate-by-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicId: selectedTopicId,
        }),
      });

      const rawText = await response.text();

      let data: GenerateResponse;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `La API no devolvió JSON válido. Respuesta: ${rawText.slice(0, 300)}`
        );
      }

      if (!response.ok) {
        throw new Error(data?.message ?? "Error al generar assets");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const files = result?.files ?? [];
  const previews = result?.previews ?? [];
  const skipped = result?.skipped ?? [];
  const failed = result?.failed ?? [];
  const generatedCount = result?.generatedCount ?? files.length;
  const skippedCount = result?.skippedCount ?? skipped.length;
  const failedCount = result?.failedCount ?? failed.length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Generación por topic</h3>
        <p className="mt-2 text-sm text-slate-400">
          Selecciona un topic y genera en una sola corrida los PDFs y previews asociados a ese bloque.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <label className="mb-2 block text-sm font-medium text-slate-200">
          Topic
        </label>

        <select
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
        >
          {topicOptions.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title} — {topic.id}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !selectedTopicId}
          className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generando..." : "Generar PDFs y previews del topic"}
        </button>

        {error ? (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        ) : null}
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Operación</p>
              <p className="mt-2 text-sm font-semibold uppercase text-white">
                {result.operation}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Generados</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">
                {generatedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Saltados</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">
                {skippedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Fallidos</p>
              <p className="mt-2 text-3xl font-bold text-red-300">
                {failedCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{result.message}</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-white">PDFs generados</h4>
                {files.length > 0 ? (
                  <ul className="mt-3 max-h-72 list-disc space-y-1 overflow-auto pl-5 text-sm text-slate-300">
                    {files.map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No se generaron PDFs nuevos.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Previews generados</h4>
                {previews.length > 0 ? (
                  <ul className="mt-3 max-h-72 list-disc space-y-1 overflow-auto pl-5 text-sm text-slate-300">
                    {previews.map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No se generaron previews nuevos.
                  </p>
                )}
              </div>
            </div>

            {skipped.length > 0 ? (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white">Saltados</h4>
                <ul className="mt-3 max-h-60 list-disc space-y-1 overflow-auto pl-5 text-sm text-slate-300">
                  {skipped.map((item, idx) => (
                    <li key={`${item.file}-${idx}`}>
                      {item.file} — {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {failed.length > 0 ? (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white">Fallidos</h4>
                <ul className="mt-3 max-h-60 list-disc space-y-1 overflow-auto pl-5 text-sm text-red-300">
                  {failed.map((item, idx) => (
                    <li key={`${item.file}-${idx}`}>
                      {item.file} — {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}