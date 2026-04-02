import type { MetadataRoute } from "next";
import { getPublicTopics, getPublicAssets } from "@/lib/seo/publicIndex";

const SITE_URL = "https://mindsolut.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const topics = getPublicTopics();
  const assets = getPublicAssets();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const topicRoutes: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${SITE_URL}/tema/${topic.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const resourceRoutes: MetadataRoute.Sitemap = assets.map((asset) => ({
    url: `${SITE_URL}/recurso/${asset.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...topicRoutes, ...resourceRoutes];
}