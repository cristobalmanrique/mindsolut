import {
  getAllAssets,
  getAllBundles,
  getAllCollections,
  getAllTopics,
} from "@/lib/content-helpers";

export default function ContentDebugPanel() {
  const topics = getAllTopics();
  const assets = getAllAssets();
  const bundles = getAllBundles();
  const collections = getAllCollections();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Panel de prueba de contenido</h2>
        <p className="mt-2 text-sm text-slate-400">
          Esta secci¢n valida que los archivos de datos y los helpers est n funcionando correctamente.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-cyan-400">Topics</h3>
          <p className="mt-1 text-sm text-slate-400">Total: {topics.length}</p>

          <ul className="mt-4 space-y-3">
            {topics.map((topic) => (
              <li key={topic.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-medium text-white">{topic.title}</p>
                <p className="text-sm text-slate-400">{topic.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {topic.subject} ú {topic.grade} ú {topic.language} ú {topic.status}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-cyan-400">Assets</h3>
          <p className="mt-1 text-sm text-slate-400">Total: {assets.length}</p>

          <ul className="mt-4 space-y-3">
            {assets.map((asset) => (
              <li key={asset.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-medium text-white">{asset.title}</p>
                <p className="text-sm text-slate-400">{asset.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {asset.type} ú {asset.language} ú {asset.isPremium ? "Premium" : "Gratis"} ú{" "}
                  {asset.status}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-cyan-400">Bundles</h3>
          <p className="mt-1 text-sm text-slate-400">Total: {bundles.length}</p>

          <ul className="mt-4 space-y-3">
            {bundles.map((bundle) => (
              <li key={bundle.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-medium text-white">{bundle.title}</p>
                <p className="text-sm text-slate-400">{bundle.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {bundle.currency} {bundle.price} ú {bundle.language} ú {bundle.status}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-semibold text-cyan-400">Collections</h3>
          <p className="mt-1 text-sm text-slate-400">Total: {collections.length}</p>

          <ul className="mt-4 space-y-3">
            {collections.map((collection) => (
              <li
                key={collection.id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <p className="font-medium text-white">{collection.title}</p>
                <p className="text-sm text-slate-400">{collection.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  assets: {collection.assetIds.length} ú bundles: {collection.bundleIds.length} ú{" "}
                  {collection.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}