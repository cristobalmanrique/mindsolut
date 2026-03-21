import { BundleItem } from "@/types/content";

export const bundles: BundleItem[] = [
  {
    id: "bundle-sumas-iniciales",
    slug: "bundle-sumas-iniciales",
    title: "Bundle de sumas iniciales",
    description: "Pack de recursos imprimibles para practicar sumas básicas.",
    topicIds: ["topic-sumas-basicas"],
    assetIds: ["asset-sumas-worksheet-01", "asset-sumas-quiz-01"],
    language: "es",
    price: 4.99,
    currency: "EUR",
    coverImage: "/assets/covers/bundle-sumas-iniciales.jpg",
    status: "draft",
  },
  {
    id: "bundle-vocabulario-animales",
    slug: "bundle-vocabulario-animales",
    title: "Bundle de vocabulario de animales",
    description: "Pack temático con actividades imprimibles de animales.",
    topicIds: ["topic-vocabulario-animales"],
    assetIds: ["asset-animales-wordsearch-01", "asset-animales-crossword-01"],
    language: "es",
    price: 5.99,
    currency: "EUR",
    coverImage: "/assets/covers/bundle-vocabulario-animales.jpg",
    status: "draft",
  },
];