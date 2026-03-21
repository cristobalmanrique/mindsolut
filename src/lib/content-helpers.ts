import { assets } from "@/data/assets";
import { bundles } from "@/data/bundles";
import { collections } from "@/data/collections";
import { pages } from "@/data/pages";
import { topics } from "@/data/topics";

import type {
  AssetItem,
  BundleItem,
  CollectionItem,
  PageItem,
  TopicItem,
} from "@/types/content";

/**
 * TOPICS
 */
export function getAllTopics(): TopicItem[] {
  return topics;
}

export function getTopicById(id: string): TopicItem | undefined {
  return topics.find((topic) => topic.id === id);
}

export function getTopicBySlug(slug: string): TopicItem | undefined {
  return topics.find((topic) => topic.slug === slug);
}

/**
 * ASSETS
 */
export function getAllAssets(): AssetItem[] {
  return assets;
}

export function getAssetById(id: string): AssetItem | undefined {
  return assets.find((asset) => asset.id === id);
}

export function getAssetBySlug(slug: string): AssetItem | undefined {
  return assets.find((asset) => asset.slug === slug);
}

export function getAssetsByTopicId(topicId: string): AssetItem[] {
  return assets.filter((asset) => asset.topicId === topicId);
}

export function getPublishedAssets(): AssetItem[] {
  return assets.filter((asset) => asset.status === "published");
}

export function getPremiumAssets(): AssetItem[] {
  return assets.filter((asset) => asset.isPremium);
}

export function getFreeAssets(): AssetItem[] {
  return assets.filter((asset) => !asset.isPremium);
}

/**
 * BUNDLES
 */
export function getAllBundles(): BundleItem[] {
  return bundles;
}

export function getBundleById(id: string): BundleItem | undefined {
  return bundles.find((bundle) => bundle.id === id);
}

export function getBundleBySlug(slug: string): BundleItem | undefined {
  return bundles.find((bundle) => bundle.slug === slug);
}

export function getBundlesByTopicId(topicId: string): BundleItem[] {
  return bundles.filter((bundle) => bundle.topicIds.includes(topicId));
}

export function getAssetsForBundle(bundleId: string): AssetItem[] {
  const bundle = getBundleById(bundleId);
  if (!bundle) return [];

  return bundle.assetIds
    .map((assetId) => getAssetById(assetId))
    .filter((asset): asset is AssetItem => Boolean(asset));
}

/**
 * COLLECTIONS
 */
export function getAllCollections(): CollectionItem[] {
  return collections;
}

export function getCollectionById(id: string): CollectionItem | undefined {
  return collections.find((collection) => collection.id === id);
}

export function getCollectionBySlug(slug: string): CollectionItem | undefined {
  return collections.find((collection) => collection.slug === slug);
}

export function getAssetsForCollection(collectionId: string): AssetItem[] {
  const collection = getCollectionById(collectionId);
  if (!collection) return [];

  return collection.assetIds
    .map((assetId) => getAssetById(assetId))
    .filter((asset): asset is AssetItem => Boolean(asset));
}

export function getBundlesForCollection(collectionId: string): BundleItem[] {
  const collection = getCollectionById(collectionId);
  if (!collection) return [];

  return collection.bundleIds
    .map((bundleId) => getBundleById(bundleId))
    .filter((bundle): bundle is BundleItem => Boolean(bundle));
}

/**
 * PAGES
 */
export function getAllPages(): PageItem[] {
  return pages;
}

export function getPageById(id: string): PageItem | undefined {
  return pages.find((page) => page.id === id);
}

export function getPageBySlug(slug: string): PageItem | undefined {
  return pages.find((page) => page.slug === slug);
}

export function getPageByEntityId(entityId: string): PageItem | undefined {
  return pages.find((page) => page.entityId === entityId);
}

export function getIndexablePages(): PageItem[] {
  return pages.filter((page) => page.indexable);
}

/**
 * RELACIONES CRUZADAS
 */
export function getTopicWithAssets(topicId: string): {
  topic?: TopicItem;
  assets: AssetItem[];
} {
  return {
    topic: getTopicById(topicId),
    assets: getAssetsByTopicId(topicId),
  };
}

export function getTopicWithBundles(topicId: string): {
  topic?: TopicItem;
  bundles: BundleItem[];
} {
  return {
    topic: getTopicById(topicId),
    bundles: getBundlesByTopicId(topicId),
  };
}

export function getCollectionWithContent(collectionId: string): {
  collection?: CollectionItem;
  assets: AssetItem[];
  bundles: BundleItem[];
} {
  return {
    collection: getCollectionById(collectionId),
    assets: getAssetsForCollection(collectionId),
    bundles: getBundlesForCollection(collectionId),
  };
}