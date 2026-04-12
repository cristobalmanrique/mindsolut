import { bundles } from "@/data/bundles";
import { generateBundleAssets } from "@/lib/bundles/generateBundleAssets";

async function run() {
  for (const bundle of bundles) {
    console.log(`Generando portada/previews del bundle: ${bundle.slug}`);

    const result = await generateBundleAssets(bundle);

    console.log("OK", result);
  }
}

run().catch((error) => {
  console.error("Error generando bundles:", error);
  process.exit(1);
});