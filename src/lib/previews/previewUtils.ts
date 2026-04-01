import fs from "fs";
import path from "path";

export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getPublicAbsolutePath(relativePublicPath: string): string {
  const cleanPath = relativePublicPath.replace(/^\/+/, "");
  return path.join(process.cwd(), "public", cleanPath);
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}