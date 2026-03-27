import { assets } from "../src/data/assets";
import { generateWorksheetPdf } from "../src/lib/pdf/generateWorksheetPdf";

async function main() {
  const targetAssets = assets.filter(
    (asset) =>
      asset.topicId === "topic-1-primaria-sumas" &&
      asset.type === "worksheet"
  ).slice(0, 10);

  if (targetAssets.length === 0) {
    throw new Error("No se encontraron assets para topic-1-primaria-sumas");
  }

  console.log(`Generando ${targetAssets.length} PDFs...`);

  for (const asset of targetAssets) {
    console.log(`→ ${asset.fileUrl}`);
    await generateWorksheetPdf(asset, "sum");
  }

  console.log("✅ PDFs generados correctamente.");
}

main().catch((error) => {
  console.error("❌ Error al generar PDFs:", error);
  process.exit(1);
});