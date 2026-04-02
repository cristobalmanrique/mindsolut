import fs from "fs";
import path from "path";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";

const SEO_PAGES_DIR = path.join(process.cwd(), "storage", "seo", "pages");

export type PublicAsset = (typeof assets)[number];

function getSeoSlugsSet(): Set<string> {
  if (!fs.existsSync(SEO_PAGES_DIR)) {
    return new Set();
  }

  const files = fs.readdirSync(SEO_PAGES_DIR);
  const slugs = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""));

  return new Set(slugs);
}

export function getPublicAssets(): PublicAsset[] {
  const seoSlugs = getSeoSlugsSet();

  return assets.filter((asset) => seoSlugs.has(asset.slug));
}

export function getPublicAssetsByTopic(topicId: string): PublicAsset[] {
  return getPublicAssets().filter((asset) => asset.topicId === topicId);
}

export function getPublicTopics() {
  const publicAssets = getPublicAssets();
  const topicIds = new Set(publicAssets.map((asset) => asset.topicId));

  return topics.filter((topic) => topicIds.has(topic.id));
}