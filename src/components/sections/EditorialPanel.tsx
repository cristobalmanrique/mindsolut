"use client";

import { useEffect, useMemo, useState } from "react";
import { assets as initialAssets } from "@/data/assets";
import { statusList } from "@/data/status";
import { changeStatus, getNextStatuses } from "@/lib/editorial";
import type { AssetItem, StatusKey } from "@/types/content";

type PersistedStatusMap = Record<string, StatusKey>;

export default function EditorialPanel() {
  const [items, setItems] = useState<AssetItem[]>(initialAssets);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const statusMap = useMemo(() => {
    return Object.fromEntries(statusList.map((status) => [status.key, status]));
  }, []);

  useEffect(() => {
    const loadPersistedStatuses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/assets-status");
        const rawText = await response.text();

let result: any;
try {
  result = JSON.parse(rawText);
} catch {
  throw new Error(
    `La API no devolvió JSON válido. Respuesta recibida: ${rawText.slice(0, 200)}`
  );
}

        if (!response.ok) {
          throw new Error(result?.message ?? "Error al cargar estados");
        }

        const persistedMap: PersistedStatusMap = result?.data ?? {};

        const merged = initialAssets.map((asset) => ({
          ...asset,
          status: persistedMap[asset.id] ?? asset.status,
        }));

        setItems(merged);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    loadPersistedStatuses();
  }, []);

  const handleChangeStatus = async (assetId: string, newStatus: StatusKey) => {
  setError("");

  const previousItems = items;

  try {
    const optimisticItems = items.map((asset) =>
      asset.id === assetId ? changeStatus(asset, newStatus) : asset
    );

    setItems(optimisticItems);

    const response = await fetch("/api/admin/update-asset-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assetId,
        newStatus,
      }),
    });

    const rawText = await response.text();

    let result: any;
    try {
      result = JSON.parse(rawText);
    } catch {
      throw new Error(
        `La API no devolvió JSON válido. Respuesta: ${rawText.slice(0, 200)}`
      );
    }

    if (!response.ok) {
      throw new Error(result?.message ?? "No se pudo guardar el estado.");
    }
  } catch (err) {
    setItems(previousItems);
    setError(err instanceof Error ? err.message : "Error desconocido");
  }
};


  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Panel editorial base</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Vista mínima para validar el flujo editorial de los assets.
          Esta versión ya persiste estados en un archivo JSON interno.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-6 text-sm text-slate-300">
          Cargando estados editoriales...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                  Topic
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                  Estado actual
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                  Siguiente estado
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((asset) => {
                const nextStatuses = getNextStatuses(asset.status);

                return (
                  <tr
                    key={asset.id}
                    className="border-b border-slate-800/80 align-top"
                  >
                    <td className="px-4 py-4 text-sm text-white">
                      <div className="font-medium">{asset.title}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {asset.slug}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {asset.type}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {asset.topicId}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">
                        {statusMap[asset.status]?.label ?? asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">
                      {nextStatuses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleChangeStatus(asset.id, status)
                              }
                              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                            >
                              Mover a {statusMap[status]?.label ?? status}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Sin transición disponible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}