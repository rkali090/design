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

const fallbackCodeModel = "gemini-3.1-pro-preview";

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

async function generateWithVertexExpress({
  apiKey,
  contents,
  model,
  thinkingLevel
}: {
  apiKey: string;
  contents: string;
  model: string;
  thinkingLevel: "LOW" | "HIGH";
}) {
  const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: contents }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel
        }
      }
    })
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(payload));
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("");

  if (!text) {
    throw new Error("Vertex returned an empty response.");
  }

  return text;
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
    const text = await generateWithVertexExpress({
      apiKey,
      model:
        process.env.VERTEX_CODE_MODEL ??
        process.env.VERTEX_MODEL ??
        fallbackCodeModel,
      contents: buildPrompt(input),
      thinkingLevel: "LOW"
    });

    return NextResponse.json({ prototype: parseJson(text) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Prototype generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
