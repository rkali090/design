import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type DesignRequest = {
  prompt: string;
  product: string;
  platform: string;
  audience: string;
  style: string;
  colors: string;
  goal: string;
  model?: string;
};

const fallbackModel = "gemini-2.5-flash";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildPrompt(input: DesignRequest) {
  return `
You are a senior product designer creating implementation-ready mobile-first UI directions.

Create a concise design spec for:
- User prompt: ${input.prompt}
- Product: ${input.product}
- Platform: ${input.platform}
- Audience: ${input.audience}
- Visual style: ${input.style}
- Brand colors or constraints: ${input.colors || "choose a balanced palette"}
- Primary user goal: ${input.goal}

Return only valid JSON with this exact shape:
{
  "title": "short product screen title",
  "summary": "one sentence design direction",
  "palette": [
    { "name": "Ink", "hex": "#111111", "usage": "text and strong contrast" }
  ],
  "typeScale": [
    { "role": "Screen title", "size": "28", "weight": "700", "usage": "top-level mobile headings" }
  ],
  "layoutSections": [
    {
      "name": "Section name",
      "purpose": "why it exists",
      "mobileTreatment": "how it behaves on small screens",
      "keyElements": ["element one", "element two"]
    }
  ],
  "components": [
    {
      "name": "Component name",
      "behavior": "interaction behavior",
      "states": ["default", "pressed", "loading"]
    }
  ],
  "microcopy": ["short label or message"],
  "implementationNotes": ["specific UI engineering note"]
}

Keep everything practical for a real mobile app. Avoid generic marketing copy.
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
      { error: "Missing VERTEX_API_KEY in the server environment." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const input: DesignRequest = {
    prompt: asText(body?.prompt),
    product: asText(body?.product),
    platform: asText(body?.platform),
    audience: asText(body?.audience),
    style: asText(body?.style),
    colors: asText(body?.colors),
    goal: asText(body?.goal),
    model: asText(body?.model)
  };

  if (!input.prompt || !input.product || !input.platform || !input.audience || !input.goal) {
    return NextResponse.json(
      { error: "Product, platform, audience, and goal are required." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ vertexai: true, apiKey });
    const response = await ai.models.generateContent({
      model: input.model || process.env.VERTEX_MODEL || fallbackModel,
      contents: buildPrompt(input),
      config: {
        responseMimeType: "application/json"
      }
    });

    const generated = parseJson(response.text ?? "");
    return NextResponse.json({ design: generated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Design generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
