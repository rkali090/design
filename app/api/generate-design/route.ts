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

const fallbackPlanModel = "gemini-3.1-pro-preview";

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
    const text = await generateWithVertexExpress({
      apiKey,
      model:
        process.env.VERTEX_PLAN_MODEL ??
        process.env.VERTEX_MODEL ??
        input.model ??
        fallbackPlanModel,
      contents: buildPrompt(input),
      thinkingLevel: "HIGH"
    });

    const generated = parseJson(text);
    return NextResponse.json({ design: generated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Design generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
