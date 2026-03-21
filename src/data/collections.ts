import { CollectionItem } from "@/types/content";

export const collections: CollectionItem[] = [
  {
    id: "collection-matematicas-primaria",
    slug: "matematicas-primaria",
    title: "Matem ticas para primaria",
    description: "Colecci¢n de recursos imprimibles y pr cticos de matem ticas.",
    assetIds: ["asset-sumas-worksheet-01", "asset-sumas-quiz-01"],
    bundleIds: ["bundle-sumas-iniciales"],
    pageId: "page-collection-matematicas-primaria",
    status: "draft",
  },
  {
    id: "collection-vocabulario-animales",
    slug: "vocabulario-animales",
    title: "Vocabulario de animales",
    description: "Colecci¢n de actividades tem ticas para practicar vocabulario.",
    assetIds: ["asset-animales-wordsearch-01", "asset-animales-crossword-01"],
    bundleIds: ["bundle-vocabulario-animales"],
    pageId: "page-collection-vocabulario-animales",
    status: "draft",
  },
];