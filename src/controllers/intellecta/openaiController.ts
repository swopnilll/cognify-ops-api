import { Request, Response } from "express";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const streamAnswer = async (req: Request, res: Response): Promise<void> => {
  const { question } = req.body;

  if (!question) {
    res.status(400).json({ error: "Question is required" });
    return;
  }

  let accumulatedText = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: question }],
      stream: true,
    });

    // Setup Server-Sent Events (SSE) headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;

      if (content) {
        accumulatedText += content;
        const payload = {
          type: "message",
          data: content,
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    }

    // Final post-processing
    const finalPolished = manuallyPolishText(accumulatedText);

    // Emit final result
    res.write(`data: ${JSON.stringify({ type: "final", data: finalPolished })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`);

    res.end();
  } catch (error) {
    console.error("OpenAI stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error during streaming." });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Streaming failed." })}\n\n`);
      res.end();
    }
  }
};

// Simple post-processing logic for polish
const manuallyPolishText = (text: string): string => {
  let polished = text.trim();

  // Capitalize first letter of each sentence
  polished = polished.replace(/(?:^|\.\s+)([a-z])/g, (match, letter) => match.toUpperCase());

  // Basic typo fixes
  polished = polished.replace(/\b(teh)\b/g, "the");
  polished = polished.replace(/\b(definately)\b/g, "definitely");

  // Collapse multiple spaces
  polished = polished.replace(/\s+/g, " ");

  return polished;
};
