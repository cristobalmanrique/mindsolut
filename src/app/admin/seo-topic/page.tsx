"use client";

import { useMemo, useState } from "react";
import { topics } from "@/data/topics";

type SeoResponse = {
  ok: boolean;
  topicId: string;
  generatedCount: number;
  skippedCount: number;
  failedCount: number;
  generated: { file: string; reason?: string }[];
  skipped: { file: string; reason?: string }[];
  failed: { file: string; reason?: string }[];
  message: string;
};

export default function AdminSeoByTopicPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResponse | null>(null);
  const [error, setError] = useState("");

  const topicOptions = useMemo(() => topics, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/admin/generate-seo-pages-by-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicId: selectedTopicId,
        }),
      });

      const rawText = await response.text();

      let data: SeoResponse;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `La API no devolvió JSON válido. Respuesta: ${rawText.slice(0, 300)}`
        );
      }

      if (!response.ok) {
        throw new Error(data?.message ?? "Error al generar páginas SEO");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const generated = result?.generated ?? [];
  const skipped = result?.skipped ?? [];
  const failed = result?.failed ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Páginas SEO por topic</h3>
        <p className="mt-2 text-sm text-slate-400">
          Genera los payloads SEO para los slugs de un topic. Solo procesa assets en estado seo-optimized y, al terminar, los mueve a ready.
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
          {loading ? "Generando..." : "Generar páginas SEO del topic"}
        </button>

        {error ? (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        ) : null}
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Generados</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">
                {result.generatedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Saltados</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">
                {result.skippedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Fallidos</p>
              <p className="mt-2 text-3xl font-bold text-red-300">
                {result.failedCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{result.message}</p>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white">Archivos generados</h4>
              {generated.length > 0 ? (
                <ul className="mt-3 max-h-72 list-disc space-y-1 overflow-auto pl-5 text-sm text-slate-300">
                  {generated.map((item, idx) => (
                    <li key={`${item.file}-${idx}`}>{item.file}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No se generaron archivos.
                </p>
              )}
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