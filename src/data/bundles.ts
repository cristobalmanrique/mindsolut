import { BundleItem } from "@/types/content";

export const bundles: BundleItem[] = [
  {
    id: "bundle-sumas-con-llevadas-2-primaria",
    slug: "sumas-con-llevadas-2-primaria-pack",
    title: "Pack de sumas con llevadas para 2º de primaria",
    description:
      "Pack imprimible en PDF con 10 fichas de sumas con llevadas para 2º de primaria. Ideal para repaso, refuerzo y práctica en casa o en clase.",
    topicIds: ["topic-2-primaria-sumas"],
    assetIds: [
      "asset-2p-sumas-w5-01",
      "asset-2p-sumas-w5-02",
      "asset-2p-sumas-w5-03",
      "asset-2p-sumas-w5-04",
      "asset-2p-sumas-w5-05",
      "asset-2p-sumas-w5-06",
      "asset-2p-sumas-w5-07",
      "asset-2p-sumas-w5-08",
      "asset-2p-sumas-w5-09",
      "asset-2p-sumas-w5-10",
    ],
    language: "es",
    price: 4.99,
    currency: "EUR",
    coverImage: "/covers/sumas-con-llevadas-2-primaria-pack.jpg",
    status: "draft",
  },
  {
    id: "bundle-restas-con-llevadas-2-primaria",
    slug: "restas-con-llevadas-2-primaria-pack",
    title: "Pack de restas con llevadas para 2º de primaria",
    description:
      "Pack imprimible en PDF con 10 fichas de restas con llevadas para 2º de primaria. Útil para reforzar cálculo, tareas y práctica guiada.",
    topicIds: ["topic-2-primaria-restas"],
    assetIds: [
      "asset-2p-restas-w5-01",
      "asset-2p-restas-w5-02",
      "asset-2p-restas-w5-03",
      "asset-2p-restas-w5-04",
      "asset-2p-restas-w5-05",
      "asset-2p-restas-w5-06",
      "asset-2p-restas-w5-07",
      "asset-2p-restas-w5-08",
      "asset-2p-restas-w5-09",
      "asset-2p-restas-w5-10",
    ],
    language: "es",
    price: 4.99,
    currency: "EUR",
    coverImage: "/covers/restas-con-llevadas-2-primaria-pack.jpg",
    status: "draft",
  },
];