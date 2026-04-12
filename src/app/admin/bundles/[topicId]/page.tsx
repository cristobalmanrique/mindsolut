"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { bundles } from "@/data/bundles";
import { topics } from "@/data/topics";
import type { BundleEditorialStatusValue } from "@/lib/bundles/types";

type BundleLike = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  topicIds: string[];
  assetIds: string[];
  status?: string;
  price?: number;
  currency?: string;
};

type TopicLike = {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  subject?: string;
  grade?: string;
};

type BundleStatusRecord = {
  bundleId: string;
  slug: string;
  status: BundleEditorialStatusValue;
  topicIds: string[];
  updatedAt: string;
  notes?: string;
  generatedAt?: string;
  seoGeneratedAt?: string;
  readyAt?: string;
};

type StatusApiResponse = {
  ok: boolean;
  error?: string;
  record?: BundleStatusRecord;
};

type GenerationResponse = {
  ok: boolean;
  error?: string;
  summary?: {
    total: number;
    generated?: number;
    skipped?: number;
    failed?: number;
  };
  generated?: Array<Record<string, unknown>>;
  skipped?: Array<Record<string, unknown>>;
  failed?: Array<Record<string, unknown>>;
};

type ValidationResponse = {
  ok: boolean;
  error?: string;
  valid?: Array<Record<string, unknown>>;
  invalid?: Array<Record<string, unknown>>;
  summary?: {
    total: number;
    valid?: number;
    invalid?: number;
  };
};

const STATUS_OPTIONS: Array<{
  value: BundleEditorialStatusValue;
  label: string;
}> = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "seo-optimized", label: "SEO Optimized" },
  { value: "ready", label: "Ready" },
];

function buildTopicLabel(topic: TopicLike | null) {
  if (!topic) return "Topic";

  const title = topic.title ?? topic.name ?? topic.slug ?? topic.id;
  const subject = topic.subject ? `${topic.subject} · ` : "";
  const grade = topic.grade ? ` · ${topic.grade}` : "";

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

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

async function getJson<T>(url: string) {
  const response = await fetch(url);
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
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

function Badge({
  status,
}: {
  status: BundleEditorialStatusValue | "unknown";
}) {
  const className =
    status === "ready"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "seo-optimized"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : status === "review"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "draft"
      ? "border-slate-200 bg-slate-100 text-slate-700"
      : "border-slate-200 bg-white text-slate-500";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function TopicBundlesPage() {
  const params = useParams<{ topicId: string }>();
  const resolvedTopicId = typeof params?.topicId === "string" ? params.topicId : "";

  const [statusMap, setStatusMap] = useState<Record<string, BundleStatusRecord | null>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [statusDraftMap, setStatusDraftMap] = useState<Record<string, BundleEditorialStatusValue>>(
    {}
  );
  const [busyBundleId, setBusyBundleId] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResponse | null>(null);
  const [seoResult, setSeoResult] = useState<GenerationResponse | null>(null);

  const topic = useMemo(() => {
    return (topics as TopicLike[]).find((item) => item.id === resolvedTopicId) ?? null;
  }, [resolvedTopicId]);

  const topicBundles = useMemo(() => {
    return (bundles as BundleLike[]).filter((bundle) =>
      bundle.topicIds.includes(resolvedTopicId)
    );
  }, [resolvedTopicId]);

  useEffect(() => {
    if (!resolvedTopicId || topicBundles.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadStatuses() {
      const entries = await Promise.all(
        topicBundles.map(async (bundle) => {
          try {
            const result = await getJson<StatusApiResponse>(
              `/api/admin/bundles/status?bundleId=${encodeURIComponent(bundle.id)}`
            );
            return [bundle.id, result.record ?? null] as const;
          } catch {
            return [bundle.id, null] as const;
          }
        })
      );

      if (cancelled) return;

      const nextStatusMap: Record<string, BundleStatusRecord | null> = {};
      const nextNotesMap: Record<string, string> = {};
      const nextDraftMap: Record<string, BundleEditorialStatusValue> = {};

      for (const [bundleId, record] of entries) {
        nextStatusMap[bundleId] = record;
        nextNotesMap[bundleId] = record?.notes ?? "";
        nextDraftMap[bundleId] = record?.status ?? "draft";
      }

      setStatusMap(nextStatusMap);
      setNotesMap(nextNotesMap);
      setStatusDraftMap(nextDraftMap);
    }

    loadStatuses().catch((error) => {
      if (!cancelled) {
        setPageMessage(
          error instanceof Error ? error.message : "No se pudieron cargar los estados."
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [resolvedTopicId, topicBundles]);

  async function refreshBundleStatus(bundleId: string) {
    try {
      const result = await getJson<StatusApiResponse>(
        `/api/admin/bundles/status?bundleId=${encodeURIComponent(bundleId)}`
      );

      setStatusMap((prev) => ({
        ...prev,
        [bundleId]: result.record ?? null,
      }));

      if (result.record) {
        setNotesMap((prev) => ({
          ...prev,
          [bundleId]: result.record?.notes ?? "",
        }));
        setStatusDraftMap((prev) => ({
          ...prev,
          [bundleId]: result.record?.status ?? "draft",
        }));
      }
    } catch {
      setStatusMap((prev) => ({
        ...prev,
        [bundleId]: null,
      }));
    }
  }

  async function saveBundleStatus(bundle: BundleLike) {
    setBusyBundleId(bundle.id);
    setPageMessage(`Actualizando estado de ${bundle.slug}...`);

    try {
      await postJson<StatusApiResponse>("/api/admin/bundles/status", {
        bundleId: bundle.id,
        slug: bundle.slug,
        status: statusDraftMap[bundle.id] ?? "draft",
        notes: notesMap[bundle.id] ?? "",
      });

      await refreshBundleStatus(bundle.id);
      setPageMessage(`Estado actualizado para ${bundle.slug}.`);
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "No se pudo actualizar el estado."
      );
    } finally {
      setBusyBundleId(null);
    }
  }

  async function validateTopicBundles() {
    if (!resolvedTopicId) return;

    setPageMessage("Validando bundles del topic...");
    setValidationResult(null);

    try {
      const result = await postJson<ValidationResponse>(
        "/api/admin/bundles/generate-by-topic",
        {
          topicId: resolvedTopicId,
          dryRun: true,
        }
      );

      setValidationResult(result);
      setPageMessage("Validación completada.");
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Error validando bundles."
      );
    }
  }

  async function generateTopicBundles() {
    if (!resolvedTopicId) return;

    setPageMessage("Generando bundles del topic...");
    setGenerationResult(null);

    try {
      const result = await postJson<GenerationResponse>(
        "/api/admin/bundles/generate-by-topic",
        {
          topicId: resolvedTopicId,
          dryRun: false,
        }
      );

      setGenerationResult(result);
      setPageMessage("Generación completada.");
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Error generando bundles."
      );
    }
  }

  async function generateTopicSeo() {
    if (!resolvedTopicId) return;

    setPageMessage("Generando SEO de bundles...");
    setSeoResult(null);

    try {
      const result = await postJson<GenerationResponse>(
        "/api/admin/bundles/seo-by-topic",
        {
          topicId: resolvedTopicId,
          dryRun: false,
        }
      );

      setSeoResult(result);
      setPageMessage("SEO generado para bundles del topic.");
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Error generando SEO."
      );
    }
  }

  const statusCounters = useMemo(() => {
    const counters: Record<BundleEditorialStatusValue | "unknown", number> = {
      draft: 0,
      review: 0,
      "seo-optimized": 0,
      ready: 0,
      unknown: 0,
    };

    for (const bundle of topicBundles) {
      const status = statusMap[bundle.id]?.status ?? "unknown";
      counters[status] += 1;
    }

    return counters;
  }, [topicBundles, statusMap]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Admin · Bundles por topic
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {buildTopicLabel(topic)}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Vista detallada por topic para revisar estado editorial de cada
                pack, validar elegibilidad y ejecutar generación o SEO por lote.
              </p>
            </div>

            <div className="grid min-w-[320px] grid-cols-2 gap-3">
              <SummaryCard title="Bundles" value={topicBundles.length} />
              <SummaryCard title="Review" value={statusCounters.review} tone="warning" />
              <SummaryCard
                title="SEO Optimized"
                value={statusCounters["seo-optimized"]}
                tone="success"
              />
              <SummaryCard title="Ready" value={statusCounters.ready} tone="success" />
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={validateTopicBundles}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Validar topic
            </button>

            <button
              type="button"
              onClick={generateTopicBundles}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Generar packs del topic
            </button>

            <button
              type="button"
              onClick={generateTopicSeo}
              className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Generar SEO del topic
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {pageMessage || "Sin actividad reciente."}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bundle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cambiar estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {topicBundles.map((bundle) => {
                  const currentStatus = statusMap[bundle.id]?.status ?? "unknown";
                  const updatedAt = statusMap[bundle.id]?.updatedAt;

                  return (
                    <tr key={bundle.id} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{bundle.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{bundle.slug}</div>
                        {bundle.description ? (
                          <div className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                            {bundle.description}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {bundle.assetIds.length} fichas
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {bundle.assetIds.join(", ")}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <Badge status={currentStatus} />
                        <div className="mt-2 text-xs text-slate-500">
                          {updatedAt ? `Actualizado: ${updatedAt}` : "Sin registro"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={statusDraftMap[bundle.id] ?? "draft"}
                          onChange={(event) =>
                            setStatusDraftMap((prev) => ({
                              ...prev,
                              [bundle.id]: event.target.value as BundleEditorialStatusValue,
                            }))
                          }
                          className="w-44 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <textarea
                          value={notesMap[bundle.id] ?? ""}
                          onChange={(event) =>
                            setNotesMap((prev) => ({
                              ...prev,
                              [bundle.id]: event.target.value,
                            }))
                          }
                          rows={3}
                          className="min-w-[240px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          placeholder="Notas editoriales del bundle"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => saveBundleStatus(bundle)}
                          disabled={busyBundleId === bundle.id}
                          className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyBundleId === bundle.id ? "Guardando..." : "Guardar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {topicBundles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No hay bundles asociados a este topic.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          {validationResult ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
              <h2 className="text-lg font-semibold text-slate-950">Validación</h2>
              <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {prettyJson(validationResult)}
              </pre>
            </section>
          ) : null}

          {generationResult ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
              <h2 className="text-lg font-semibold text-slate-950">Generación</h2>
              <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {prettyJson(generationResult)}
              </pre>
            </section>
          ) : null}

          {seoResult ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
              <h2 className="text-lg font-semibold text-slate-950">SEO</h2>
              <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {prettyJson(seoResult)}
              </pre>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
