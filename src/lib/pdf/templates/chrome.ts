import type { AssetItem } from "@/types/content";

type WorksheetHeaderInput = {
  badge: string;
  title: string;
  instruction: string;
  emoji: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getWorksheetChromeStyles() {
  return `
    @page {
      size: Letter;
      margin: 10mm 10mm 18mm 10mm;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
      padding: 96px 0 66px;
    }

    .worksheet-main {
      max-width: 760px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .worksheet-panel {
      border: 2px dashed #cbd5e1;
      border-radius: 18px;
      padding: 14px 16px 12px;
      background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
    }

    .pdf-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 86px;
      padding: 10mm 10mm 6mm;
      background: #ffffff;
      z-index: 20;
    }

    .pdf-header__inner {
      max-width: 760px;
      margin: 0 auto;
      min-height: 46px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .pdf-header__left {
      flex: 1;
      min-width: 0;
    }

    .pdf-header__badge {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2px;
      margin-bottom: 5px;
      background: #eef2ff;
      color: #4338ca;
    }

    .pdf-header__title {
      font-size: 18px;
      line-height: 1.15;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px;
    }

    .pdf-header__instruction {
      font-size: 10px;
      line-height: 1.3;
      color: #64748b;
      margin: 0;
    }

    .pdf-header__emoji {
      flex-shrink: 0;
      font-size: 24px;
      line-height: 1;
      padding-top: 2px;
    }

    .pdf-footer {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 58px;
      padding: 0 10mm 6mm;
      background: #ffffff;
      z-index: 20;
    }

    .pdf-footer__inner {
      max-width: 760px;
      margin: 0 auto;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
    }

    .pdf-footer__text {
      min-width: 0;
      flex: 1;
    }

    .pdf-footer__brand {
      font-size: 10px;
      line-height: 1.2;
      color: #64748b;
      font-weight: 700;
    }

    .pdf-footer__link {
      font-size: 9px;
      line-height: 1.2;
      color: #0f172a;
      word-break: break-all;
    }

    .pdf-footer__qr {
      width: 38px;
      height: 38px;
      object-fit: contain;
      flex-shrink: 0;
    }
  `;
}

export function renderWorksheetHeader(input: WorksheetHeaderInput) {
  return `
    <div class="pdf-header">
      <div class="pdf-header__inner">
        <div class="pdf-header__left">
          <div class="pdf-header__badge">${escapeHtml(input.badge)}</div>
          <h1 class="pdf-header__title">${escapeHtml(input.title)}</h1>
          <p class="pdf-header__instruction">${escapeHtml(input.instruction)}</p>
        </div>
        <div class="pdf-header__emoji">${input.emoji}</div>
      </div>
    </div>
  `;
}

export function renderWorksheetFooter(asset: AssetItem) {
  const assetUrl = `https://mindsolut.com/recurso/${asset.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    assetUrl
  )}`;

  return `
    <div class="pdf-footer">
      <div class="pdf-footer__inner">
        <div class="pdf-footer__text">
          <div class="pdf-footer__brand">Mindsolut · Recurso imprimible</div>
          <div class="pdf-footer__link">${assetUrl}</div>
        </div>
        <img class="pdf-footer__qr" src="${qrUrl}" alt="QR Mindsolut" />
      </div>
    </div>
  `;
}
