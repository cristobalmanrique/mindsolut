export function renderWorksheetFooter(assetUrl: string, qrUrl: string) {
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

export function getWorksheetFooterStyles() {
  return `
    .pdf-footer {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 56px;
      padding: 0 10mm 6mm;
      background: #ffffff;
      z-index: 20;
    }

    .pdf-footer__inner {
      height: 50px;
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