import Link from "next/link";

const footerLinks = [{ label: "Inicio", href: "/" }];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white transition hover:text-cyan-400"
          >
            Mindsolut
          </Link>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Fichas educativas de primaria organizadas por topic.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{new Date().getFullYear()} Mindsolut. Todos los derechos reservados.</p>
          <p>Fichas educativas en evolución.</p>
        </div>
      </div>
    </footer>
  );
}
