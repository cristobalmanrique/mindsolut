import Link from "next/link";
import { assets } from "@/data/assets";
import { bundles } from "@/data/bundles";
import { collections } from "@/data/collections";
import { pages } from "@/data/pages";
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
  const publishedAssets = assets.filter((item) => item.status === "published").length;
  const premiumAssets = assets.filter((item) => item.isPremium).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Assets" value={assets.length} note="Catálogo actual definido en data/assets.ts" />
        <MetricCard title="Bundles" value={bundles.length} note="Packs comerciales y estructurados" />
        <MetricCard title="Collections" value={collections.length} note="Páginas agrupadoras por tema y curso" />
        <MetricCard title="Pages" value={pages.length} note="Páginas indexables y operativas" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Assets premium" value={premiumAssets} note="Activos con valor agregado explícito" />
        <MetricCard title="Assets publicados" value={publishedAssets} note="Activos visibles al usuario final" />
        <MetricCard title="Estados definidos" value={statusList.length} note="Flujo editorial activo" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          href="/admin/editorial"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h3 className="text-lg font-semibold text-white">Panel editorial</h3>
          <p className="mt-2 text-sm text-slate-400">
            Revisar assets y moverlos entre estados del flujo editorial.
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
