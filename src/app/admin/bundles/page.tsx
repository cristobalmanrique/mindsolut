"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bundles } from "@/data/bundles";
import { topics } from "@/data/topics";
import type { BundleItem, TopicItem } from "@/types/content";

type TopicOption = {
  id: string;
  label: string;
};

type ApiSummary = {
  total: number;
  generated?: number;
  skipped?: number;
  failed?: number;
  valid?: number;
  invalid?: number;
};

type ApiResponse = {
  ok: boolean;
  mode?: "dry-run";
  topicId?: string;
  error?: string;
  summary?: ApiSummary;
  generated?: Array<Record<string, unknown>>;
  skipped?: Array<Record<string, unknown>>;
  failed?: Array<Record<string, unknown>>;
  valid?: Array<Record<string, unknown>>;
  invalid?: Array<Record<string, unknown>>;
  validation?: {
    valid: number;
    invalid: number;
  };
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function buildTopicLabel(topic: TopicItem) {
  const title = topic.title || topic.slug || topic.id;
  const grade = topic.grade ? ` · ${topic.grade}` : "";
  const subject = topic.subject ? `${topic.subject} · ` : "";

  return `${subject}${title}${grade}`;
}

async function postJson<T>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error(
      typeof (data as Record<string, unknown>).error === "string"
        ? ((data as Record<string, unknown>).error as string)
        : `Request failed: ${response.status}`
    );
  }

  return data;
}

function SummaryCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "danger"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-slate-200 bg-white text-slate-800";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ResultBlock({
  title,
  data,
}: {
  title: string;
  data: unknown;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
        {prettyJson(data)}
      </pre>
    </section>
  );
}

export default function AdminBundlesPage() {
const topicOptions = useMemo<TopicOption[]>(() => {
  return topics.map((topic: TopicItem) => ({
    id: topic.id,
    label: buildTopicLabel(topic),
  }));
}, []);

  const bundleCountByTopic = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};

for (const bundle of bundles) {
  const topicIds = bundle.topicIds ?? [];

  for (const topicId of topicIds) {
    counts[topicId] = (counts[topicId] ?? 0) + 1;
  }
}

    return counts;
  }, []);

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topicOptions[0]?.id ?? ""
  );
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ApiResponse | null>(null);
  const [generationResult, setGenerationResult] = useState<ApiResponse | null>(null);
  const [seoResult, setSeoResult] = useState<ApiResponse | null>(null);

  async function runValidation() {
    if (!selectedTopicId) return;

    setIsBusy(true);
    setStatusMessage("Validando bundles del topic...");
    setValidationResult(null);

    try {
      const result = await postJson<ApiResponse>(
        "/api/admin/bundles/generate-by-topic",
        {
          topicId: selectedTopicId,
          dryRun: true,
        }
      );

      setValidationResult(result);
      setStatusMessage("Validación completada.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Error validando bundles."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function runGeneration() {
    if (!selectedTopicId) return;

    setIsBusy(true);
    setStatusMessage("Generando packs del topic...");
    setGenerationResult(null);

    try {
      const result = await postJson<ApiResponse>(
        "/api/admin/bundles/generate-by-topic",
        {
          topicId: selectedTopicId,
          dryRun: false,
        }
      );

      setGenerationResult(result);
      setStatusMessage("Generación de packs completada.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Error generando packs."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function runSeoGeneration() {
    if (!selectedTopicId) return;

    setIsBusy(true);
    setStatusMessage("Generando payloads SEO del topic...");
    setSeoResult(null);

    try {
      const result = await postJson<ApiResponse>(
        "/api/admin/bundles/seo-by-topic",
        {
          topicId: selectedTopicId,
          dryRun: false,
        }
      );

      setSeoResult(result);
      setStatusMessage("Generación SEO de bundles completada.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Error generando SEO de bundles."
      );
    } finally {
      setIsBusy(false);
    }
  }

  const selectedTopicBundleCount = selectedTopicId
    ? bundleCountByTopic[selectedTopicId] ?? 0
    : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Admin · Bundles
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Flujo editorial, generación y SEO de packs
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Gestiona bundles por topic con un flujo paralelo al de assets:
                validación editorial, generación del cuadernillo completo y
                payload SEO por topic.
              </p>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <SummaryCard
                title="Topics con bundles"
                value={Object.keys(bundleCountByTopic).length}
              />
              <SummaryCard title="Bundles del topic" value={selectedTopicBundleCount} />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label
                htmlFor="topicId"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Topic
              </label>
              <select
                id="topicId"
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={isBusy}
              >
                {topicOptions.length === 0 ? (
                  <option value="">No hay topics disponibles</option>
                ) : (
                  topicOptions.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runValidation}
                disabled={isBusy || !selectedTopicId}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Validar bundles
              </button>

              <button
                type="button"
                onClick={runGeneration}
                disabled={isBusy || !selectedTopicId}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Generar packs
              </button>

              <button
                type="button"
                onClick={runSeoGeneration}
                disabled={isBusy || !selectedTopicId}
                className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Generar SEO
              </button>

              {selectedTopicId ? (
                <Link
                  href={`/admin/bundles/${selectedTopicId}`}
                  className="inline-flex items-center rounded-2xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 shadow-sm transition hover:bg-sky-100"
                >
                  Ver detalle del topic
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {statusMessage || "Selecciona un topic y ejecuta una acción."}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Reglas operativas
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>
                  El pack solo se genera si todos sus assets están en estado
                  <strong className="text-slate-900"> Review</strong>.
                </li>
                <li>
                  El merge toma los PDFs desde
                  <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-900">
                    storage/review
                  </code>
                  .
                </li>
                <li>
                  Los assets usados en packs no pasan a SEO Optimized ni a Ready.
                </li>
                <li>
                  La canonical pública del pack será
                  <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-900">
                    /pack/[slug]
                  </code>
                  .
                </li>
              </ul>
            </div>

            {validationResult?.summary ? (
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  title="Validados"
                  value={validationResult.summary.valid ?? 0}
                  tone="success"
                />
                <SummaryCard
                  title="Inválidos"
                  value={validationResult.summary.invalid ?? 0}
                  tone={
                    (validationResult.summary.invalid ?? 0) > 0
                      ? "danger"
                      : "default"
                  }
                />
              </div>
            ) : null}

            {generationResult?.summary ? (
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard
                  title="Generados"
                  value={generationResult.summary.generated ?? 0}
                  tone="success"
                />
                <SummaryCard
                  title="Omitidos"
                  value={generationResult.summary.skipped ?? 0}
                  tone="warning"
                />
                <SummaryCard
                  title="Fallidos"
                  value={generationResult.summary.failed ?? 0}
                  tone={
                    (generationResult.summary.failed ?? 0) > 0
                      ? "danger"
                      : "default"
                  }
                />
              </div>
            ) : null}

            {seoResult?.summary ? (
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard
                  title="SEO generados"
                  value={seoResult.summary.generated ?? 0}
                  tone="success"
                />
                <SummaryCard
                  title="SEO omitidos"
                  value={seoResult.summary.skipped ?? 0}
                  tone="warning"
                />
                <SummaryCard
                  title="SEO fallidos"
                  value={seoResult.summary.failed ?? 0}
                  tone={
                    (seoResult.summary.failed ?? 0) > 0
                      ? "danger"
                      : "default"
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-6 xl:col-span-2">
            {validationResult ? (
              <ResultBlock title="Resultado de validación" data={validationResult} />
            ) : null}

            {generationResult ? (
              <ResultBlock title="Resultado de generación de packs" data={generationResult} />
            ) : null}

            {seoResult ? (
              <ResultBlock title="Resultado de generación SEO" data={seoResult} />
            ) : null}

            {!validationResult && !generationResult && !seoResult ? (
              <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Sin ejecuciones todavía
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Ejecuta primero una validación del topic para revisar qué
                  bundles pueden generarse antes de lanzar el merge del pack o
                  la escritura de payloads SEO.
                </p>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
