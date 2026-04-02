import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/editorial", label: "Editorial" },
    { href: "/admin/generacion-topic", label: "Generación por topic" },
    { href: "/admin/seo-topic", label: "SEO por topic" },
    { href: "/admin/operaciones", label: "Operaciones" },
    { href: "/admin/generacion", label: "Generación (Deprecated)" },
    { href: "/admin/previews-topic", label: "Previews por topic (Deprecated)" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:block">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Mindsolut Admin
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white">Back-office interno</h1>
          </div>

          <nav className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Entorno interno</p>
                <h2 className="text-xl font-semibold text-white">Administración operativa</h2>
              </div>

              <div className="flex flex-wrap gap-2 lg:hidden">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
