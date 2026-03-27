import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { assets } from "@/data/assets";

export async function POST() {
  const publicDir = path.join(process.cwd(), "public");
  const missingDownloads: string[] = [];
  const missingPreviews: string[] = [];

  for (const asset of assets) {
    const filePath = path.join(publicDir, asset.fileUrl.replace(/^\/+/, ""));
    const previewPath = path.join(publicDir, asset.previewImage.replace(/^\/+/, ""));

    if (!fs.existsSync(filePath)) {
      missingDownloads.push(asset.fileUrl);
    }

    if (!fs.existsSync(previewPath)) {
      missingPreviews.push(asset.previewImage);
    }
  }

  return NextResponse.json({
    ok: true,
    job: "check-assets",
    missingDownloads,
    missingPreviews,
    message: "Chequeo de assets completado.",
  });
}
