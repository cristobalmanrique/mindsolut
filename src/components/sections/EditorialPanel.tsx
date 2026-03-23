"use client";

import { useMemo, useState } from "react";
import { assets as initialAssets } from "@/data/assets";
import { statusList } from "@/data/status";
import { changeStatus, getNextStatuses } from "@/lib/editorial";
import type { AssetItem, StatusKey } from "@/types/content";

export default function EditorialPanel() {
  const [items, setItems] = useState<AssetItem[]>(initialAssets);
  const [error, setError] = useState<string>("");

  const statusMap = useMemo(() => {
    return Object.fromEntries(statusList.map((status) => [status.key, status]));
  }, []);

  const handleChangeStatus = (assetId: string, newStatus: StatusKey) => {
    setError("");

    try {
      setItems((prev) =>
        prev.map((asset) =>
          asset.id === assetId ? changeStatus(asset, newStatus) : asset
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Panel editorial base</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Vista mínima para validar el flujo editorial de los assets. Esta versión
          trabaja en memoria sobre los datos de src/data/assets.ts.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Título</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Topic</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Estado actual</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Siguiente estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((asset) => {
              const nextStatuses = getNextStatuses(asset.status);

              return (
                <tr key={asset.id} className="border-b border-slate-800/80 align-top">
                  <td className="px-4 py-4 text-sm text-white">
                    <div className="font-medium">{asset.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{asset.slug}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">{asset.type}</td>
                  <td className="px-4 py-4 text-sm text-slate-300">{asset.topicId}</td>
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
                            onClick={() => handleChangeStatus(asset.id, status)}
                            className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                          >
                            Mover a {statusMap[status]?.label ?? status}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Sin transición disponible</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
