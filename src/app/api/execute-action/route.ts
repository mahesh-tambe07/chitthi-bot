import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const STORAGE_DIR = path.join(process.cwd(), "storage");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = body?.action;

  try {
    switch (action) {
      case "create_file": {
        const { filename, content } = body;
        if (!filename || !content) {
          return NextResponse.json({ error: "Missing filename or content" }, { status: 400 });
        }
        const fullPath = path.join(STORAGE_DIR, filename);
        await writeFile(fullPath, content, "utf-8");
        return NextResponse.json({ output: `✅ Created file '${filename}'` });
      }

      case "delete_file": {
        const { filename } = body;
        if (!filename) {
          return NextResponse.json({ error: "Missing filename" }, { status: 400 });
        }
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) {
          return NextResponse.json({ error: `❌ File '${filename}' does not exist` }, { status: 404 });
        }
        await unlink(fullPath);
        return NextResponse.json({ output: `🗑️ Deleted file '${filename}'` });
      }

      case "read_file": {
        const { filename } = body;
        if (!filename) {
          return NextResponse.json({ error: "Missing filename" }, { status: 400 });
        }
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) {
          return NextResponse.json({ error: `❌ File '${filename}' not found` }, { status: 404 });
        }
        const content = await readFile(fullPath, "utf-8");
        return NextResponse.json({ output: `📄 Content of '${filename}':\n\n${content}` });
      }

      case "list_files": {
        const files = await readdir(STORAGE_DIR);
        if (files.length === 0) {
          return NextResponse.json({ output: "📂 No files found in storage." });
        }
        return NextResponse.json({ output: `📂 Files in storage:\n\n${files.join("\n")}` });
      }

      default:
        return NextResponse.json({ error: "❌ Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    return NextResponse.json({ error: "❌ Internal server error" }, { status: 500 });
  }
}
