import Link from "next/link";
import { getPublicTopics, getPublicAssets } from "@/lib/seo/publicIndex";

export default function HomePage() {
  const publicTopics = getPublicTopics();
  const publicAssets = getPublicAssets();

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
              Recursos imprimibles
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Fichas educativas listas para imprimir
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explora recursos de matemáticas para primaria, organizados por
              tema y preparados para descargar en PDF.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Topics públicos: {publicTopics.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Recursos públicos: {publicAssets.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Explora por tema
            </h2>
            <p className="mt-2 text-slate-600">
              Accede a los recursos disponibles por bloque temático.
            </p>
          </div>

          {publicTopics.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publicTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/tema/${topic.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {topic.description}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-cyan-700">
                    Ver recursos →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              Aún no hay topics públicos generados.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}