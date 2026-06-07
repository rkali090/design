"use client";

import { FormEvent, useMemo, useState } from "react";

type PaletteColor = {
  name: string;
  hex: string;
  usage: string;
};

type TypeToken = {
  role: string;
  size: string;
  weight: string;
  usage: string;
};

type LayoutSection = {
  name: string;
  purpose: string;
  mobileTreatment: string;
  keyElements: string[];
};

type ComponentSpec = {
  name: string;
  behavior: string;
  states: string[];
};

type DesignSpec = {
  title: string;
  summary: string;
  palette: PaletteColor[];
  typeScale: TypeToken[];
  layoutSections: LayoutSection[];
  components: ComponentSpec[];
  microcopy: string[];
  implementationNotes: string[];
};

type FormState = {
  prompt: string;
  product: string;
  platform: string;
  audience: string;
  style: string;
  colors: string;
  goal: string;
  model: string;
  vertexKey: string;
};

const sampleDesign: DesignSpec = {
  title: "VisionOS Frames",
  summary:
    "A confident mobile buying flow that blends fast AI direction, tactile product browsing, and clear purchase momentum.",
  palette: [
    { name: "Graphite", hex: "#171717", usage: "navigation, titles, and simulator chrome" },
    { name: "Porcelain", hex: "#f8f1e5", usage: "soft mobile surfaces" },
    { name: "Signal Green", hex: "#22c55e", usage: "primary generate and approval states" },
    { name: "Electric Blue", hex: "#3b82f6", usage: "focus rings and active modules" },
    { name: "Coral", hex: "#fb7185", usage: "creative accents and warnings" }
  ],
  typeScale: [
    {
      role: "App title",
      size: "31",
      weight: "780",
      usage: "top-level mobile screen title"
    },
    {
      role: "Module label",
      size: "12",
      weight: "800",
      usage: "compact controls and simulator labels"
    },
    {
      role: "Body",
      size: "15",
      weight: "450",
      usage: "generated rationale, notes, and product guidance"
    }
  ],
  layoutSections: [
    {
      name: "Prompt Composer",
      purpose: "Let the maker describe a full screen in one natural-language request.",
      mobileTreatment:
        "Large sticky composer with a one-tap generate button and compact advanced controls.",
      keyElements: ["Prompt box", "Generate button", "Model selector", "Key field"]
    },
    {
      name: "Mobile Simulator",
      purpose: "Show the direction as a believable phone screen instead of raw text.",
      mobileTreatment:
        "Full-width phone preview on small devices with fixed dimensions and no layout jump.",
      keyElements: ["Status bar", "Generated hero", "Color rail", "Section cards"]
    },
    {
      name: "Handoff Spec",
      purpose: "Convert the generated direction into implementation-ready chunks.",
      mobileTreatment:
        "Stacked rows for palette, type, components, microcopy, and build notes.",
      keyElements: ["Palette rows", "Type scale", "Component states", "Build notes"]
    }
  ],
  components: [
    {
      name: "AI composer",
      behavior: "Accepts a design prompt, locks while generating, and preserves the last result.",
      states: ["idle", "focused", "generating", "error"]
    },
    {
      name: "Phone simulator",
      behavior: "Reflects generated sections with stable card sizes and color accents.",
      states: ["sample", "generated"]
    },
    {
      name: "Handoff drawer",
      behavior: "Presents dense implementation details in scan-friendly groups.",
      states: ["expanded", "updating"]
    }
  ],
  microcopy: ["Ask Vertex to design", "Mobile preview", "Ready for handoff"],
  implementationNotes: [
    "Use the server route for private keys on real deployments.",
    "GitHub Pages can only use the optional browser key field because it is static hosting.",
    "Keep simulator cards fixed-height enough to avoid shifting while content changes."
  ]
};

const initialForm: FormState = {
  prompt:
    "Create a premium mobile app screen for a glasses store that helps shoppers compare frames, preview fit, and checkout quickly.",
  product: "AI design studio",
  platform: "Mobile app",
  audience: "Founders and makers who want polished UI direction fast",
  style: "Lovable-inspired, premium, tactile, modern",
  colors: "Graphite, porcelain, signal green, electric blue, coral",
  goal: "Generate a practical mobile design spec with a realistic phone preview",
  model: "gemini-2.5-flash",
  vertexKey: ""
};

const platforms = ["Mobile app", "Landing page", "Dashboard", "Storefront"];
const quickPrompts = [
  "Fashion ecommerce app with AI styling",
  "Restaurant booking app for busy cities",
  "Fitness habit tracker for beginners"
];

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [design, setDesign] = useState<DesignSpec>(sampleDesign);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dominantColors = useMemo(
    () => design.palette.slice(0, 5),
    [design.palette]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = form.vertexKey
        ? await generateFromBrowserKey(form)
        : await generateFromServer(form);

      setDesign(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate a design."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applyQuickPrompt(prompt: string) {
    updateField("prompt", `Create a mobile-first ${prompt.toLowerCase()} with a Lovable-style builder experience and an implementation-ready handoff.`);
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary">
        <div className="brand-mark">
          <span>D</span>
          <div>
            <strong>Design</strong>
            <small>Vertex mobile studio</small>
          </div>
        </div>
        <a className="docs-link" href="https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview">
          Vertex docs
        </a>
      </nav>

      <section className="hero-band">
        <div>
          <span className="eyebrow">Lovable-style generation</span>
          <h1>Describe an app. Get a mobile design direction.</h1>
        </div>
        <p>
          Built for quick product ideas, mobile UI previews, and handoff-ready specs.
        </p>
      </section>

      <section className="studio-grid">
        <form className="composer-panel" onSubmit={onSubmit}>
          <label className="prompt-label">
            Design prompt
            <textarea
              rows={7}
              value={form.prompt}
              onChange={(event) => updateField("prompt", event.target.value)}
              placeholder="Describe the app, screen, audience, and result you want."
            />
          </label>

          <div className="quick-row" aria-label="Quick prompts">
            {quickPrompts.map((prompt) => (
              <button key={prompt} onClick={() => applyQuickPrompt(prompt)} type="button">
                {prompt}
              </button>
            ))}
          </div>

          <div className="field-grid">
            <label>
              Product
              <input
                value={form.product}
                onChange={(event) => updateField("product", event.target.value)}
              />
            </label>

            <label>
              Audience
              <input
                value={form.audience}
                onChange={(event) => updateField("audience", event.target.value)}
              />
            </label>
          </div>

          <fieldset>
            <legend>Output type</legend>
            <div className="segmented">
              {platforms.map((platform) => (
                <button
                  className={form.platform === platform ? "selected" : ""}
                  key={platform}
                  onClick={() => updateField("platform", platform)}
                  type="button"
                >
                  {platform}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="field-grid">
            <label>
              Style
              <input
                value={form.style}
                onChange={(event) => updateField("style", event.target.value)}
              />
            </label>

            <label>
              Colors
              <input
                value={form.colors}
                onChange={(event) => updateField("colors", event.target.value)}
              />
            </label>
          </div>

          <label>
            Primary goal
            <input
              value={form.goal}
              onChange={(event) => updateField("goal", event.target.value)}
            />
          </label>

          <div className="field-grid">
            <label>
              Model
              <input
                value={form.model}
                onChange={(event) => updateField("model", event.target.value)}
              />
            </label>

            <label>
              Vertex API key
              <input
                autoComplete="off"
                inputMode="text"
                type="password"
                value={form.vertexKey}
                onChange={(event) => updateField("vertexKey", event.target.value)}
                placeholder={isStaticExport ? "Required on GitHub Pages" : "Optional locally"}
              />
            </label>
          </div>

          {isStaticExport ? (
            <p className="helper-copy">
              GitHub Pages is static, so the key field is used only in your browser session.
            </p>
          ) : (
            <p className="helper-copy">
              Leave the key field empty to use the secure server route from `.env.local`.
            </p>
          )}

          {error ? <p className="error-message">{error}</p> : null}

          <button className="generate-button" disabled={loading} type="submit">
            {loading ? "Generating..." : "Ask Vertex to design"}
          </button>
        </form>

        <section className="simulator-panel" aria-label="Mobile simulator">
          <div className="panel-toolbar">
            <span>Mobile simulator</span>
            <span>{form.platform}</span>
          </div>

          <div className="phone-frame">
            <div className="phone-status">
              <span>9:41</span>
              <span>AI Preview</span>
            </div>

            <div className="preview-hero">
              <div>
                <span className="mini-label">Generated concept</span>
                <h2>{design.title}</h2>
              </div>
              <div className="color-dots" aria-label="Palette">
                {dominantColors.map((color) => (
                  <span
                    key={`${color.name}-${color.hex}`}
                    title={`${color.name}: ${color.hex}`}
                    style={{ background: color.hex }}
                  />
                ))}
              </div>
            </div>

            <p className="summary">{design.summary}</p>

            <div className="action-strip">
              <button type="button">Preview flow</button>
              <span>{form.goal}</span>
            </div>

            <div className="section-stack">
              {design.layoutSections.slice(0, 3).map((section, index) => (
                <article className="mobile-section" key={section.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{section.name}</h3>
                    <p>{section.mobileTreatment}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="spec-panel" aria-label="Generated design specification">
          <div className="panel-heading">
            <span className="eyebrow">Handoff</span>
            <h2>{design.title}</h2>
          </div>

          <SpecGroup title="Palette">
            <div className="palette-grid">
              {design.palette.map((color) => (
                <div className="palette-row" key={`${color.name}-${color.hex}`}>
                  <span style={{ background: color.hex }} />
                  <div>
                    <strong>{color.name}</strong>
                    <small>{color.hex} · {color.usage}</small>
                  </div>
                </div>
              ))}
            </div>
          </SpecGroup>

          <SpecGroup title="Type scale">
            {design.typeScale.map((token) => (
              <div className="spec-row" key={token.role}>
                <strong>{token.role}</strong>
                <span>{token.size}px / {token.weight}</span>
                <p>{token.usage}</p>
              </div>
            ))}
          </SpecGroup>

          <SpecGroup title="Components">
            {design.components.map((component) => (
              <div className="spec-row" key={component.name}>
                <strong>{component.name}</strong>
                <span>{component.states.join(", ")}</span>
                <p>{component.behavior}</p>
              </div>
            ))}
          </SpecGroup>

          <SpecGroup title="Microcopy">
            <div className="chip-list">
              {design.microcopy.map((copy) => (
                <span key={copy}>{copy}</span>
              ))}
            </div>
          </SpecGroup>

          <SpecGroup title="Build notes">
            {design.implementationNotes.map((note) => (
              <p className="note" key={note}>{note}</p>
            ))}
          </SpecGroup>
        </section>
      </section>
    </main>
  );
}

async function generateFromServer(form: FormState): Promise<DesignSpec> {
  if (isStaticExport) {
    throw new Error("Add a Vertex API key to generate from the GitHub Pages version.");
  }

  const response = await fetch("/api/generate-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to generate a design.");
  }

  return payload.design;
}

async function generateFromBrowserKey(form: FormState): Promise<DesignSpec> {
  const prompt = buildPrompt(form);
  const endpoint = `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${encodeURIComponent(form.model)}:generateContent?key=${encodeURIComponent(form.vertexKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Vertex generation failed.");
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Vertex returned an empty response.");
  }

  return parseJson(text);
}

function buildPrompt(input: FormState) {
  return `
You are a senior product designer creating implementation-ready mobile-first UI directions.

User prompt:
${input.prompt}

Context:
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

Make it feel like a polished Lovable-style app builder result. Keep it practical for a real mobile product.
`.trim();
}

function parseJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fenced?.[1] ?? text;
  return JSON.parse(jsonText);
}

function SpecGroup({
  children,
  title
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) {
  return (
    <section className="spec-group">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
