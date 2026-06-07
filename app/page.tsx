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
  model: string;
};

type PanelTab = "compose" | "preview" | "handoff";

type DevicePreset = {
  name: string;
  width: number;
};

type SavedSnapshot = {
  createdAt: string;
  design: DesignSpec;
  id: string;
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

const initialForm: FormState = {
  prompt:
    "Create a premium mobile app screen for a glasses store that helps shoppers compare frames, preview fit, and checkout quickly.",
  product: "AI design studio",
  platform: "Mobile app",
  audience: "Founders and makers who want polished UI direction fast",
  style: "Lovable-inspired, premium, tactile, modern",
  colors: "Graphite, porcelain, signal green, electric blue, coral",
  goal: "Generate a practical mobile design spec with a realistic phone preview",
  model: "gemini-2.5-flash"
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
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: "",
    name: "",
    password: ""
  });
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [design, setDesign] = useState<DesignSpec>(sampleDesign);
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
      const payload = await generateFromServer(form);
      setDesign(payload);
      setActivePanel("preview");
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

          <div className="field-grid">
            <label>
              Model
              <input
                value={form.model}
                onChange={(event) => updateField("model", event.target.value)}
              />
            </label>

            <div className="key-safety">
              <strong>Access</strong>
              <span>Signed-in workspace</span>
            </div>
          </div>

          {isStaticExport ? (
            <p className="helper-copy">
              Preview mode is active. Explore the interface, simulator, and handoff tools.
            </p>
          ) : (
            <p className="helper-copy">
              Secure generation is ready for this workspace.
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
            {loading ? "Generating..." : "Ask Vertex to design"}
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
