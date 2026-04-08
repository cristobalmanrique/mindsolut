import Link from "next/link";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";
import { statusList } from "@/data/status";

function MetricCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

export default function AdminHomePage() {
  const premiumAssets = assets.filter((item) => item.isPremium).length;
  const readyAssets = assets.filter((item) => item.status === "ready").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Topics" value={topics.length} note="Bloques temáticos activos en el catálogo" />
        <MetricCard title="Assets" value={assets.length} note="Fichas definidas en data/assets.ts" />
        <MetricCard title="Assets premium" value={premiumAssets} note="Fichas con valor agregado explícito" />
        <MetricCard title="Assets listos" value={readyAssets} note="Fichas marcadas como ready" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Estados definidos" value={statusList.length} note="Flujo editorial activo" />
        <MetricCard title="Topics con assets" value={topics.filter((topic) => assets.some((asset) => asset.topicId === topic.id)).length} note="Topics con contenido asociado" />
        <MetricCard title="Idioma base" value="ES" note="Catálogo actual enfocado en primaria" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          href="/admin/editorial"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h3 className="text-lg font-semibold text-white">Panel editorial</h3>
          <p className="mt-2 text-sm text-slate-400">
            Revisar topics, mover estados y borrar assets con sus archivos.
          </p>
        </Link>

        <Link
          href="/admin/generacion"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h3 className="text-lg font-semibold text-white">Generación de PDFs</h3>
          <p className="mt-2 text-sm text-slate-400">
            Ejecutar procesos internos para crear PDFs y previews.
          </p>
        </Link>

        <Link
          href="/admin/operaciones"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h3 className="text-lg font-semibold text-white">Operaciones</h3>
          <p className="mt-2 text-sm text-slate-400">
            Acciones internas para reindexado, revisión y mantenimiento.
          </p>
        </Link>
      </section>
    </div>
  );
}
