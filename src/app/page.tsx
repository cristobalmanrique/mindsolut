import ContentDebugPanel from "@/components/sections/ContentDebugPanel";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Mindsolut</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Herramientas y recursos para resolver, practicar y aprender.
          </p>
        </div>
      </section>
      <ContentDebugPanel />
    </main>
  );
}