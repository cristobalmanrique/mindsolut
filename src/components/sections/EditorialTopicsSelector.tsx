"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";

export default function EditorialTopicsSelector() {
  const router = useRouter();

  const availableTopics = useMemo(() => {
    return topics
      .filter((topic) => assets.some((asset) => asset.topicId === topic.id))
      .map((topic) => ({
        ...topic,
        totalAssets: assets.filter((asset) => asset.topicId === topic.id).length,
      }));
  }, []);

  const [selectedTopicId, setSelectedTopicId] = useState(
    availableTopics[0]?.id ?? ""
  );

  const selectedTopic =
    availableTopics.find((topic) => topic.id === selectedTopicId) ?? null;

  function handleGoToTopic() {
    if (!selectedTopicId) {
      return;
    }

    router.push(`/admin/editorial/${selectedTopicId}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">
          Selecciona un topic para gestionar estados
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Elige el topic y entra a la tabla de assets para mover sus estados editoriales.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <label
              htmlFor="editorial-topic-selector"
              className="text-sm font-medium text-slate-200"
            >
              Topic
            </label>

            <select
              id="editorial-topic-selector"
              value={selectedTopicId}
              onChange={(event) => setSelectedTopicId(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
            >
              {availableTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>

            {selectedTopic ? (
              <div className="space-y-1">
                <p className="text-sm text-slate-400">{selectedTopic.description}</p>
                <p className="text-xs text-slate-500">
                  {selectedTopic.totalAssets} asset
                  {selectedTopic.totalAssets === 1 ? "" : "s"}
                </p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleGoToTopic}
            disabled={!selectedTopicId}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gestionar estados
          </button>
        </div>
      </div>
    </div>
  );
}