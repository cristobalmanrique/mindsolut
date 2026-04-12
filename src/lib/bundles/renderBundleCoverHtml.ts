import type { BundleItem, AssetItem, TopicItem } from "@/types/content";

type BundleCoverPreview = {
  src: string;
  alt: string;
};

type RenderBundleCoverHtmlInput = {
  bundle: BundleItem;
  topic?: TopicItem;
  previews: BundleCoverPreview[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBundleAccent(bundle: BundleItem) {
  const slug = bundle.slug.toLowerCase();
  const title = bundle.title.toLowerCase();

  if (slug.includes("resta") || title.includes("resta")) {
    return {
      primary: "#f97316",
      secondary: "#fb923c",
      soft: "#fff7ed",
      border: "#fdba74",
      badgeBg: "#fff1e6",
      badgeText: "#9a3412",
      ribbon: "PACK PREMIUM · RESTAS",
    };
  }

  if (slug.includes("tabla") || title.includes("tabla")) {
    return {
      primary: "#7c3aed",
      secondary: "#8b5cf6",
      soft: "#f5f3ff",
      border: "#c4b5fd",
      badgeBg: "#f3e8ff",
      badgeText: "#6b21a8",
      ribbon: "PACK PREMIUM · TABLAS",
    };
  }

  return {
    primary: "#2563eb",
    secondary: "#38bdf8",
    soft: "#eff6ff",
    border: "#93c5fd",
    badgeBg: "#e0f2fe",
    badgeText: "#075985",
    ribbon: "PACK PREMIUM · SUMAS",
  };
}

function buildPremiumBullets(bundle: BundleItem) {
  const bullets: string[] = [];

  bullets.push(`${bundle.assetIds.length} fichas imprimibles listas para usar`);
  bullets.push("Secuencia pensada para practicar varios días");
  bullets.push("Formato visual más completo que una ficha suelta");

  if (bundle.pedagogicalCriteria) {
    bullets.push("Diseñado con criterio pedagógico");
  }

  if (bundle.explainedAnswers) {
    bullets.push("Incluye apoyo para corrección y seguimiento");
  }

  if (bundle.reinforcementBlock?.enabled) {
    bullets.push(`Bloque extra de refuerzo: ${bundle.reinforcementBlock.extraExercises} ejercicios`);
  }

  return bullets.slice(0, 4);
}

function buildCoverTitle(bundle: BundleItem, topic?: TopicItem) {
  const title = bundle.title;
  const grade = topic?.grade ?? "";
  const subject = topic?.subject ?? "Matemáticas";

  return {
    eyebrow: grade ? `${subject} · ${grade}` : subject,
    title,
    subtitle:
      bundle.description ||
      "Pack educativo imprimible con contenido secuenciado y listo para descargar.",
  };
}

function renderPreviewCard(preview: BundleCoverPreview, index: number) {
  const rotations = ["-8deg", "5deg", "-3deg"];
  const tops = ["10px", "42px", "88px"];
  const rights = ["14px", "90px", "36px"];
  const zIndexes = [3, 2, 1];

  return `
    <div
      class="preview-card preview-card-${index + 1}"
      style="
        transform: rotate(${rotations[index] ?? "0deg"});
        top: ${tops[index] ?? "0px"};
        right: ${rights[index] ?? "0px"};
        z-index: ${zIndexes[index] ?? 1};
      "
    >
      <img src="${preview.src}" alt="${escapeHtml(preview.alt)}" />
    </div>
  `;
}

export function renderBundleCoverHtml({
  bundle,
  topic,
  previews,
}: RenderBundleCoverHtmlInput) {
  const accent = getBundleAccent(bundle);
  const premiumBullets = buildPremiumBullets(bundle);
  const header = buildCoverTitle(bundle, topic);

  const previewCards = previews.length
    ? previews.slice(0, 3).map(renderPreviewCard).join("\n")
    : `
      <div class="preview-fallback">
        <div class="preview-fallback-sheet"></div>
        <div class="preview-fallback-sheet preview-fallback-sheet-2"></div>
        <div class="preview-fallback-sheet preview-fallback-sheet-3"></div>
      </div>
    `;

  const premiumValue = (bundle.premiumValue ?? []).slice(0, 3);

  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(bundle.title)}</title>
      <style>
        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at top left, #ffffff 0%, ${accent.soft} 42%, #f8fafc 100%);
          color: #0f172a;
        }

        body {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page {
          width: 1200px;
          height: 1600px;
          padding: 54px;
          position: relative;
        }

        .frame {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 42px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 100%);
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .bg-circle {
          position: absolute;
          border-radius: 999px;
          opacity: 0.18;
          filter: blur(2px);
        }

        .bg-circle-1 {
          width: 320px;
          height: 320px;
          background: ${accent.secondary};
          top: -80px;
          right: -60px;
        }

        .bg-circle-2 {
          width: 260px;
          height: 260px;
          background: ${accent.primary};
          bottom: 260px;
          left: -80px;
        }

        .top-ribbon {
          position: absolute;
          top: 38px;
          left: 42px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: 999px;
          background: ${accent.badgeBg};
          color: ${accent.badgeText};
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 0.3px;
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
        }

        .content {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 34px;
          padding: 120px 54px 42px;
          height: 100%;
        }

        .left {
          display: flex;
          flex-direction: column;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.86);
          border: 1px solid ${accent.border};
          color: ${accent.primary};
          font-size: 25px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0;
          font-size: 78px;
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -1.8px;
          max-width: 560px;
        }

        .subtitle {
          margin-top: 24px;
          font-size: 29px;
          line-height: 1.4;
          color: #334155;
          max-width: 560px;
        }

        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .chip {
          padding: 12px 18px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          font-size: 23px;
          font-weight: 700;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
        }

        .benefits {
          margin-top: 34px;
          padding: 28px 28px 22px;
          background: rgba(255,255,255,0.88);
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
        }

        .benefits-title {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 14px;
        }

        .benefits ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .benefits li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 25px;
          line-height: 1.35;
          color: #1e293b;
          margin-bottom: 14px;
        }

        .benefits li:last-child {
          margin-bottom: 0;
        }

        .check {
          flex: 0 0 auto;
          width: 30px;
          height: 30px;
          margin-top: 2px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${accent.primary}, ${accent.secondary});
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
        }

        .right {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hero-card {
          position: relative;
          height: 810px;
          border-radius: 34px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%);
          border: 1px solid rgba(226, 232, 240, 0.95);
          box-shadow:
            0 24px 48px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255,255,255,0.95);
          overflow: hidden;
        }

        .hero-card-header {
          padding: 28px 28px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hero-label {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
        }

        .hero-counter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 120px;
          padding: 12px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${accent.primary}, ${accent.secondary});
          color: white;
          font-size: 28px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
        }

        .hero-stage {
          position: relative;
          height: calc(100% - 88px);
          padding: 16px 18px 18px;
        }

        .preview-card {
          position: absolute;
          width: 330px;
          height: 470px;
          background: white;
          border: 1px solid #dbeafe;
          border-radius: 22px;
          padding: 12px;
          box-shadow: 0 20px 32px rgba(15, 23, 42, 0.12);
        }

        .preview-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          border-radius: 14px;
          display: block;
          background: #f8fafc;
        }

        .preview-fallback {
          position: absolute;
          inset: 18px;
        }

        .preview-fallback-sheet {
          position: absolute;
          width: 330px;
          height: 470px;
          right: 16px;
          top: 10px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #dbeafe;
          border-radius: 22px;
          box-shadow: 0 20px 32px rgba(15, 23, 42, 0.12);
        }

        .preview-fallback-sheet-2 {
          top: 42px;
          right: 88px;
          transform: rotate(5deg);
        }

        .preview-fallback-sheet-3 {
          top: 88px;
          right: 32px;
          transform: rotate(-4deg);
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 24px;
        }

        .value-card,
        .cta-card {
          border-radius: 28px;
          background: rgba(255,255,255,0.9);
          border: 1px solid #e2e8f0;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
        }

        .value-card {
          padding: 24px 24px 20px;
        }

        .value-title {
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 12px;
          color: #0f172a;
        }

        .value-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .value-item {
          font-size: 23px;
          line-height: 1.35;
          color: #334155;
        }

        .cta-card {
          padding: 24px;
          background:
            linear-gradient(135deg, ${accent.primary} 0%, ${accent.secondary} 100%);
          color: white;
        }

        .cta-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }

        .price {
          font-size: 52px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .price-note {
          font-size: 23px;
          font-weight: 700;
          opacity: 0.95;
        }

        .cta-copy {
          margin-top: 12px;
          font-size: 24px;
          line-height: 1.35;
          opacity: 0.98;
        }

        .footer-note {
          position: absolute;
          left: 54px;
          right: 54px;
          bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 20px;
          color: #64748b;
        }

        .brand {
          font-weight: 900;
          letter-spacing: 0.3px;
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="frame">
          <div class="bg-circle bg-circle-1"></div>
          <div class="bg-circle bg-circle-2"></div>

          <div class="top-ribbon">${escapeHtml(accent.ribbon)}</div>

          <div class="content">
            <section class="left">
              <div class="eyebrow">${escapeHtml(header.eyebrow)}</div>

              <h1>${escapeHtml(header.title)}</h1>

              <div class="subtitle">${escapeHtml(header.subtitle)}</div>

              <div class="chip-row">
                <div class="chip">${bundle.assetIds.length} fichas</div>
                <div class="chip">PDF imprimible</div>
                <div class="chip">Descarga inmediata</div>
              </div>

              <div class="benefits">
                <div class="benefits-title">Por qué este pack se ve premium</div>
                <ul>
                  ${premiumBullets
                    .map(
                      (item) => `
                    <li>
                      <span class="check">✓</span>
                      <span>${escapeHtml(item)}</span>
                    </li>
                  `
                    )
                    .join("")}
                </ul>
              </div>
            </section>

            <section class="right">
              <div class="hero-card">
                <div class="hero-card-header">
                  <div class="hero-label">Vista previa del cuadernillo</div>
                  <div class="hero-counter">${bundle.assetIds.length} PDF</div>
                </div>

                <div class="hero-stage">
                  ${previewCards}
                </div>
              </div>

              <div class="bottom-grid">
                <div class="value-card">
                  <div class="value-title">Incluye</div>
                  <div class="value-list">
                    ${
                      premiumValue.length
                        ? premiumValue
                            .map(
                              (item) =>
                                `<div class="value-item">• ${escapeHtml(item)}</div>`
                            )
                            .join("")
                        : `
                          <div class="value-item">• Material listo para aula, tarea y refuerzo</div>
                          <div class="value-item">• Secuencia visual coherente en todo el pack</div>
                          <div class="value-item">• Más valor que descargar una ficha suelta</div>
                        `
                    }
                  </div>
                </div>

                <div class="cta-card">
                  <div class="cta-top">
                    <div class="price">${bundle.price.toFixed(2)} ${escapeHtml(bundle.currency)}</div>
                    <div class="price-note">Pack completo</div>
                  </div>
                  <div class="cta-copy">
                    Diseñado para que se entienda en segundos: curso, tema, formato y valor del bundle.
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="footer-note">
            <div class="brand">MINDSOLUT</div>
            <div>Recurso educativo imprimible y descargable</div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}