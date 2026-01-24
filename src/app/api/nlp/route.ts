//chitthi bot
import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

export async function POST(request: Request) {
  const { message } = await request.json();

  let filename = "answer.txt";

  // Check if it's a question-answer command
  const match = message.match(/(?:write the answer of this|इसका उत्तर लिखो)[:\-]?\s*(.+)/i);
  if (match) {
    const question = match[1];

    // Ask GPT to answer the question
    const answerRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant. Give detailed and correct answers." },
          { role: "user", content: question }
        ],
      }),
    });

    const answerData = await answerRes.json();
    const answerText = answerData.choices?.[0]?.message?.content || "No answer generated.";

    return NextResponse.json({
      action: "create_file",
      filename,
      content: answerText,
    });
  }

  // Default prompt flow (existing logic)
  const prompt = `
You are Chitthi — a system assistant that parses user input and returns JSON actions like:

{
  "action": "create_file",
  "filename": "hello.txt",
  "content": "Hello world"
}

Rules:
- "write this as it is" → use exact text
- "write poem on rain" → generate a poem
- "create a file with Constitution" → return full Constitution or preamble

User input: ${message}
Return only valid JSON.
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: "❌ Couldn't understand the command." }, { status: 500 });
  }
}
