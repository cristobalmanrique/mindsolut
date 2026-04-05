"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";
import { statusList } from "@/data/status";
import { getNextStatus, getPreviousStatus } from "@/lib/editorial";

type StatusMap = Record<string, string>;

type TopicEditorialTableProps = {
  topicId: string;
};

export default function TopicEditorialTable({
  topicId,
}: TopicEditorialTableProps) {
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [loading, setLoading] = useState(true);
  const [updatingAssetId, setUpdatingAssetId] = useState<string | null>(null);

  const topic = useMemo(
    () => topics.find((item) => item.id === topicId) ?? null,
    [topicId]
  );

  const statusOrderMap = useMemo(() => {
    return new Map(statusList.map((status, index) => [status.key, index]));
  }, []);

  const topicAssets = useMemo(() => {
    return assets
      .filter((asset) => asset.topicId === topicId)
      .sort((a, b) => {
        const statusA = statusMap[a.id] || "draft";
        const statusB = statusMap[b.id] || "draft";
        const orderA = statusOrderMap.get(statusA) ?? Number.MAX_SAFE_INTEGER;
        const orderB = statusOrderMap.get(statusB) ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return a.title.localeCompare(b.title, "es");
      });
  }, [topicId, statusMap, statusOrderMap]);

  useEffect(() => {
    async function loadStatuses() {
      try {
        const response = await fetch("/api/admin/assets-status", {
          method: "GET",
          cache: "no-store",
        });

        const json = await response.json();
        setStatusMap(json.data || {});
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void loadStatuses();
  }, []);

  function getStatusLabel(statusKey: string | null) {
    if (!statusKey) return null;

    return statusList.find((status) => status.key === statusKey)?.label ?? statusKey;
  }

  async function updateStatus(assetId: string, newStatus: string) {
    const previousStatus = statusMap[assetId] || "draft";

    setUpdatingAssetId(assetId);
    setStatusMap((prev) => ({
      ...prev,
      [assetId]: newStatus,
    }));

    try {
      const response = await fetch("/api/admin/update-asset-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ assetId, newStatus }),
      });

      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.message || "No se pudo actualizar el estado.");
      }

      if (json.data && typeof json.data === "object") {
        setStatusMap(json.data);
      }
    } catch (error) {
      setStatusMap((prev) => ({
        ...prev,
        [assetId]: previousStatus,
      }));

      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar el estado."
      );
    } finally {
      setUpdatingAssetId(null);
    }
  }

  if (!topic) {
    return (
      <div className="rounded-2xl border border-red-900 bg-red-950/40 px-5 py-4">
        <p className="text-sm text-red-200">El topic solicitado no existe.</p>
        <div className="mt-4">
          <Link
            href="/admin/editorial"
            className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al editorial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">{topic.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{topic.description}</p>
          <p className="mt-2 text-xs text-slate-500">
            {topicAssets.length} asset{topicAssets.length === 1 ? "" : "s"}
          </p>
        </div>

        <Link
          href="/admin/editorial"
          className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Regresar al editorial
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Estado actual
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Mover estado
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    Cargando estados editoriales...
                  </td>
                </tr>
              ) : null}

              {!loading &&
                topicAssets.map((asset) => {
                  const currentStatus = statusMap[asset.id] || "draft";
                  const previousStatus = getPreviousStatus(currentStatus);
                  const nextStatus = getNextStatus(currentStatus);
                  const previousStatusLabel = getStatusLabel(previousStatus);
                  const currentStatusLabel = getStatusLabel(currentStatus);
                  const nextStatusLabel = getStatusLabel(nextStatus);
                  const isUpdating = updatingAssetId === asset.id;

                  return (
                    <tr key={asset.id} className="align-top">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {asset.title}
                          </p>

                          {asset.description ? (
                            <p className="mt-1 max-w-xl text-sm text-slate-400">
                              {asset.description}
                            </p>
                          ) : null}

                          <p className="mt-2 text-xs text-slate-500">{asset.slug}</p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm font-medium text-slate-200">
                          {currentStatusLabel}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!previousStatus || isUpdating}
                            onClick={() => {
                              if (previousStatus) {
                                void updateStatus(asset.id, previousStatus);
                              }
                            }}
                            className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {previousStatusLabel
                              ? `Anterior: ${previousStatusLabel}`
                              : "Anterior"}
                          </button>

                          <button
                            type="button"
                            disabled={!nextStatus || isUpdating}
                            onClick={() => {
                              if (nextStatus) {
                                void updateStatus(asset.id, nextStatus);
                              }
                            }}
                            className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {nextStatusLabel
                              ? `Siguiente: ${nextStatusLabel}`
                              : "Siguiente"}
                          </button>
                        </div>

                        {isUpdating ? (
                          <p className="mt-2 text-xs text-cyan-400">Actualizando...</p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}

              {!loading && topicAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    No hay assets asociados a este topic.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
