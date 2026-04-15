import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { topics } from "@/data/topics";
import { getPublicAssetBySlug, getPublicAssets } from "@/lib/content/publicIndex";
import { buildIntro } from "@/lib/seo/generateSeoPayload";

type ResourcePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type SeoPayload = {
  slug: string;
  assetId: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  previewImage: string;
  fileUrl: string;
  type: string;
  topicId: string;
  language: string;
  accessType: "free" | "premium";
  contentRole: "standard" | "anchor" | "bundle_only";
  printable: boolean;
  sections: {
    intro: string;
    benefits: string[];
    usage: string[];
  };
  generatedAt: string;
};

const SEO_PAGES_DIR = path.join(process.cwd(), "storage", "seo", "pages");

function getSeoPageFilePath(slug: string) {
  return path.join(SEO_PAGES_DIR, `${slug}.json`);
}

function readSeoPayload(slug: string): SeoPayload | null {
  const filePath = getSeoPageFilePath(slug);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SeoPayload;
}

export async function generateStaticParams() {
  return getPublicAssets().map((asset) => ({
    slug: asset.slug,
  }));
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { slug } = await params;
  const publicAsset = getPublicAssetBySlug(slug);

  if (!publicAsset) {
    return {};
  }

  const payload = readSeoPayload(slug);

  if (!payload) {
    return {
      title: publicAsset.title,
      description: publicAsset.description,
    };
  }

  return {
    title: payload.seoTitle,
    description: payload.seoDescription,
    alternates: {
      canonical: payload.canonicalUrl,
    },
    openGraph: {
      title: payload.seoTitle,
      description: payload.seoDescription,
      url: payload.canonicalUrl,
      type: "article",
      images: payload.previewImage
        ? [
            {
              url: payload.previewImage,
              alt: payload.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: payload.seoTitle,
      description: payload.seoDescription,
      images: payload.previewImage ? [payload.previewImage] : [],
    },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const publicAsset = getPublicAssetBySlug(slug);

  if (!publicAsset) {
    notFound();
  }

  const payload = readSeoPayload(slug);

  if (!payload) {
    notFound();
  }

  const topic = topics.find((item) => item.id === publicAsset.topicId) ?? null;
  const topicHref = topic ? `/tema/${topic.id}` : "/";
  const topicLabel = topic?.title ?? "inicio";
  const introText = buildIntro(publicAsset);

  return (
    <main className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
{payload.accessType === "premium" ? "Ficha premium" : "Ficha educativa"}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {payload.title}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {payload.seoDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={payload.fileUrl}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Descargar PDF
              </Link>

              <Link
                href={topicHref}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Volver a {topicLabel}
              </Link>
            </div>

            <article className="mt-10 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <section>
                <h2 className="text-xl font-bold text-slate-900">
                  Descripción de la ficha
                </h2>
                <p className="mt-3 leading-7 text-slate-700">{introText}</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">
                  Beneficios de esta ficha
                </h2>
                <ul className="mt-3 space-y-2 text-slate-700">
                  {payload.sections.benefits.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
                      <span className="mt-1 text-cyan-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">
                  Cómo usar esta ficha
                </h2>
                <ol className="mt-3 space-y-2 text-slate-700">
                  {payload.sections.usage.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
                      <span className="font-semibold text-cyan-700">
                        {index + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </article>
          </section>

          <aside>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Vista previa</h2>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image
                  src={payload.previewImage}
                  alt={payload.title}
                  width={900}
                  height={1200}
                  className="h-auto w-full"
                  priority
                />
              </div>

              <div className="mt-5">
                <Link
                  href={payload.fileUrl}
                  target="_blank"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Descargar ahora
                </Link>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Recurso generado y preparado para publicación. Última actualización:{" "}
                {new Date(payload.generatedAt).toLocaleDateString("es-ES")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
