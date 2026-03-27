import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const OUTPUT_DIR = path.join(process.cwd(), "public/downloads");

function generarHTMLSumas(titulo: string) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 40px; }
          h1 { text-align: center; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .item { font-size: 22px; }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        <div class="grid">
          ${Array.from({ length: 30 }).map(() => {
            const a = Math.floor(Math.random() * 20);
            const b = Math.floor(Math.random() * 20);
            return `<div class="item">${a} + ${b} = ____</div>`;
          }).join("")}
        </div>
      </body>
    </html>
  `;
}

async function generarPDF(nombre: string, html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  await page.pdf({
    path: path.join(OUTPUT_DIR, nombre),
    format: "A4",
  });

  await browser.close();
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (let i = 1; i <= 20; i++) {
    const html = generarHTMLSumas(`Ficha de sumas ${i}`);
    await generarPDF(`ficha-sumas-${i}.pdf`, html);
  }

  console.log("✅ PDFs generados");
}

main();