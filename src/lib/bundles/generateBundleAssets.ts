import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import puppeteer from "puppeteer";
import { bundles } from "@/data/bundles";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";
import {
  ensureBundleStorageDirs,
  getBundleCoverAbsolutePath,
  getBundleDownloadAbsolutePath,
  getBundlePreviewAbsolutePath,
  getReviewAssetPdfAbsolutePath,
} from "@/lib/bundles/bundleStorage";
import {
  assertBundleCanBeGenerated,
  getBundleGenerationContextBySlug,
} from "@/lib/bundles/bundleWorkflow";
import { updateBundleEditorialStatus } from "@/lib/bundles/bundleEditorialStatus";

const execFileAsync = promisify(execFile);
const TMP_DIR = path.join(process.cwd(), ".tmp", "bundles");

type BundleLike = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  topicIds: string[];
  assetIds: string[];
  price?: number;
  currency?: string;
};

function ensureTmpDir() {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function getTopic(bundle: BundleLike) {
  const topicId = bundle.topicIds?.[0];
  return topics.find((topic) => topic.id === topicId);
}

function getPreviewCandidates(bundle: BundleLike) {
  return bundle.assetIds
    .map((assetId) => assets.find((asset) => asset.id === assetId))
    .filter((asset): asset is NonNullable<(typeof assets)[number]> => Boolean(asset))
    .slice(0, 3);
}

function toDataUrl(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function renderBundleHtml(bundle: BundleLike) {
  const topic = getTopic(bundle);

  const previewCards = getPreviewCandidates(bundle)
    .map((asset, index) => {
      const previewPath = path.join(
        process.cwd(),
        "public",
        asset.previewImage.replace(/^\//, "")
      );

      const src = fs.existsSync(previewPath) ? toDataUrl(previewPath) : "";
      const rotate = index === 0 ? "-6deg" : index === 1 ? "5deg" : "-2deg";
      const top = index === 0 ? 20 : index === 1 ? 80 : 140;
      const left = index === 0 ? 40 : index === 1 ? 180 : 90;

      return `
        <div class="card" style="top:${top}px;left:${left}px;transform:rotate(${rotate});">
          ${
            src
              ? `<img src="${src}" alt="${asset.title}" />`
              : `<div class="placeholder">Preview</div>`
          }
        </div>
      `;
    })
    .join("");

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: Letter; margin: 0; }
        * { box-sizing: border-box; }
        body { margin:0; font-family: Arial, Helvetica, sans-serif; background:#f8fafc; }
        .page {
          width:816px;
          height:1056px;
          padding:42px;
          position:relative;
          background:linear-gradient(180deg,#ffffff 0%,#eff6ff 100%);
        }
        .frame {
          width:100%;
          height:100%;
          border:2px solid #dbeafe;
          border-radius:28px;
          background:#fff;
          position:relative;
          overflow:hidden;
          box-shadow:0 20px 40px rgba(15,23,42,.08);
        }
        .content {
          display:grid;
          grid-template-columns:1fr 0.95fr;
          gap:28px;
          height:100%;
          padding:36px;
        }
        .eyebrow {
          display:inline-flex;
          border-radius:999px;
          background:#e0f2fe;
          color:#075985;
          font-size:13px;
          font-weight:700;
          padding:8px 12px;
        }
        h1 {
          margin:18px 0 0;
          font-size:42px;
          line-height:1.05;
          color:#0f172a;
        }
        .desc {
          margin-top:16px;
          font-size:18px;
          line-height:1.5;
          color:#475569;
        }
        .chips {
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:18px;
        }
        .chip {
          border:1px solid #e2e8f0;
          border-radius:999px;
          padding:8px 12px;
          background:#fff;
          color:#0f172a;
          font-size:13px;
          font-weight:700;
        }
        .list {
          margin-top:22px;
          padding:20px;
          border:1px solid #e2e8f0;
          border-radius:22px;
          background:#fff;
        }
        .list h2 {
          margin:0 0 12px;
          font-size:20px;
          color:#0f172a;
        }
        .list li {
          font-size:16px;
          color:#334155;
          margin:10px 0;
        }
        .right {
          position:relative;
        }
        .stage {
          height:100%;
          min-height:540px;
          border-radius:24px;
          background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);
          border:1px solid #e2e8f0;
          position:relative;
          overflow:hidden;
        }
        .stage-title {
          padding:20px;
          font-size:18px;
          font-weight:800;
          color:#0f172a;
        }
        .card {
          position:absolute;
          width:230px;
          height:330px;
          padding:10px;
          background:#fff;
          border:1px solid #cbd5e1;
          border-radius:18px;
          box-shadow:0 20px 35px rgba(15,23,42,.12);
        }
        .card img {
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:12px;
        }
        .placeholder {
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#f8fafc;
          color:#94a3b8;
          border-radius:12px;
        }
        .price {
          position:absolute;
          right:24px;
          bottom:24px;
          background:#0f172a;
          color:#fff;
          border-radius:18px;
          padding:16px 18px;
          font-weight:800;
          font-size:24px;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="frame">
          <div class="content">
            <section>
              <div class="eyebrow">PACK IMPRIMIBLE · ${topic?.grade ?? ""}</div>
              <h1>${bundle.title}</h1>
              <div class="desc">${bundle.description ?? "Pack educativo imprimible listo para descargar."}</div>
              <div class="chips">
                <div class="chip">${bundle.assetIds.length} fichas</div>
                <div class="chip">${topic?.subject ?? "Recurso educativo"}</div>
                <div class="chip">PDF descargable</div>
              </div>
              <div class="list">
                <h2>Incluye</h2>
                <ul>
                  <li>Portada premium del cuadernillo</li>
                  <li>Merge con fichas en review validadas</li>
                  <li>Secuencia lista para aula, tarea y refuerzo</li>
                </ul>
              </div>
            </section>
            <section class="right">
              <div class="stage">
                <div class="stage-title">Vista previa del pack</div>
                ${previewCards}
                <div class="price">${Number(bundle.price ?? 0).toFixed(2)} ${bundle.currency ?? "EUR"}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

async function createCoverArtifacts(bundle: BundleLike) {
  ensureBundleStorageDirs();
  ensureTmpDir();

  const coverImagePath = getBundleCoverAbsolutePath(bundle.slug);
  const previewImagePath = getBundlePreviewAbsolutePath(bundle.slug);
  const coverPdfPath = path.join(TMP_DIR, `${bundle.slug}.cover.pdf`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 816,
      height: 1056,
      deviceScaleFactor: 1.5,
    });

    await page.setContent(renderBundleHtml(bundle), {
      waitUntil: "networkidle0",
    });

    await page.screenshot({
      path: coverImagePath,
      type: "jpeg",
      quality: 90,
    });

    await page.screenshot({
      path: previewImagePath,
      type: "jpeg",
      quality: 84,
    });

    await page.pdf({
      path: coverPdfPath,
      width: "8.5in",
      height: "11in",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });
  } finally {
    await browser.close();
  }

  return coverPdfPath;
}

async function mergePdfFiles(outputPath: string, inputPaths: string[]) {
  const uniqueInputPaths = Array.from(new Set(inputPaths));
  await execFileAsync("pdfunite", [...uniqueInputPaths, outputPath]);
}

export async function generateBundleAssets(bundleOrSlug: BundleLike | string) {
  const slug = typeof bundleOrSlug === "string" ? bundleOrSlug : bundleOrSlug.slug;

  await assertBundleCanBeGenerated(slug);

  const { bundle, assets: bundleAssets } =
    await getBundleGenerationContextBySlug(slug);

  const coverPdfPath = await createCoverArtifacts(bundle);
  const reviewPdfPaths = bundleAssets.map((asset) =>
    getReviewAssetPdfAbsolutePath(asset)
  );
  const outputPdfPath = getBundleDownloadAbsolutePath(bundle.slug);

  await mergePdfFiles(outputPdfPath, [coverPdfPath, ...reviewPdfPaths]);

  updateBundleEditorialStatus({
    bundleId: bundle.id,
    slug: bundle.slug,
    status: "review",
  });

  return {
    bundleId: bundle.id,
    slug: bundle.slug,
    pdfUrl: `/downloads/packs/${bundle.slug}.pdf`,
    coverImage: `/covers/${bundle.slug}.jpg`,
    previewImage: `/previews/${bundle.slug}.jpg`,
  };
}

export async function generateBundleAssetsBySlug(slug: string) {
  return generateBundleAssets(slug);
}

export async function generateBundlesByTopicId(topicId: string) {
  const topicBundles = bundles.filter((bundle) =>
    bundle.topicIds?.includes(topicId)
  ) as BundleLike[];

  const generated: Array<Record<string, unknown>> = [];
  const skipped: Array<Record<string, unknown>> = [];
  const failed: Array<Record<string, unknown>> = [];

  for (const bundle of topicBundles) {
    try {
      const result = await generateBundleAssets(bundle);
      generated.push(result);
    } catch (error) {
      failed.push({
        bundleId: bundle.id,
        slug: bundle.slug,
        message:
          error instanceof Error ? error.message : "Error generando bundle.",
      });
    }
  }

  return {
    topicId,
    total: topicBundles.length,
    generated,
    skipped,
    failed,
  };
}

export async function generateBundlesByTopic(topicId: string) {
  return generateBundlesByTopicId(topicId);
}