import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");

export async function GET(req: NextRequest) {
  const fileParam = req.nextUrl.searchParams.get("file");
  if (!fileParam) {
    return new Response("Missing file name", { status: 400 });
  }

  const filePath = path.join(STORAGE_DIR, fileParam);

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileParam}"`,
    },
  });
}
