import fs from "fs";
import { bundles } from "@/data/bundles";
import { topics } from "@/data/topics";
import {
  ensureBundleStorageDirs,
  getBundleCoverAbsolutePath,
  getBundleCoverPublicUrl,
  getBundlePreviewAbsolutePath,
  getBundlePreviewPublicUrl,
  getBundlePublicPdfAbsolutePath,
  getBundlePublicPdfRelativeUrl,
  getBundleSeoAbsolutePath,
} from "@/lib/bundles/bundleStorage";
import { updateBundleEditorialStatus } from "@/lib/bundles/bundleEditorialStatus";
import { validateBundleBySlug } from "@/lib/bundles/bundleWorkflow";
import type {
  BundleSeoBatchResult,
  BundleSeoGenerationItemResult,
  BundleSeoPayload,
} from "@/lib/bundles/types";

function exists(filePath: string) {
  return fs.existsSync(filePath);
}

function getTopic(topicId?: string) {
  return topics.find((topic) => topic.id === topicId);
}

export async function generateBundleSeoPayload(
  slug: string
): Promise<BundleSeoPayload> {
  ensureBundleStorageDirs();

  const bundle = bundles.find((item) => item.slug === slug);

  if (!bundle) {
    throw new Error(`Bundle no encontrado: ${slug}`);
  }

  const validation = await validateBundleBySlug(slug);

  if (!validation.isValid) {
    throw new Error(`El bundle ${slug} no es elegible para SEO.`);
  }

  if (
    !exists(getBundleCoverAbsolutePath(slug)) ||
    !exists(getBundlePreviewAbsolutePath(slug)) ||
    !exists(getBundlePublicPdfAbsolutePath(slug))
  ) {
    throw new Error(`El bundle ${slug} aún no tiene todos los assets generados.`);
  }

  const topic = getTopic(bundle.topicIds?.[0]);
  const canonicalUrl = `https://mindsolut.com/pack/${bundle.slug}`;

  const payload: BundleSeoPayload = {
    id: bundle.id,
    pageType: "bundle",
    slug: bundle.slug,
    title: bundle.title,
    description: bundle.description,
    canonicalUrl,
    metaTitle: bundle.title,
    metaDescription: bundle.description,
    h1: bundle.title,
    intro: `Pack imprimible para ${topic?.grade ?? "primaria"} con ${bundle.assetIds.length} fichas listas para descargar en PDF.`,
    includes: [
      `${bundle.assetIds.length} fichas imprimibles`,
      "Portada del pack",
      "Cuadernillo completo en PDF",
    ],
    benefits: [
      "Ahorra tiempo frente a descargar fichas sueltas",
      "Secuencia de práctica coherente",
      "Útil para aula, tarea y refuerzo",
    ],
    faq: [],
    topicId: topic?.id,
    grade: topic?.grade,
    subject: topic?.subject,
    educationalLevel: topic?.grade,
    price: bundle.price,
    currency: bundle.currency,
    assetIds: bundle.assetIds ?? [],
    coverImage: getBundleCoverPublicUrl(bundle.slug),
    previewImage: getBundlePreviewPublicUrl(bundle.slug),
    pdfUrl: getBundlePublicPdfRelativeUrl(bundle.slug),
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    getBundleSeoAbsolutePath(bundle.slug),
    JSON.stringify(payload, null, 2),
    "utf8"
  );

  updateBundleEditorialStatus({
    bundleId: bundle.id,
    slug: bundle.slug,
    status: "seo-optimized",
  });

  return payload;
}

export async function generateBundleSeoPayloadBySlug(slug: string) {
  return generateBundleSeoPayload(slug);
}

export async function generateBundleSeoPayloadsByTopicId(
  topicId: string
): Promise<BundleSeoBatchResult> {
  const topicBundles = bundles.filter((bundle) =>
    bundle.topicIds?.includes(topicId)
  );

  const generated: BundleSeoGenerationItemResult[] = [];
  const skipped: BundleSeoGenerationItemResult[] = [];
  const failed: BundleSeoGenerationItemResult[] = [];

  for (const bundle of topicBundles) {
    try {
      await generateBundleSeoPayload(bundle.slug);

      generated.push({
        bundleId: bundle.id,
        slug: bundle.slug,
        topicIds: bundle.topicIds ?? [],
        seoPath: getBundleSeoAbsolutePath(bundle.slug),
      });
    } catch (error) {
      failed.push({
        bundleId: bundle.id,
        slug: bundle.slug,
        topicIds: bundle.topicIds ?? [],
        message: error instanceof Error ? error.message : "Error generando SEO.",
      });
    }
  }

  return {
    topicId,
    total: topicBundles.length,
    generated,
    skipped,
    failed,
  };
}

export async function generateBundleSeoPayloadsByTopic(topicId: string) {
  return generateBundleSeoPayloadsByTopicId(topicId);
}