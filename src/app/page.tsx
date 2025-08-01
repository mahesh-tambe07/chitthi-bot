"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 🎤 Voice recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // you can switch dynamically later
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("🎤 Voice error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendCommand(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  // 🔉 Speak output
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN"; // or "en-IN"
    speechSynthesis.speak(utterance);
  };

  const extractFilename = (msg: string) => {
    const match = msg.match(/'([^']+)'/);
    return match ? match[1] : "";
  };

  // 🧠 Send input to NLP and execute action
  const sendCommand = async (text?: string) => {
    const message = text || input;
    if (!message) return;

    setResponse("⏳ Processing...");
    setLogs((prev) => [...prev, `🗣️ You: ${message}`]);

    try {
      const res1 = await fetch("/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const command = await res1.json();

      const res2 = await fetch("/api/execute-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      const data = await res2.json();
      const output = data.output || data.error;

      setResponse(output);
      speak(output);
      setLogs((prev) => [...prev, `🤖 Chitthi: ${output}`]);
    } catch (error) {
      setResponse("❌ Error processing command");
      speak("❌ Error processing command");
      setLogs((prev) => [...prev, "❌ Chitthi: Error processing command"]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-yellow-400 font-mono">
      <h1 className="text-4xl mb-4 font-bold">🤖 Chitthi - Your Local System Bot</h1>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak command..."
          className="p-3 text-white bg-zinc-800 w-80 rounded-md outline-none"
        />
        <button
          onClick={() => sendCommand()}
          className="bg-yellow-400 text-black px-4 rounded-md hover:bg-yellow-300"
        >
          Send
        </button>
        <button
          onClick={startListening}
          className={`px-4 py-2 rounded-md text-white ${
            isListening ? "bg-red-500" : "bg-green-600"
          }`}
        >
          🎤
        </button>
      </div>

      <pre className="mt-6 text-sm whitespace-pre-wrap">{response}</pre>

      {/* 📥 Download Button */}
      {response.includes("Created file") && (
        <a
          href={`/api/download?file=${extractFilename(response)}`}
          download
          className="mt-2 bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-300"
        >
          ⬇️ Download File
        </a>
      )}

      {/* 🧠 Log history */}
      <div className="mt-6 w-full max-w-xl text-left">
        {logs.map((log, i) => (
          <div key={i} className="text-xs text-yellow-300 mb-1">
            {log}
          </div>
        ))}
      </div>
    </main>
  );
}
