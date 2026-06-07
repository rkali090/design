"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  generationMode: GenerationMode;
};

type PanelTab = "compose" | "preview" | "code" | "handoff";

type DevicePreset = {
  name: string;
  width: number;
};

type SavedSnapshot = {
  createdAt: string;
  design: DesignSpec;
  id: string;
};

type PrototypeCode = {
  css: string;
  html: string;
  js: string;
  title: string;
};

type StoredUser = {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  passwordHash: string;
};

type AuthForm = {
  email: string;
  name: string;
  password: string;
};

type AuthMode = "signin" | "signup";
type GenerationMode = "code" | "plan";

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
      keyElements: ["Prompt box", "Generate button", "Model selector", "Key safety badge"]
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
    "Keep the first screen focused on the user's primary action.",
    "Use stable spacing so generated content never shifts the layout abruptly.",
    "Keep simulator cards fixed-height enough to avoid shifting while content changes."
  ]
};

const samplePrototype: PrototypeCode = {
  title: "VisionOS Frames",
  html: `
<main class="prototype-app">
  <section class="hero">
    <p class="label">AI frame finder</p>
    <h1>Find frames that feel made for you.</h1>
    <p>Compare fit, color, and lens options in a guided mobile shopping flow.</p>
    <button data-action="start">Start fitting</button>
  </section>
  <section class="cards">
    <article>
      <span>01</span>
      <strong>Face shape scan</strong>
      <p>Ask three quick style questions before showing recommendations.</p>
    </article>
    <article>
      <span>02</span>
      <strong>Frame shortlist</strong>
      <p>Save, compare, and narrow picks with clear fit confidence.</p>
    </article>
    <article>
      <span>03</span>
      <strong>Checkout assist</strong>
      <p>Keep prescription and lens choices visible before purchase.</p>
    </article>
  </section>
</main>`.trim(),
  css: `
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #f8f1e5;
  color: #171717;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.prototype-app {
  min-height: 100vh;
  padding: 18px;
}
.hero {
  background: #171717;
  border-radius: 28px;
  color: white;
  padding: 24px;
}
.label {
  color: #22c55e;
  font-size: 12px;
  font-weight: 900;
  margin: 0 0 10px;
  text-transform: uppercase;
}
h1 {
  font-size: 34px;
  line-height: 1;
  margin: 0;
}
.hero p:last-of-type {
  color: rgba(255,255,255,.72);
  line-height: 1.5;
}
button {
  background: #22c55e;
  border: 0;
  border-radius: 16px;
  color: #171717;
  font-weight: 900;
  min-height: 48px;
  padding: 0 18px;
}
.cards {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}
article {
  background: white;
  border: 1px solid rgba(23,23,23,.08);
  border-radius: 22px;
  padding: 16px;
}
article span {
  color: #3b82f6;
  font-size: 12px;
  font-weight: 900;
}
article strong {
  display: block;
  margin-top: 8px;
}
article p {
  color: #6c665f;
  line-height: 1.45;
  margin-bottom: 0;
}`.trim(),
  js: `
document.querySelector('[data-action="start"]')?.addEventListener('click', () => {
  document.body.classList.toggle('started');
});`.trim()
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
  generationMode: "code"
};

const platforms = ["Mobile app", "Landing page", "Dashboard", "Storefront"];
const quickPrompts = [
  "Fashion ecommerce app with AI styling",
  "Restaurant booking app for busy cities",
  "Fitness habit tracker for beginners"
];

const devicePresets: DevicePreset[] = [
  { name: "SE", width: 320 },
  { name: "iPhone", width: 390 },
  { name: "Pixel", width: 412 },
  { name: "Fold", width: 520 }
];

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const authSessionCookieName = "design_studio_session";
const authUsersStorageKey = "design-studio-users";
const snapshotsStorageKey = "design-studio-snapshots";

export default function Home() {
  const [activePanel, setActivePanel] = useState<PanelTab>("compose");
  const [showAuth, setShowAuth] = useState(false);
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: "",
    name: "",
    password: ""
  });
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authReady, setAuthReady] = useState(true);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [design, setDesign] = useState<DesignSpec>(sampleDesign);
  const [generatedPrototype, setGeneratedPrototype] =
    useState<PrototypeCode>(samplePrototype);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[1]);
  const [snapshotsReady, setSnapshotsReady] = useState(false);
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshot[]>([]);

  const dominantColors = useMemo(
    () => design.palette.slice(0, 5),
    [design.palette]
  );

  useEffect(() => {
    const users = readUsers();
    const sessionId = getCookie(authSessionCookieName);
    const sessionUser = users.find((user) => user.id === sessionId);

    if (sessionUser) {
      setCurrentUser(sessionUser);
    }

    setAuthReady(true);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(snapshotsStorageKey);
    if (!stored) {
      setSnapshotsReady(true);
      return;
    }

    try {
      setSavedSnapshots(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(snapshotsStorageKey);
    } finally {
      setSnapshotsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!snapshotsReady) {
      return;
    }

    window.localStorage.setItem(
      snapshotsStorageKey,
      JSON.stringify(savedSnapshots)
    );
  }, [savedSnapshots, snapshotsReady]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (form.generationMode === "plan") {
        try {
          const payload = await generateFromServer(form);
          setDesign(payload);
        } catch {
          setDesign(buildLocalDesignSpec(form));
        }
        setActivePanel("handoff");
      } else {
        const prototype = await generatePrototype(form);
        setGeneratedPrototype(prototype);
        setDesign(buildLocalDesignSpec(form));
        setActivePanel("code");
      }
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

  function updateField<Field extends keyof FormState>(
    field: Field,
    value: FormState[Field]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAuthField(field: keyof AuthForm, value: string) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function applyQuickPrompt(prompt: string) {
    updateField("prompt", `Create a mobile-first ${prompt.toLowerCase()} with a Lovable-style builder experience and an implementation-ready handoff.`);
  }

  async function onAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const email = authForm.email.trim().toLowerCase();
    const name = authForm.name.trim();
    const password = authForm.password;

    if (!email || !password || (authMode === "signup" && !name)) {
      setError("Fill in the required auth fields.");
      return;
    }

    const users = readUsers();
    const passwordHash = await hashPassword(password);

    if (authMode === "signin") {
      const user = users.find(
        (candidate) =>
          candidate.email === email && candidate.passwordHash === passwordHash
      );

      if (!user) {
        setError("No matching account found.");
        return;
      }

      setSessionCookie(user.id);
      setCurrentUser(user);
      setAuthForm({ email: "", name: "", password: "" });
      return;
    }

    if (users.some((user) => user.email === email)) {
      setError("An account already exists for that email.");
      return;
    }

    const user: StoredUser = {
      createdAt: new Date().toISOString(),
      email,
      id: crypto.randomUUID(),
      name,
      passwordHash
    };

    const nextUsers = [user, ...users];
    window.localStorage.setItem(authUsersStorageKey, JSON.stringify(nextUsers));
    setSessionCookie(user.id);
    setCurrentUser(user);
    setAuthForm({ email: "", name: "", password: "" });
  }

  function signOut() {
    clearSessionCookie();
    setCurrentUser(null);
    setActivePanel("compose");
  }

  async function copyHandoff() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(design, null, 2));
      setError("");
    } catch {
      setError("Unable to copy handoff JSON right now.");
    }
  }

  function downloadHandoff() {
    const blob = new Blob([JSON.stringify(design, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${design.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "design"}-handoff.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveSnapshot() {
    const snapshot: SavedSnapshot = {
      createdAt: new Date().toISOString(),
      design,
      id: crypto.randomUUID()
    };

    setSavedSnapshots((current) => [snapshot, ...current].slice(0, 6));
  }

  function restoreSnapshot(snapshot: SavedSnapshot) {
    setDesign(snapshot.design);
    setActivePanel("preview");
  }

  async function copyPrototypeCode() {
    try {
      await navigator.clipboard.writeText(composePrototypeDocument(generatedPrototype));
      setError("");
    } catch {
      setError("Unable to copy prototype code right now.");
    }
  }

  function downloadPrototypeCode() {
    const blob = new Blob([composePrototypeDocument(generatedPrototype)], {
      type: "text/html"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedPrototype.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "prototype"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!authReady) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="eyebrow">Design studio</span>
          <h1>Loading workspace</h1>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    if (!showAuth) {
      return (
        <LandingPage
          onCreateAccount={() => {
            setAuthMode("signup");
            setShowAuth(true);
            setError("");
          }}
          onSignIn={() => {
            setAuthMode("signin");
            setShowAuth(true);
            setError("");
          }}
        />
      );
    }

    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow">Design studio</span>
            <h1>{authMode === "signin" ? "Sign in" : "Create account"}</h1>
            <p>Access your mobile-first design workspace.</p>
          </div>

          <form onSubmit={onAuthSubmit}>
            {authMode === "signup" ? (
              <label>
                Name
                <input
                  autoComplete="name"
                  value={authForm.name}
                  onChange={(event) => updateAuthField("name", event.target.value)}
                  placeholder="Your name"
                />
              </label>
            ) : null}

            <label>
              Email
              <input
                autoComplete="email"
                inputMode="email"
                value={authForm.email}
                onChange={(event) => updateAuthField("email", event.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </label>

            <label>
              Password
              <input
                autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                value={authForm.password}
                onChange={(event) => updateAuthField("password", event.target.value)}
                placeholder="Password"
                type="password"
              />
            </label>

            {error ? <p className="error-message">{error}</p> : null}

            <button className="generate-button" type="submit">
              {authMode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            className="auth-switch"
            onClick={() => {
              setAuthMode(authMode === "signin" ? "signup" : "signin");
              setError("");
            }}
            type="button"
          >
            {authMode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>

          <p className="auth-note">
            Your workspace stays signed in on this device.
          </p>

          <button
            className="auth-back"
            onClick={() => {
              setShowAuth(false);
              setError("");
            }}
            type="button"
          >
            Back to overview
          </button>
        </section>
      </main>
    );
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
        <div className="topbar-actions">
          <span className="user-pill">{currentUser.name}</span>
          <button className="sign-out-button" onClick={signOut} type="button">
            Sign out
          </button>
          <a className="docs-link" href="https://cloud.google.com/vertex-ai/generative-ai/docs/start/express-mode/overview">
            Vertex docs
          </a>
        </div>
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

      <nav className="mobile-tabs" aria-label="Workspace panels">
        <button
          className={activePanel === "compose" ? "selected" : ""}
          onClick={() => setActivePanel("compose")}
          type="button"
        >
          Brief
        </button>
        <button
          className={activePanel === "preview" ? "selected" : ""}
          onClick={() => setActivePanel("preview")}
          type="button"
        >
          Preview
        </button>
        <button
          className={activePanel === "code" ? "selected" : ""}
          onClick={() => setActivePanel("code")}
          type="button"
        >
          Code
        </button>
        <button
          className={activePanel === "handoff" ? "selected" : ""}
          onClick={() => setActivePanel("handoff")}
          type="button"
        >
          Handoff
        </button>
      </nav>

      <section className="studio-grid">
        <form
          className={`composer-panel ${activePanel === "compose" ? "is-active" : ""}`}
          onSubmit={onSubmit}
        >
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

          <fieldset>
            <legend>Prompt mode</legend>
            <div className="segmented mode-segmented">
              <button
                className={form.generationMode === "code" ? "selected" : ""}
                onClick={() => updateField("generationMode", "code")}
                type="button"
              >
                Code generation
              </button>
              <button
                className={form.generationMode === "plan" ? "selected" : ""}
                onClick={() => updateField("generationMode", "plan")}
                type="button"
              >
                Planning
              </button>
            </div>
          </fieldset>

          <div className="field-grid">
            <div className="key-safety">
              <strong>{form.generationMode === "code" ? "Code model" : "Planning model"}</strong>
              <span>
                {form.generationMode === "code"
                  ? "3.1 Pro low thinking"
                  : "3.1 Pro high thinking"}
              </span>
            </div>
            <div className="key-safety">
              <strong>Access</strong>
              <span>Server-side Vertex key</span>
            </div>
          </div>

          {isStaticExport ? (
            <p className="helper-copy">
              Preview mode is active. Explore the interface, simulator, and handoff tools.
            </p>
          ) : (
            <p className="helper-copy">
              {form.generationMode === "code"
                ? "Code mode renders plain HTML, CSS, and JavaScript in the preview."
                : "Planning mode creates the design strategy, sections, components, and handoff notes."}
            </p>
          )}

          {error ? <p className="error-message">{error}</p> : null}

          <div className="utility-row">
            <button onClick={() => setForm(initialForm)} type="button">
              Reset brief
            </button>
            <button onClick={saveSnapshot} type="button">
              Save snapshot
            </button>
          </div>

          <button className="generate-button" disabled={loading} type="submit">
            {loading
              ? "Generating..."
              : form.generationMode === "code"
                ? "Generate prototype"
                : "Generate plan"}
          </button>
        </form>

        <section
          className={`simulator-panel ${activePanel === "preview" ? "is-active" : ""}`}
          aria-label="Mobile simulator"
        >
          <div className="panel-toolbar">
            <span>Mobile simulator</span>
            <span>{form.platform}</span>
          </div>

          <div className="device-switcher" aria-label="Device presets">
            {devicePresets.map((device) => (
              <button
                className={selectedDevice.name === device.name ? "selected" : ""}
                key={device.name}
                onClick={() => setSelectedDevice(device)}
                type="button"
              >
                {device.name}
              </button>
            ))}
          </div>

          <div
            className="phone-frame"
            style={{ maxWidth: `${selectedDevice.width}px` }}
          >
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

        <section
          className={`code-panel ${activePanel === "code" ? "is-active" : ""}`}
          aria-label="Generated prototype"
        >
          <div className="panel-heading">
            <span className="eyebrow">Rendered prototype</span>
            <h2>{generatedPrototype.title}</h2>
          </div>

          <div className="prototype-actions">
            <button onClick={copyPrototypeCode} type="button">
              Copy HTML
            </button>
            <button onClick={downloadPrototypeCode} type="button">
              Download
            </button>
            <button onClick={() => setActivePanel("preview")} type="button">
              Design spec
            </button>
          </div>

          <div
            className={`prototype-render ${form.platform.toLowerCase().includes("mobile") ? "mobile-frame" : "web-frame"}`}
          >
            <iframe
              sandbox="allow-scripts"
              srcDoc={composePrototypeDocument(generatedPrototype)}
              title={`${generatedPrototype.title} rendered prototype`}
            />
          </div>

          <div className="code-grid">
            <CodeBlock label="HTML" value={generatedPrototype.html} />
            <CodeBlock label="CSS" value={generatedPrototype.css} />
            <CodeBlock label="JS" value={generatedPrototype.js || "// No interactions yet"} />
          </div>
        </section>

        <section
          className={`spec-panel ${activePanel === "handoff" ? "is-active" : ""}`}
          aria-label="Generated design specification"
        >
          <div className="panel-heading">
            <span className="eyebrow">Handoff</span>
            <h2>{design.title}</h2>
          </div>

          <div className="handoff-actions">
            <button onClick={copyHandoff} type="button">
              Copy JSON
            </button>
            <button onClick={downloadHandoff} type="button">
              Download
            </button>
            <button onClick={saveSnapshot} type="button">
              Save
            </button>
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

          <SpecGroup title="Snapshots">
            {savedSnapshots.length ? (
              <div className="snapshot-list">
                {savedSnapshots.map((snapshot) => (
                  <button
                    key={snapshot.id}
                    onClick={() => restoreSnapshot(snapshot)}
                    type="button"
                  >
                    <strong>{snapshot.design.title}</strong>
                    <span>
                      {new Date(snapshot.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="note">Save a snapshot to compare directions later.</p>
            )}
          </SpecGroup>
        </section>
      </section>
    </main>
  );
}

function LandingPage({
  onCreateAccount,
  onSignIn
}: Readonly<{
  onCreateAccount: () => void;
  onSignIn: () => void;
}>) {
  const featureItems = [
    {
      title: "Prompt to UI",
      text: "Turn a product idea into a rendered screen with matching HTML, CSS, and JS."
    },
    {
      title: "Mobile simulator",
      text: "Preview SE, iPhone, Pixel, and Fold widths before handing anything off."
    },
    {
      title: "Handoff-ready",
      text: "Export specs, palette, type, component states, and a complete HTML file."
    },
    {
      title: "Saved directions",
      text: "Keep snapshots of strong concepts and restore them while exploring options."
    }
  ];

  const workflowItems = [
    "Describe the product, audience, style, colors, and goal.",
    "Pick mobile app, landing page, dashboard, or storefront framing.",
    "Generate a rendered prototype plus code and a design handoff.",
    "Copy, download, save, and iterate inside the same workspace."
  ];

  const useCases = [
    "Founder app concepts",
    "Storefront redesigns",
    "Mobile checkout flows",
    "Dashboard first passes",
    "Client ideation",
    "Developer handoff"
  ];

  const planItems = [
    {
      name: "Prototype",
      price: "Fast",
      text: "For quick mobile ideas, rendered previews, and shareable HTML exports."
    },
    {
      name: "Studio",
      price: "Focused",
      text: "For saved directions, handoff specs, and repeated product exploration."
    },
    {
      name: "Team",
      price: "Ready",
      text: "For turning rough briefs into consistent mobile-first UI systems."
    }
  ];

  const faqItems = [
    {
      question: "Can it generate actual code?",
      answer: "Yes. The workspace produces plain HTML, CSS, and JavaScript and renders it directly in the app."
    },
    {
      question: "Is it mobile-first?",
      answer: "Yes. Mobile app framing, device presets, and responsive previews are the default workflow."
    },
    {
      question: "Can I keep previous ideas?",
      answer: "Yes. Save snapshots and restore design directions when you want to compare concepts."
    }
  ];

  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Marketing">
        <div className="brand-mark">
          <span>D</span>
          <div>
            <strong>Design</strong>
            <small>AI product studio</small>
          </div>
        </div>
        <div className="landing-nav-actions">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <button onClick={onSignIn} type="button">
            Sign in
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">Mobile-first AI design builder</span>
          <h1>Describe a product. Launch a polished UI direction.</h1>
          <p>
            Design turns a rough prompt into a rendered prototype, implementation-ready code,
            and a handoff spec for web or mobile app ideas.
          </p>
          <div className="landing-actions">
            <button onClick={onCreateAccount} type="button">
              Start designing
            </button>
            <button onClick={onSignIn} type="button">
              Open workspace
            </button>
          </div>
          <div className="landing-proof" aria-label="Product capabilities">
            <span>Plain HTML/CSS/JS</span>
            <span>Device previews</span>
            <span>Handoff export</span>
          </div>
        </div>

        <div className="landing-preview" aria-label="Design app preview">
          <div className="landing-preview-bar">
            <span>Design workspace</span>
            <strong>Live preview</strong>
          </div>
          <div className="landing-phone">
            <div className="phone-status">
              <span>9:41</span>
              <span>Prototype</span>
            </div>
            <div className="preview-hero">
              <div>
                <span className="mini-label">Generated concept</span>
                <h2>FrameFlow Checkout</h2>
              </div>
              <div className="color-dots" aria-label="Preview palette">
                <span style={{ background: "#171717" }} />
                <span style={{ background: "#22c55e" }} />
                <span style={{ background: "#3b82f6" }} />
                <span style={{ background: "#fb7185" }} />
              </div>
            </div>
            <p className="summary">
              A guided mobile flow for comparing frames, confirming fit, and checking out
              with confidence.
            </p>
            <div className="landing-preview-card">
              <span>01</span>
              <strong>Generated UI</strong>
              <p>Hero, cards, CTA, layout, and interaction code.</p>
            </div>
            <div className="landing-code-lines" aria-label="Generated code sample">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip" aria-label="Core metrics">
        <div>
          <strong>4</strong>
          <span>output frames</span>
        </div>
        <div>
          <strong>3</strong>
          <span>handoff formats</span>
        </div>
        <div>
          <strong>1</strong>
          <span>focused workspace</span>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section-heading">
          <span className="eyebrow">Features</span>
          <h2>Everything needed for a believable first prototype.</h2>
        </div>
        <div className="landing-feature-grid">
          {featureItems.map((item) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-workflow" id="workflow">
        <div className="landing-section-heading">
          <span className="eyebrow">Workflow</span>
          <h2>From prompt to rendered interface in one loop.</h2>
        </div>
        <ol>
          {workflowItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-usecases">
        <div className="landing-section-heading">
          <span className="eyebrow">Use cases</span>
          <h2>Built for the early design decisions that usually slow teams down.</h2>
        </div>
        <div className="landing-chip-grid">
          {useCases.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-heading">
          <span className="eyebrow">Plans</span>
          <h2>Shape the idea before investing in full product design.</h2>
        </div>
        <div className="landing-plan-grid">
          {planItems.map((plan) => (
            <article key={plan.name}>
              <span>{plan.name}</span>
              <strong>{plan.price}</strong>
              <p>{plan.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-faq">
        <div className="landing-section-heading">
          <span className="eyebrow">FAQ</span>
          <h2>Clear enough for makers, practical enough for handoff.</h2>
        </div>
        <div>
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <span className="eyebrow">Ready</span>
        <h2>Start with a prompt and leave with a prototype.</h2>
        <button onClick={onCreateAccount} type="button">
          Create workspace
        </button>
      </section>
    </main>
  );
}

async function generateFromServer(form: FormState): Promise<DesignSpec> {
  if (isStaticExport) {
    throw new Error("Generation is not connected in this preview.");
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

async function generatePrototype(form: FormState): Promise<PrototypeCode> {
  if (isStaticExport) {
    return buildLocalPrototype(form);
  }

  const response = await fetch("/api/generate-prototype", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });
  const payload = await response.json();

  if (!response.ok) {
    return buildLocalPrototype(form);
  }

  return payload.prototype;
}

function buildLocalDesignSpec(form: FormState): DesignSpec {
  const mobile = form.platform.toLowerCase().includes("mobile");
  return {
    ...sampleDesign,
    title: form.product || sampleDesign.title,
    summary: `${mobile ? "A focused mobile flow" : "A responsive web screen"} for ${form.audience.toLowerCase() || "the target audience"} that helps users ${form.goal.toLowerCase()}.`,
    layoutSections: [
      {
        name: "Prompt",
        purpose: "Capture the product direction quickly.",
        mobileTreatment: "Keep the prompt visible and easy to revise.",
        keyElements: ["Prompt", "Output type", "Generate action"]
      },
      {
        name: mobile ? "Mobile Frame" : "Web Canvas",
        purpose: "Render the generated interface in the right context.",
        mobileTreatment: mobile
          ? "Use a compact app-like preview with clear tap targets."
          : "Use a full-width responsive canvas with clear hierarchy.",
        keyElements: ["Rendered UI", "Code output", "Interaction preview"]
      },
      {
        name: "Handoff",
        purpose: "Expose the generated structure for iteration.",
        mobileTreatment: "Separate HTML, CSS, and JS into compact blocks.",
        keyElements: ["HTML", "CSS", "JS"]
      }
    ]
  };
}

function buildLocalPrototype(form: FormState): PrototypeCode {
  const mobile = form.platform.toLowerCase().includes("mobile");
  const title = form.product || "Generated Design";
  const action = form.goal || "Move through the primary flow";
  const accent = form.colors.toLowerCase().includes("blue") ? "#3b82f6" : "#22c55e";

  return {
    title,
    html: `
<main class="${mobile ? "mobile-product" : "web-product"}">
  <section class="hero">
    <p class="label">${form.platform}</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(form.prompt)}</p>
    <button data-primary>${escapeHtml(action)}</button>
  </section>
  <section class="feature-grid">
    <article>
      <span>01</span>
      <strong>Audience fit</strong>
      <p>${escapeHtml(form.audience || "Clear guidance for the intended user.")}</p>
    </article>
    <article>
      <span>02</span>
      <strong>Visual system</strong>
      <p>${escapeHtml(form.style || "Polished, modern, and easy to scan.")}</p>
    </article>
    <article>
      <span>03</span>
      <strong>Next action</strong>
      <p>${escapeHtml(action)}</p>
    </article>
  </section>
</main>`.trim(),
    css: `
* { box-sizing: border-box; }
body {
  margin: 0;
  background: ${mobile ? "#f8f1e5" : "#eef4f8"};
  color: #151515;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
main {
  min-height: 100vh;
  padding: ${mobile ? "16px" : "28px"};
}
.hero {
  background: #151515;
  border-radius: ${mobile ? "28px" : "24px"};
  color: white;
  padding: ${mobile ? "24px" : "34px"};
}
.label {
  color: ${accent};
  font-size: 12px;
  font-weight: 900;
  margin: 0 0 10px;
  text-transform: uppercase;
}
h1 {
  font-size: ${mobile ? "34px" : "52px"};
  letter-spacing: 0;
  line-height: .98;
  margin: 0;
}
.hero p:last-of-type {
  color: rgba(255,255,255,.72);
  line-height: 1.5;
  max-width: 680px;
}
button {
  background: ${accent};
  border: 0;
  border-radius: 16px;
  color: #111;
  font-weight: 900;
  min-height: 48px;
  padding: 0 18px;
}
.feature-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: ${mobile ? "1fr" : "repeat(3, minmax(0, 1fr))"};
  margin-top: 14px;
}
article {
  background: white;
  border: 1px solid rgba(21,21,21,.08);
  border-radius: 20px;
  padding: 16px;
}
article span {
  color: ${accent};
  font-size: 12px;
  font-weight: 900;
}
article strong {
  display: block;
  margin-top: 8px;
}
article p {
  color: #68635d;
  line-height: 1.45;
  margin-bottom: 0;
}`.trim(),
    js: `
document.querySelector('[data-primary]')?.addEventListener('click', (event) => {
  event.currentTarget.textContent = 'Flow selected';
});`.trim()
  };
}

function composePrototypeDocument(prototype: PrototypeCode) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(prototype.title)}</title>
  <style>${prototype.css}</style>
</head>
<body>
${prototype.html}
<script>${prototype.js.replace(/<\/script/gi, "<\\/script")}</script>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readUsers(): StoredUser[] {
  const stored = window.localStorage.getItem(authUsersStorageKey);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.removeItem(authUsersStorageKey);
    return [];
  }
}

function getCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

function setSessionCookie(userId: string) {
  const maxAge = 60 * 60 * 24 * 14;
  document.cookie = `${authSessionCookieName}=${encodeURIComponent(userId)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${authSessionCookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function CodeBlock({
  label,
  value
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <section className="code-block">
      <div>
        <strong>{label}</strong>
        <span>Plain code</span>
      </div>
      <pre>{value}</pre>
    </section>
  );
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
