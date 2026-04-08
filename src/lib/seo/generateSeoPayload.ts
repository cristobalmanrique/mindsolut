import { topics } from "@/data/topics";
import type { AssetItem } from "@/types/content";

function getTopicData(topicId: string) {
  return topics.find((topic) => topic.id === topicId) ?? null;
}

function getReadableGrade(asset: AssetItem) {
  const topic = getTopicData(asset.topicId);
  return topic?.grade ?? "primaria";
}

export function buildSeoTitle(asset: AssetItem) {
  return `${asset.title} para imprimir en PDF | Mindsolut`;
}

export function buildSeoDescription(asset: AssetItem) {
  return (
    asset.description ||
    `Descarga ${asset.title.toLowerCase()} en PDF listo para imprimir y practicar.`
  );
}

export function buildIntro(asset: AssetItem) {
  const grade = getReadableGrade(asset);

  return `Esta ficha está pensada para estudiantes de ${grade}, en formato PDF imprimible y con una estructura clara para practicar en casa o en el aula.`;
}

function buildBenefits(asset: AssetItem) {
  return [
    "Formato claro y fácil de imprimir",
    "Ejercicios listos para trabajar en casa o en clase",
    "Recurso visual y práctico para reforzar el aprendizaje",
    asset.isPremium
      ? "Incluye valor pedagógico ampliado dentro del estándar premium"
      : "Ideal como práctica rápida y directa",
  ];
}

function buildUsage(asset: AssetItem) {
  return [
    "Descarga el PDF",
    "Imprime la ficha en tamaño A4",
    "Permite que el estudiante resuelva los ejercicios",
    "Refuerza con más práctica si es necesario",
  ];
}

export function generateSeoPayload(asset: AssetItem) {
  const canonicalUrl = `https://mindsolut.com/recurso/${asset.slug}`;

  return {
    slug: asset.slug,
    assetId: asset.id,
    title: asset.title,
    seoTitle: buildSeoTitle(asset),
    seoDescription: buildSeoDescription(asset),
    canonicalUrl,
    previewImage: asset.previewImage,
    fileUrl: asset.fileUrl,
    type: asset.type,
    topicId: asset.topicId,
    language: asset.language,
    isPremium: asset.isPremium,
    printable: asset.printable,
    sections: {
      intro: buildIntro(asset),
      benefits: buildBenefits(asset),
      usage: buildUsage(asset),
    },
    generatedAt: new Date().toISOString(),
  };
}
