// chitthi bot
import { exec } from "child_process";
import { NextResponse } from "next/server";
//import allowedCommands from "@/utils/allowedCommands";
import allowedCommands from "../../../../utils/allowedCommands";


export async function POST(request: Request) {
  const { command } = await request.json();

  if (!command || !allowedCommands[command.toLowerCase()]) {
    return NextResponse.json({ error: "Command not allowed or missing" }, { status: 400 });
  }

  const cmd = allowedCommands[command.toLowerCase()];

  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        resolve(NextResponse.json({ error: error.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ output: stdout || "✅ Command executed successfully" }));
      }
    });
  });
}
