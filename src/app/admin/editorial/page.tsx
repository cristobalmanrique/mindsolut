import EditorialPanel from "@/components/sections/EditorialPanel";

export default function AdminEditorialPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Gestión editorial</h3>
        <p className="mt-2 text-sm text-slate-400">
          Esta página reutiliza el panel editorial base actual para mover assets entre estados.
        </p>
      </div>

      <EditorialPanel />
    </div>
  );
}
