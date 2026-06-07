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

type UserProfile = {
  company: string;
  role: string;
  timezone: string;
};

type WorkspaceSettings = {
  autoSaveSnapshots: boolean;
  compactCode: boolean;
  defaultPlatform: string;
  defaultStyle: string;
};

type CreditEntry = {
  amount: number;
  createdAt: string;
  description: string;
  id: string;
};

type AuthForm = {
  email: string;
  name: string;
  password: string;
};

type AuthMode = "signin" | "signup";
type GenerationMode = "code" | "plan";
type PanelTab =
  | "compose"
  | "preview"
  | "code"
  | "handoff"
  | "profile"
  | "settings"
  | "credits"
  | "models";

type ModelSelection = {
  codeModel: string;
  planModel: string;
};

const emptyDesign: DesignSpec = {
  title: "No design generated yet",
  summary:
    "Create a prompt and generate a real design direction from your workspace.",
  palette: [
    { name: "Ink", hex: "#111214", usage: "primary text and strong contrast" },
    { name: "Canvas", hex: "#fffaf2", usage: "workspace surfaces" },
    { name: "Action", hex: "#22c55e", usage: "primary action states" },
    { name: "Focus", hex: "#3b82f6", usage: "focus rings and selected controls" }
  ],
  typeScale: [
    {
      role: "Screen title",
      size: "28",
      weight: "760",
      usage: "generated headings"
    },
    {
      role: "Body",
      size: "15",
      weight: "450",
      usage: "generated supporting copy"
    },
    {
      role: "Control",
      size: "13",
      weight: "850",
      usage: "buttons, tabs, and labels"
    }
  ],
  layoutSections: [
    {
      name: "Brief",
      purpose: "Capture the product direction before generation.",
      mobileTreatment: "Keep the prompt, platform, and goal in one focused flow.",
      keyElements: ["Prompt", "Product", "Audience", "Goal"]
    },
    {
      name: "Preview",
      purpose: "Render the generated direction as a believable interface.",
      mobileTreatment: "Use the selected device preset to frame the output.",
      keyElements: ["Device", "Generated sections", "Palette"]
    },
    {
      name: "Handoff",
      purpose: "Keep the generated decisions ready for implementation.",
      mobileTreatment: "Group palette, type, components, and notes into compact cards.",
      keyElements: ["Palette", "Type scale", "Components", "Notes"]
    }
  ],
  components: [
    {
      name: "Prompt composer",
      behavior: "Accepts the product brief and sends it to the selected generation mode.",
      states: ["idle", "focused", "generating"]
    },
    {
      name: "Live renderer",
      behavior: "Shows generated HTML/CSS/JS in a sandboxed preview.",
      states: ["empty", "rendered"]
    },
    {
      name: "Workspace controls",
      behavior: "Tracks credits, model choices, profile, settings, and snapshots.",
      states: ["ready", "updating"]
    }
  ],
  microcopy: ["Write a prompt", "Choose a mode", "Generate the first result"],
  implementationNotes: [
    "Generated results will replace this starter state.",
    "Credits update when the generation route returns successfully.",
    "Model choices are stored on this device for the signed-in workspace."
  ]
};

const emptyPrototype: PrototypeCode = {
  title: "No prototype generated yet",
  html: `
<main class="prototype-app">
  <section class="hero">
    <p class="label">Workspace ready</p>
    <h1>Your generated interface will render here.</h1>
    <p>Choose code generation, submit a prompt, and the app will render plain HTML, CSS, and JavaScript.</p>
    <button data-action="start">Waiting for prompt</button>
  </section>
  <section class="cards">
    <article>
      <span>01</span>
      <strong>Prompt</strong>
      <p>Describe the product and primary user action.</p>
    </article>
    <article>
      <span>02</span>
      <strong>Generate</strong>
      <p>The selected model creates implementation-ready code.</p>
    </article>
    <article>
      <span>03</span>
      <strong>Render</strong>
      <p>The sandbox preview updates with the generated result.</p>
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
  prompt: "",
  product: "",
  platform: "Mobile app",
  audience: "",
  style: "Premium, clean, mobile-first",
  colors: "",
  goal: "",
  generationMode: "code"
};

const platforms = ["Mobile app", "Landing page", "Dashboard", "Storefront"];
const quickPrompts = [
  "AI shopping assistant",
  "Appointment booking flow",
  "Personal finance onboarding"
];

const devicePresets: DevicePreset[] = [
  { name: "SE", width: 320 },
  { name: "iPhone", width: 390 },
  { name: "Pixel", width: 412 },
  { name: "Fold", width: 520 }
];

const workspaceTabs: { id: PanelTab; label: string }[] = [
  { id: "compose", label: "Brief" },
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
  { id: "handoff", label: "Handoff" },
  { id: "profile", label: "Profile" },
  { id: "settings", label: "Settings" },
  { id: "credits", label: "Credits" },
  { id: "models", label: "Models" }
];

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const authSessionCookieName = "design_studio_session";
const authUsersStorageKey = "design-studio-users";
const snapshotsStorageKey = "design-studio-snapshots";
const profileStorageKey = "design-studio-profile";
const settingsStorageKey = "design-studio-settings";
const creditsStorageKey = "design-studio-credits";
const modelsStorageKey = "design-studio-models";

const defaultSettings: WorkspaceSettings = {
  autoSaveSnapshots: true,
  compactCode: false,
  defaultPlatform: "Mobile app",
  defaultStyle: "Premium, clean, mobile-first"
};

const defaultProfile: UserProfile = {
  company: "",
  role: "Product builder",
  timezone: "UTC"
};

const defaultCredits: CreditEntry[] = [
  {
    amount: 100,
    createdAt: new Date().toISOString(),
    description: "Starting workspace credits",
    id: "starting-credits"
  }
];

const defaultModels: ModelSelection = {
  codeModel: "gemini-3.1-pro-preview",
  planModel: "gemini-3.1-pro-preview"
};

const codeModelOptions = [
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    detail: "LOW thinking for fast HTML/CSS/JS generation.",
    credits: 2
  }
];

const planModelOptions = [
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    detail: "HIGH thinking for planning and brainstorming.",
    credits: 5
  }
];

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
  const [design, setDesign] = useState<DesignSpec>(emptyDesign);
  const [generatedPrototype, setGeneratedPrototype] =
    useState<PrototypeCode>(emptyPrototype);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[1]);
  const [snapshotsReady, setSnapshotsReady] = useState(false);
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshot[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);
  const [credits, setCredits] = useState<CreditEntry[]>(defaultCredits);
  const [models, setModels] = useState<ModelSelection>(defaultModels);

  const dominantColors = useMemo(
    () => design.palette.slice(0, 5),
    [design.palette]
  );
  const creditBalance = useMemo(
    () => credits.reduce((total, entry) => total + entry.amount, 0),
    [credits]
  );
  const generationCost = form.generationMode === "code" ? 2 : 5;
  const selectedModel =
    form.generationMode === "code" ? models.codeModel : models.planModel;
  const generatedCount = credits.filter((entry) => entry.amount < 0).length;

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
    setProfile(readStored<UserProfile>(profileStorageKey, defaultProfile));
    setSettings(readStored<WorkspaceSettings>(settingsStorageKey, defaultSettings));
    setCredits(readStored<CreditEntry[]>(creditsStorageKey, defaultCredits));
    setModels(readStored<ModelSelection>(modelsStorageKey, defaultModels));
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

  useEffect(() => {
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem(creditsStorageKey, JSON.stringify(credits));
  }, [credits]);

  useEffect(() => {
    window.localStorage.setItem(modelsStorageKey, JSON.stringify(models));
  }, [models]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!form.prompt.trim() || !form.product.trim() || !form.goal.trim()) {
        throw new Error("Add a prompt, product name, and primary goal first.");
      }

      if (creditBalance < generationCost) {
        throw new Error("Not enough credits for this generation.");
      }

      if (form.generationMode === "plan") {
        try {
          const payload = await generateFromServer(form, models.planModel);
          setDesign(payload);
          recordCredit(-generationCost, "Planning generation");
          if (settings.autoSaveSnapshots) {
            saveSnapshot(payload);
          }
        } catch {
          setDesign(buildLocalDesignSpec(form));
        }
        setActivePanel("handoff");
      } else {
        const prototype = await generatePrototype(form, models.codeModel);
        setGeneratedPrototype(prototype);
        setDesign(buildLocalDesignSpec(form));
        recordCredit(-generationCost, "Code generation");
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

  function updateCurrentUser(field: "name", value: string) {
    if (!currentUser) {
      return;
    }

    const nextUser = { ...currentUser, [field]: value };
    const nextUsers = readUsers().map((user) =>
      user.id === nextUser.id ? nextUser : user
    );

    window.localStorage.setItem(authUsersStorageKey, JSON.stringify(nextUsers));
    setCurrentUser(nextUser);
  }

  function applyQuickPrompt(prompt: string) {
    updateField("prompt", `Create a mobile-first ${prompt.toLowerCase()} with a Lovable-style builder experience and an implementation-ready handoff.`);
  }

  function recordCredit(amount: number, description: string) {
    setCredits((current) => [
      {
        amount,
        createdAt: new Date().toISOString(),
        description,
        id: crypto.randomUUID()
      },
      ...current
    ]);
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

  function saveSnapshot(nextDesign = design) {
    const snapshot: SavedSnapshot = {
      createdAt: new Date().toISOString(),
      design: nextDesign,
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
          <span className="credit-pill">{creditBalance} credits</span>
          <span className="user-pill">{currentUser.name}</span>
          <button className="sign-out-button" onClick={signOut} type="button">
            Sign out
          </button>
        </div>
      </nav>

      <nav className="workspace-nav" aria-label="Workspace">
        {workspaceTabs.map((tab) => (
          <button
            className={activePanel === tab.id ? "selected" : ""}
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
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
        {workspaceTabs.map((tab) => (
          <button
            className={activePanel === tab.id ? "selected" : ""}
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
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
                {selectedModel}
              </span>
            </div>
            <div className="key-safety">
              <strong>Run cost</strong>
              <span>{generationCost} credits</span>
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
            <button onClick={() => saveSnapshot()} type="button">
              Save snapshot
            </button>
          </div>

          <button className="generate-button" disabled={loading} type="submit">
            {loading
              ? "Generating..."
              : form.generationMode === "code"
                ? `Generate prototype (${generationCost})`
                : `Generate plan (${generationCost})`}
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
          className={`code-panel ${settings.compactCode ? "compact-code" : ""} ${activePanel === "code" ? "is-active" : ""}`}
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
            <button onClick={() => saveSnapshot()} type="button">
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

        <section
          className={`profile-panel ${activePanel === "profile" ? "is-active" : ""}`}
          aria-label="Profile"
        >
          <div className="panel-heading">
            <span className="eyebrow">Profile</span>
            <h2>{currentUser.name}</h2>
          </div>

          <div className="profile-card">
            <span>Signed in as</span>
            <strong>{currentUser.email}</strong>
            <small>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</small>
          </div>

          <div className="field-grid">
            <label>
              Name
              <input
                value={currentUser.name}
                onChange={(event) => updateCurrentUser("name", event.target.value)}
              />
            </label>
            <label>
              Company
              <input
                value={profile.company}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, company: event.target.value }))
                }
                placeholder="Company or project"
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              Role
              <input
                value={profile.role}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, role: event.target.value }))
                }
              />
            </label>
            <label>
              Timezone
              <input
                value={profile.timezone}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, timezone: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="stats-grid">
            <article>
              <span>Credits</span>
              <strong>{creditBalance}</strong>
            </article>
            <article>
              <span>Generations</span>
              <strong>{generatedCount}</strong>
            </article>
            <article>
              <span>Snapshots</span>
              <strong>{savedSnapshots.length}</strong>
            </article>
          </div>
        </section>

        <section
          className={`settings-panel ${activePanel === "settings" ? "is-active" : ""}`}
          aria-label="Settings"
        >
          <div className="panel-heading">
            <span className="eyebrow">Settings</span>
            <h2>Workspace preferences</h2>
          </div>

          <div className="field-grid">
            <label>
              Default output type
              <select
                value={settings.defaultPlatform}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    defaultPlatform: event.target.value
                  }))
                }
              >
                {platforms.map((platform) => (
                  <option key={platform}>{platform}</option>
                ))}
              </select>
            </label>
            <label>
              Default style
              <input
                value={settings.defaultStyle}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    defaultStyle: event.target.value
                  }))
                }
              />
            </label>
          </div>

          <div className="settings-list">
            <label className="toggle-row">
              <input
                checked={settings.autoSaveSnapshots}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    autoSaveSnapshots: event.target.checked
                  }))
                }
                type="checkbox"
              />
              <span>
                <strong>Auto-save planning snapshots</strong>
                <small>Keep successful planning runs in the snapshot history.</small>
              </span>
            </label>
            <label className="toggle-row">
              <input
                checked={settings.compactCode}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    compactCode: event.target.checked
                  }))
                }
                type="checkbox"
              />
              <span>
                <strong>Compact code view</strong>
                <small>Reduce code block height for quicker scanning.</small>
              </span>
            </label>
          </div>

          <button
            className="generate-button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                platform: settings.defaultPlatform,
                style: settings.defaultStyle
              }))
            }
            type="button"
          >
            Apply defaults to brief
          </button>
        </section>

        <section
          className={`credits-panel ${activePanel === "credits" ? "is-active" : ""}`}
          aria-label="Credits"
        >
          <div className="panel-heading">
            <span className="eyebrow">Credits</span>
            <h2>{creditBalance} available</h2>
          </div>

          <div className="stats-grid">
            <article>
              <span>Code generation</span>
              <strong>2</strong>
            </article>
            <article>
              <span>Planning</span>
              <strong>5</strong>
            </article>
            <article>
              <span>Runs used</span>
              <strong>{generatedCount}</strong>
            </article>
          </div>

          <div className="credit-actions">
            <button onClick={() => recordCredit(25, "Manual top up")} type="button">
              Add 25 credits
            </button>
            <button onClick={() => setCredits(defaultCredits)} type="button">
              Reset credits
            </button>
          </div>

          <div className="ledger-list">
            {credits.map((entry) => (
              <article key={entry.id}>
                <div>
                  <strong>{entry.description}</strong>
                  <span>
                    {new Date(entry.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
                <b className={entry.amount > 0 ? "positive" : "negative"}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </b>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`models-panel ${activePanel === "models" ? "is-active" : ""}`}
          aria-label="Model selection"
        >
          <div className="panel-heading">
            <span className="eyebrow">Models</span>
            <h2>Generation modes</h2>
          </div>

          <ModelPicker
            label="Code generation"
            models={codeModelOptions}
            selected={models.codeModel}
            onSelect={(model) =>
              setModels((current) => ({ ...current, codeModel: model }))
            }
          />

          <ModelPicker
            label="Planning and brainstorming"
            models={planModelOptions}
            selected={models.planModel}
            onSelect={(model) =>
              setModels((current) => ({ ...current, planModel: model }))
            }
          />

          <p className="note">
            Code mode uses low thinking for faster prototype generation. Planning uses
            high thinking for deeper strategy and handoff output.
          </p>
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
                <span className="mini-label">Live workspace</span>
                <h2>Your generated screen</h2>
              </div>
              <div className="color-dots" aria-label="Preview palette">
                <span style={{ background: "#171717" }} />
                <span style={{ background: "#22c55e" }} />
                <span style={{ background: "#3b82f6" }} />
                <span style={{ background: "#fb7185" }} />
              </div>
            </div>
            <p className="summary">
              Enter a prompt, choose a mode, and render the result as code or a
              planning handoff.
            </p>
            <div className="landing-preview-card">
              <span>01</span>
              <strong>Workspace state</strong>
              <p>Credits, model choice, profile, and settings stay in sync.</p>
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

async function generateFromServer(
  form: FormState,
  model: string
): Promise<DesignSpec> {
  if (isStaticExport) {
    throw new Error("Generation is not connected in this preview.");
  }

  const response = await fetch("/api/generate-design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, model })
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to generate a design.");
  }

  return payload.design;
}

async function generatePrototype(
  form: FormState,
  model: string
): Promise<PrototypeCode> {
  if (isStaticExport) {
    return buildLocalPrototype(form);
  }

  const response = await fetch("/api/generate-prototype", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, model })
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to generate prototype code.");
  }

  return payload.prototype;
}

function buildLocalDesignSpec(form: FormState): DesignSpec {
  const mobile = form.platform.toLowerCase().includes("mobile");
  return {
    ...emptyDesign,
    title: form.product || emptyDesign.title,
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

function readStored<T>(key: string, fallback: T): T {
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
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

function ModelPicker({
  label,
  models,
  onSelect,
  selected
}: Readonly<{
  label: string;
  models: typeof codeModelOptions;
  onSelect: (model: string) => void;
  selected: string;
}>) {
  return (
    <section className="model-picker">
      <h3>{label}</h3>
      <div>
        {models.map((model) => (
          <button
            className={selected === model.id ? "selected" : ""}
            key={model.id}
            onClick={() => onSelect(model.id)}
            type="button"
          >
            <span>
              <strong>{model.name}</strong>
              <small>{model.detail}</small>
            </span>
            <b>{model.credits} credits</b>
          </button>
        ))}
      </div>
    </section>
  );
}
