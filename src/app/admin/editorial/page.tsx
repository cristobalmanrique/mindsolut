import EditorialTopicsSelector from "@/components/sections/EditorialTopicsSelector";

export default function AdminEditorialPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
        <h1 className="text-lg font-semibold text-white">Gestión editorial</h1>
        <p className="mt-2 text-sm text-slate-400">
          Selecciona un topic para revisar y mover los estados editoriales de sus assets.
        </p>
      </div>

      <EditorialTopicsSelector />
    </div>
  );
}