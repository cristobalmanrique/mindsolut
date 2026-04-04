"use client";

import { useEffect, useMemo, useState } from "react";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";
import { statusList } from "@/data/status";
import { getNextStatus, getPreviousStatus } from "@/lib/editorial";

type StatusMap = Record<string, string>;

export default function EditorialPanel() {
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [updatingAssetId, setUpdatingAssetId] = useState<string | null>(null);

  const availableTopics = useMemo(() => {
    return topics.filter((topic) =>
      assets.some((asset) => asset.topicId === topic.id)
    );
  }, []);

  const selectedTopic = useMemo(() => {
    return availableTopics.find((topic) => topic.id === selectedTopicId) ?? null;
  }, [availableTopics, selectedTopicId]);

  const topicAssets = useMemo(() => {
    if (!selectedTopicId) {
      return [];
    }

    return assets
      .filter((asset) => asset.topicId === selectedTopicId)
      .sort((a, b) => a.title.localeCompare(b.title, "es"));
  }, [selectedTopicId]);

  useEffect(() => {
    if (!selectedTopicId && availableTopics.length > 0) {
      setSelectedTopicId(availableTopics[0].id);
    }
  }, [availableTopics, selectedTopicId]);

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

  function getStatusLabel(statusKey: string | null) {
    if (!statusKey) {
      return null;
    }

    return statusList.find((status) => status.key === statusKey)?.label ?? statusKey;
  }

  function handleManageStatesClick(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setShowTable(true);
  }

  function handleStatusChangeClick(
    event: React.MouseEvent<HTMLButtonElement>,
    assetId: string,
    newStatus: string | null
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!newStatus) {
      return;
    }

    void updateStatus(assetId, newStatus);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <p className="text-sm text-slate-300">Cargando estados editoriales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <label
              htmlFor="topic-selector"
              className="text-sm font-medium text-slate-200"
            >
              Topic
            </label>

            <select
              id="topic-selector"
              value={selectedTopicId}
              onChange={(event) => {
                setSelectedTopicId(event.target.value);
                setShowTable(false);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
            >
              {availableTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>

            {selectedTopic ? (
              <p className="text-sm text-slate-400">{selectedTopic.description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleManageStatesClick}
            disabled={!selectedTopicId}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gestionar estados
          </button>
        </div>
      </section>

      {showTable && selectedTopic ? (
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">{selectedTopic.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {topicAssets.length} asset{topicAssets.length === 1 ? "" : "s"} en este
              topic
            </p>
          </div>

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
                {topicAssets.map((asset) => {
                  const currentStatus = statusMap[asset.id] || "draft";
                  const previousStatus = getPreviousStatus(currentStatus);
                  const nextStatus = getNextStatus(currentStatus);
                  const currentStatusLabel = getStatusLabel(currentStatus);
                  const previousStatusLabel = getStatusLabel(previousStatus);
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
                            onClick={(event) =>
                              handleStatusChangeClick(event, asset.id, previousStatus)
                            }
                            className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {previousStatusLabel
                              ? `Anterior: ${previousStatusLabel}`
                              : "Anterior"}
                          </button>

                          <button
                            type="button"
                            disabled={!nextStatus || isUpdating}
                            onClick={(event) =>
                              handleStatusChangeClick(event, asset.id, nextStatus)
                            }
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

                {topicAssets.length === 0 ? (
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
      ) : null}
    </div>
  );
}