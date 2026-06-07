import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type PrototypeRequest = {
  audience: string;
  colors: string;
  goal: string;
  platform: string;
  product: string;
  prompt: string;
  style: string;
};

const fallbackModel = "gemini-2.5-flash";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildPrompt(input: PrototypeRequest) {
  return `
Create a single-screen ${input.platform} UI prototype as plain HTML, CSS, and JavaScript.

Brief:
- Prompt: ${input.prompt}
- Product: ${input.product}
- Audience: ${input.audience}
- Style: ${input.style}
- Colors: ${input.colors}
- Primary goal: ${input.goal}

Return only valid JSON with this exact shape:
{
  "title": "short prototype title",
  "html": "body-only semantic HTML without script/style tags",
  "css": "plain CSS scoped to the prototype",
  "js": "plain JavaScript for small interactions, no external dependencies"
}

Requirements:
- Make the UI feel polished and production-like.
- If the platform is mobile, design within a mobile app frame mindset.
- If the platform is web, design a responsive web app screen.
- Do not use external images, CDNs, imports, frameworks, or APIs.
- Keep the generated JavaScript harmless and interaction-focused.
`.trim();
}

function parseJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced?.[1] ?? text;
  return JSON.parse(jsonText);
}

export async function POST(request: Request) {
  const apiKey = process.env.VERTEX_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Generation is not connected in this workspace." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const input: PrototypeRequest = {
    audience: asText(body?.audience),
    colors: asText(body?.colors),
    goal: asText(body?.goal),
    platform: asText(body?.platform),
    product: asText(body?.product),
    prompt: asText(body?.prompt),
    style: asText(body?.style)
  };

  if (!input.prompt || !input.platform || !input.product) {
    return NextResponse.json(
      { error: "Prompt, product, and platform are required." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ vertexai: true, apiKey });
    const response = await ai.models.generateContent({
      model: asText(body?.model) || process.env.VERTEX_MODEL || fallbackModel,
      contents: buildPrompt(input),
      config: {
        responseMimeType: "application/json"
      }
    });

    return NextResponse.json({ prototype: parseJson(response.text ?? "") });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Prototype generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
