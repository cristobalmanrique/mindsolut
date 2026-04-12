import fs from "fs/promises";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bundles } from "@/data/bundles";
import { topics } from "@/data/topics";
import {
  getBundlePdfPublicUrl,
  getBundleSeoPayloadAbsolutePath,
} from "@/lib/bundles/bundleStorage";

type BundlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type BundleSeoPayload = {
  slug: string;
  title: string;
  description: string;
  canonicalUrl: string;
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  intro?: string;
  benefits?: string[];
  includes?: string[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  topicId?: string;
  grade?: string;
  subject?: string;
  educationalLevel?: string;
};

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readBundleSeoPayload(slug: string): Promise<BundleSeoPayload | null> {
  const seoPath = getBundleSeoPayloadAbsolutePath(slug);

  if (!(await fileExists(seoPath))) {
    return null;
  }

  const raw = await fs.readFile(seoPath, "utf8");
  return JSON.parse(raw) as BundleSeoPayload;
}

function findBundleBySlug(slug: string) {
  return bundles.find((bundle) => bundle.slug === slug) ?? null;
}

function findTopicById(topicId?: string) {
  if (!topicId) return null;
  return topics.find((topic) => topic.id === topicId) ?? null;
}

function buildCanonical(slug: string) {
  return `https://mindsolut.com/pack/${slug}`;
}

function getCoverImage(bundleSlug: string, coverImage?: string) {
  if (coverImage && coverImage.trim()) {
    return coverImage;
  }

  return `/covers/${bundleSlug}.jpg`;
}

export async function generateStaticParams() {
  return bundles.map((bundle) => ({
    slug: bundle.slug,
  }));
}

export async function generateMetadata(
  { params }: BundlePageProps
): Promise<Metadata> {
  const { slug } = await params;
  const bundle = findBundleBySlug(slug);

  if (!bundle) {
    return {};
  }

  const seo = await readBundleSeoPayload(slug);
  const title = seo?.metaTitle ?? seo?.title ?? bundle.title;
  const description = seo?.metaDescription ?? seo?.description ?? bundle.description;
  const canonical = seo?.canonicalUrl ?? buildCanonical(slug);
  const coverImage = getCoverImage(bundle.slug, bundle.coverImage);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: coverImage,
          alt: bundle.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
  };
}

function JsonLd({
  data,
}: {
  data: Record<string, unknown>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

function buildFaqJsonLd(
  canonicalUrl: string,
  faq: BundleSeoPayload["faq"] | undefined
) {
  if (!faq || faq.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: canonicalUrl,
  };
}

function buildBundleJsonLd(input: {
  canonicalUrl: string;
  bundle: NonNullable<ReturnType<typeof findBundleBySlug>>;
  seo: BundleSeoPayload | null;
  topicTitle?: string;
  downloadUrl: string;
  coverImage: string;
}) {
  const { canonicalUrl, bundle, seo, topicTitle, downloadUrl, coverImage } = input;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: seo?.title ?? bundle.title,
    headline: seo?.h1 ?? seo?.title ?? bundle.title,
    description: seo?.description ?? bundle.description,
    inLanguage: bundle.language ?? "es",
    url: canonicalUrl,
    image: coverImage,
    educationalLevel: seo?.educationalLevel ?? seo?.grade ?? undefined,
    learningResourceType: "Printable worksheet bundle",
    isAccessibleForFree: bundle.price === 0,
    offers: {
      "@type": "Offer",
      price: bundle.price,
      priceCurrency: bundle.currency,
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
    about: topicTitle ?? seo?.subject ?? undefined,
    hasPart: bundle.assetIds.map((assetId) => ({
      "@type": "CreativeWork",
      identifier: assetId,
    })),
    distribution: {
      "@type": "DataDownload",
      contentUrl: downloadUrl,
      encodingFormat: "application/pdf",
    },
  };
}

export default async function PackPage({ params }: BundlePageProps) {
  const { slug } = await params;
  const bundle = findBundleBySlug(slug);

  if (!bundle) {
    notFound();
  }

  const seo = await readBundleSeoPayload(slug);
  const topic = findTopicById(
    seo?.topicId ?? bundle.topicIds?.[0]
  );
  const canonicalUrl = seo?.canonicalUrl ?? buildCanonical(slug);
  const downloadUrl = getBundlePdfPublicUrl(bundle.slug);
  const coverImage = getCoverImage(bundle.slug, bundle.coverImage);

  const title = seo?.h1 ?? seo?.title ?? bundle.title;
  const description = seo?.description ?? bundle.description;
  const intro =
    seo?.intro ??
    "Pack educativo imprimible pensado para práctica guiada, refuerzo y trabajo en casa o en clase.";
  const includes =
    seo?.includes && seo.includes.length > 0
      ? seo.includes
      : [
          `${bundle.assetIds.length} fichas imprimibles en PDF`,
          "Portada de pack y cuadernillo completo listo para descargar",
          "Secuencia coherente de práctica dentro del mismo tema",
        ];

  const benefits =
    seo?.benefits && seo.benefits.length > 0
      ? seo.benefits
      : [
          "Ahorra tiempo frente a descargar fichas sueltas",
          "Permite varios días de práctica con una progresión clara",
          "Formato útil para aula, tarea, refuerzo y repaso",
        ];

  const faq = seo?.faq ?? [];
  const bundleJsonLd = buildBundleJsonLd({
    canonicalUrl,
    bundle,
    seo,
    topicTitle: topic?.title,
    downloadUrl,
    coverImage,
  });
  const faqJsonLd = buildFaqJsonLd(canonicalUrl, faq);

  return (
    <main className="bg-slate-50 text-slate-900">
      <JsonLd data={bundleJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm text-slate-500">
          <span>Inicio</span>
          <span className="mx-2">/</span>
          <span>Packs</span>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{bundle.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800">
              Pack imprimible
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {description}
            </p>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
              {intro}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                {bundle.assetIds.length} fichas
              </div>
              {topic?.grade ? (
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {topic.grade}
                </div>
              ) : null}
              {topic?.subject ? (
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {topic.subject}
                </div>
              ) : null}
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                PDF descargable
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={downloadUrl}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Descargar pack
              </Link>

              <Link
                href={canonicalUrl}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                URL pública
              </Link>
            </div>

            <article className="mt-10 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <section>
                <h2 className="text-xl font-bold text-slate-900">
                  Qué incluye este pack
                </h2>
                <ul className="mt-3 space-y-2 text-slate-700">
                  {includes.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
                      <span className="mt-1 text-cyan-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900">
                  Por qué comprar el pack
                </h2>
                <ul className="mt-3 space-y-2 text-slate-700">
                  {benefits.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
                      <span className="mt-1 text-cyan-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {faq.length > 0 ? (
                <section>
                  <h2 className="text-xl font-bold text-slate-900">
                    Preguntas frecuentes
                  </h2>
                  <div className="mt-3 space-y-4">
                    {faq.map((item) => (
                      <article
                        key={item.question}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <h3 className="text-base font-semibold text-slate-900">
                          {item.question}
                        </h3>
                        <p className="mt-2 text-slate-700">{item.answer}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>
          </section>

          <aside>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Vista previa</h2>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <Image
                  src={coverImage}
                  alt={bundle.title}
                  width={900}
                  height={1200}
                  className="h-auto w-full"
                  priority
                />
              </div>

              <div className="mt-5">
                <Link
                  href={downloadUrl}
                  target="_blank"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Descargar ahora
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
