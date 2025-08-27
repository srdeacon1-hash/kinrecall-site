import React, { useEffect, useState, useContext, createContext } from "react";
import { BrowserRouter, HashRouter, Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { createClient } from "@supabase/supabase-js";

/********************
 * UI primitives
 ********************/
function Button({
  children,
  className = "",
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "link";
  size?: "lg" | "icon";
}) {
  const base =
    "inline-flex items-center justify-center font-medium border rounded-md transition px-4 py-2";
  const styles =
    variant === "outline"
      ? "bg-transparent border-gray-300 hover:bg-gray-50"
      : variant === "link"
      ? "bg-transparent border-transparent underline hover:opacity-80"
      : "bg-black text-white border-black hover:bg-gray-800";
  const sizes =
    size === "lg" ? "px-5 py-3 text-base" : size === "icon" ? "p-2" : "";
  return (
    <button className={`${base} ${styles} ${sizes} ${className}`} {...props}>
      {children}
    </button>
  );
}
function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`border rounded-xl bg-white ${className}`}>{children}</div>;
}
function CardHeader({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}
function CardTitle({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
function CardContent({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full border rounded-md px-3 py-2 outline-none focus:ring ${className || ""}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full border rounded-md px-3 py-2 outline-none focus:ring ${className || ""}`}
    />
  );
}

/********************
 * Emoji icons (no deps)
 ********************/
const I = {
  heart: (props: any) => (
    <span aria-hidden {...props}>
      💛
    </span>
  ),
  book: (props: any) => (
    <span aria-hidden {...props}>
      📖
    </span>
  ),
  gift: (props: any) => (
    <span aria-hidden {...props}>
      🎁
    </span>
  ),
  lock: (props: any) => (
    <span aria-hidden {...props}>
      🔒
    </span>
  ),
  mic: (props: any) => (
    <span aria-hidden {...props}>
      🎤
    </span>
  ),
  video: (props: any) => (
    <span aria-hidden {...props}>
      🎬
    </span>
  ),
  image: (props: any) => (
    <span aria-hidden {...props}>
      🖼️
    </span>
  ),
  shield: (props: any) => (
    <span aria-hidden {...props}>
      🛡️
    </span>
  ),
  play: (props: any) => (
    <span aria-hidden {...props}>
      ▶️
    </span>
  ),
  sparkles: (props: any) => (
    <span aria-hidden {...props}>
      ✨
    </span>
  ),
  calendar: (props: any) => (
    <span aria-hidden {...props}>
      📅
    </span>
  ),
};

/********************
 * Data
 ********************/
const features = [
  {
    title: "Hear Their Voice, Anytime",
    desc: "Private audio stories in chapters — Childhood, Love Story, Wisdom, and more.",
    Icon: I.mic,
  },
  {
    title: "A Life in Motion",
    desc: "Short films that weave photos, interviews, and favorite music into a biopic.",
    Icon: I.video,
  },
  {
    title: "Storybook + QR Codes",
    desc: "Beautiful books with scannable codes that play the exact moment being read.",
    Icon: I.book,
  },
  {
    title: "Future Messages",
    desc: "Time-locked notes for birthdays, weddings, and milestones yet to come.",
    Icon: I.calendar,
  },
  {
    title: "Private Family Vault",
    desc: "Invite-only access with encryption and granular sharing controls.",
    Icon: I.shield,
  },
  {
    title: "Photo & Document Digitisation",
    desc: "Curated galleries of photos, letters, recipes, and keepsakes.",
    Icon: I.image,
  },
] as const;

const tiers = [
  {
    name: "Starter Capsule",
    price: "£249 one-time",
    highlights: [
      "1–2 hr guided audio session",
      "Up to 30 photos digitised",
      "Mini storybook (20 pages)",
      "Private vault access",
    ],
    cta: "Get Starter",
    badge: "Great for first-timers",
  },
  {
    name: "Family Legacy Vault",
    price: "£990 one-time",
    highlights: [
      "Up to 6 hrs video + audio",
      "100+ photos & documents",
      "Hardcover life storybook (100 pages)",
      "Future messages scheduling",
    ],
    cta: "Build Your Vault",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "KinRecall Box",
    price: "£2,900 one-time",
    highlights: [
      "Documentary film (30–60 min)",
      "Engraved keepsake box + USB",
      "Archival-quality hardcover",
      "Interactive frame with voice play",
    ],
    cta: "Create an Heirloom",
    badge: "Luxury heirloom",
  },
] as const;

const faqs = [
  {
    q: "Who is KinRecall for?",
    a: "Families who want a warm, human way to preserve a loved one’s stories, voice, and presence for future generations.",
  },
  {
    q: "How is content kept private?",
    a: "Your family vault is invite-only with encryption at rest and in transit. You control exactly who sees each chapter.",
  },
  {
    q: "Can we add more later?",
    a: "Yes. You can add recordings, photos, and future messages at any time. We offer ongoing curation on request.",
  },
  {
    q: "Do you work with hospices and funeral homes?",
    a: "Yes. We partner with care providers to offer gentle, high-touch recording and curation packages.",
  },
] as const;

/********************
 * Supabase (optional)
 ********************/
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;
const SUPABASE_ENABLED = !!supabase;

/********************
 * Router chooser
 ********************/
const RouterChooser: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSandbox =
    typeof window !== "undefined" &&
    String(window.location.origin || "").startsWith("sandbox:");
  const R: any = isSandbox ? HashRouter : BrowserRouter;
  return <R>{children}</R>;
};

/********************
 * Checkout helper (stub)
 ********************/
async function startCheckout(
  tier: string,
  userId?: string | null,
  familyId?: string | null
) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, user_id: userId || "", family_id: familyId || "" }),
    });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
    else alert(data?.error || "Could not start checkout.");
  } catch (e) {
    console.warn("checkout error", e);
    alert("Network error starting checkout");
  }
}

/********************
 * Global App state
 ********************/
type AppState = {
  userId: string | null;
  familyId: string | null;
  setUserId: (v: string | null) => void;
  setFamilyId: (v: string | null) => void;
};
const AppStateContext = createContext<AppState>({
  userId: null,
  familyId: null,
  setUserId: () => {},
  setFamilyId: () => {},
});
const useAppState = () => useContext(AppStateContext);

/********************
 * App
 ********************/
export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const state = { userId, familyId, setUserId, setFamilyId };

  return (
    <HelmetProvider>
      <AppStateContext.Provider value={state}>
        <RouterChooser>
          <Helmet>
            <title>KinRecall – Preserve Family Stories</title>
            <meta
              name="description"
              content="KinRecall helps families preserve stories, laughter, and wisdom as an interactive archive — a private place where memories become an heirloom."
            />
            <meta property="og:title" content="KinRecall – Preserve Family Stories" />
            <meta
              property="og:description"
              content="Preserve your loved one’s voice and stories forever in a private family vault with KinRecall."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.kinrecall.com" />
            <link rel="canonical" href="https://www.kinrecall.com" />
          </Helmet>
          <ScrollTitle />
          <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <SiteHeader />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/about" element={<About />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
        </RouterChooser>
      </AppStateContext.Provider>
    </HelmetProvider>
  );
}

/********************
 * Header / Footer
 ********************/
function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-neutral-50/70 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-200 to-rose-200 grid place-items-center">
            <I.heart />
          </div>
          <span className="font-serif text-xl">KinRecall</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/features">Features</NavItem>
          <NavItem to="/pricing">Pricing</NavItem>
          <NavItem to="/stories">Stories</NavItem>
          <NavItem to="/about">About</NavItem>
          <NavItem to="/partners">Partners</NavItem>
          <NavItem to="/blog">Blog</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </nav>
        <Link to="/contact">
          <Button className="rounded-2xl">Request a Demo</Button>
        </Link>
      </div>
    </header>
  );
}
function NavItem({
  to = "/",
  children,
}: React.PropsWithChildren<{ to?: string }>) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `hover:underline ${isActive ? "text-neutral-900" : "text-neutral-700"}`
      }
    >
      {children}
    </NavLink>
  );
}
function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-amber-200 to-rose-200 grid place-items-center">
              <I.heart />
            </div>
            <span className="font-serif">KinRecall</span>
          </div>
          <p className="text-sm text-neutral-600 mt-3 max-w-xs">
            Stories that outlive time. Built with privacy and tenderness at the core.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>
              <Link to="/features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/partners" className="hover:underline">
                Partners
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Get updates</h4>
          <div className="flex gap-2">
            <Input placeholder="Email address" type="email" />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            By subscribing you agree to our privacy policy.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-500 pb-8">
        © {new Date().getFullYear()} KinRecall. All rights reserved.
      </div>
    </footer>
  );
}

/********************
 * Utility bits
 ********************/
function ScrollTitle() {
  const location = useLocation();
  useEffect(() => {
    const map: Record<string, string> = {
      "/": "KinRecall – Preserve Family Stories",
      "/features": "Features – KinRecall",
      "/pricing": "Pricing – KinRecall",
      "/stories": "Stories – KinRecall",
      "/about": "About – KinRecall",
      "/partners": "Partners – KinRecall",
      "/blog": "Blog – KinRecall",
      "/contact": "Contact – KinRecall",
    };
    document.title = map[location.pathname] || "KinRecall";
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}
function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-neutral-50 border-b">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl">{title}</h1>
        {subtitle && (
          <p className="text-neutral-600 mt-2 max-w-prose">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
function Badge({ children, icon }: React.PropsWithChildren<{ icon?: React.ReactNode }>) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border px-3 py-1 shadow-sm">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-xs">{children}</span>
    </div>
  );
}

/********************
 * Family Selector (demo fallback + Supabase)
 ********************/
function FamilySelector() {
  const { userId, familyId, setUserId, setFamilyId } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newFamily, setNewFamily] = useState("");
  const [families, setFamilies] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(
    SUPABASE_ENABLED
      ? "Sign in to load your families."
      : "Demo mode: connect Supabase to enable real auth & families."
  );

  // Demo sign-in
  async function demoSignIn() {
    setLoading(true);
    try {
      const fakeUserId = `demo-${Date.now()}`;
      setUserId(fakeUserId);
      setNotice("Signed in (demo). Replace with Supabase Auth for real users.");
      if (families.length === 0) {
        const fid = `demo-family-${Math.random().toString(36).slice(2, 8)}`;
        setFamilies([{ id: fid, name: "My Family (demo)" }]);
        setFamilyId(fid);
      }
    } finally {
      setLoading(false);
    }
  }
  function demoCreateFamily() {
    if (!newFamily.trim()) return;
    const fid = `demo-family-${Math.random().toString(36).slice(2, 8)}`;
    setFamilies((prev) => [{ id: fid, name: newFamily.trim() }, ...prev]);
    setFamilyId(fid);
    setNewFamily("");
  }

  // Supabase flows
  async function supaSignIn() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUserId(data.user?.id || null);
      setNotice("Signed in via Supabase.");
      await supaLoadFamilies();
    } catch (e: any) {
      alert(e.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }
  async function supaSignUp() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setUserId(data.user?.id || null);
      setNotice("Check your email to confirm (if enabled). Then sign in.");
    } catch (e: any) {
      alert(e.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  }
  async function supaLoadFamilies() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("families")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn(error);
      setFamilies([]);
      return;
    }
    setFamilies((data as any[])?.map((d) => ({ id: d.id, name: d.name })) || []);
    if (!familyId && data && (data as any[])[0]) setFamilyId((data as any[])[0].id);
  }
  async function supaCreateFamily() {
    if (!supabase) return;
    if (!newFamily.trim()) return;
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) {
        alert("Please sign in first");
        return;
      }
      const { data: fam, error: e1 } = await supabase
        .from("families")
        .insert({ name: newFamily.trim() })
        .select()
        .single();
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("family_members").insert({
        family_id: (fam as any).id,
        user_id: user.id,
        role: "admin",
      });
      if (e2) throw e2;
      setNewFamily("");
      await supaLoadFamilies();
      setFamilyId((fam as any).id);
    } catch (e: any) {
      alert(e.message || "Could not create family");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!SUPABASE_ENABLED || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id || null;
      if (uid) setUserId(uid);
      supaLoadFamilies();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) supaLoadFamilies();
      else setFamilies([]);
    });
    return () => {
      (sub as any)?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInHandler = SUPABASE_ENABLED ? supaSignIn : demoSignIn;
  const createFamilyHandler = SUPABASE_ENABLED ? supaCreateFamily : demoCreateFamily;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Family vault</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-600">{notice}</p>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 grid grid-cols-2 gap-2">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={signInHandler} className="rounded-2xl" disabled={loading}>
                {userId ? "Re-sign" : "Sign in"}
              </Button>
              {SUPABASE_ENABLED && (
                <Button
                  variant="outline"
                  onClick={supaSignUp}
                  className="rounded-2xl"
                  disabled={loading}
                >
                  Sign up
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <Input
              className="md:col-span-2"
              placeholder="Create new family (e.g., The Patel Family)"
              value={newFamily}
              onChange={(e) => setNewFamily(e.currentTarget.value)}
            />
            <Button
              onClick={createFamilyHandler}
              className="rounded-2xl"
              disabled={!userId}
            >
              Create
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <label className="text-sm font-medium">Your families</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {families.length === 0 && (
                  <span className="text-sm text-neutral-500">None yet.</span>
                )}
                {families.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFamilyId(f.id)}
                    className={`text-sm px-3 py-1 rounded-full border ${
                      familyId === f.id ? "bg-black text-white border-black" : "bg-white"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            {SUPABASE_ENABLED && (
              <Button variant="outline" onClick={supaLoadFamilies}>
                Refresh
              </Button>
            )}
          </div>

          <div className="text-xs text-neutral-500">
            Current userId: <code>{userId || "—"}</code> • Current familyId:{" "}
            <code>{familyId || "—"}</code>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/********************
 * Pages
 ********************/
function Home() {
  return (
    <>
      <Helmet>
        <title>Home – KinRecall</title>
      </Helmet>
      <Hero />
      <FamilySelector />
      <HomeFeatures />
      <Pricing id="tiers" />
      <PreviewGallery />
      <FAQ />
      <CTA />
    </>
  );
}
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_20%_-10%,#fde68a,transparent),radial-gradient(600px_300px_at_90%_10%,#fecaca,transparent)] opacity-50" />
      <div className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">
            Keep their <span className="underline decoration-amber-400">voice</span> alive —
            a legacy your family can feel.
          </h1>
          <p className="mt-4 text-neutral-700 max-w-prose">
            KinRecall helps families preserve stories, laughter, and wisdom as an interactive archive — a private place where
            memories become an heirloom.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/pricing">
              <Button size="lg" className="rounded-2xl">
                Start Your Legacy
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="rounded-2xl">
                See How It Works
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-neutral-600">
            <I.shield />
            <span>Private & encrypted family vault</span>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl shadow-xl bg-white p-4 md:p-6">
            <div className="rounded-2xl border bg-neutral-50 p-4">
              <div className="aspect-[9/16] w-full rounded-xl bg-white shadow-inner p-4 grid grid-rows-[auto_1fr_auto]">
                <div className="text-center">
                  <span className="font-serif">KinRecall</span>
                </div>
                <div className="space-y-3">
                  {[
                    "Childhood",
                    "Love Story",
                    "Family Recipes",
                    "Wisdom & Advice",
                    "Future Messages",
                  ].map((label, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border p-3 bg-neutral-50"
                    >
                      <div className="flex items-center gap-3">
                        {i === 0 && <I.book />}
                        {i === 1 && <I.heart />}
                        {i === 2 && <I.image />}
                        {i === 3 && <I.lock />}
                        {i === 4 && <I.gift />}
                        <span>{label}</span>
                      </div>
                      <Button className="rounded-full" aria-label={`Play ${label}`}>
                        <I.play />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-neutral-500 text-center">
                  Private family vault • Invite only
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden md:block">
            <Badge icon={<I.sparkles />}>Loved by multi-generation families</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
function HomeFeatures() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10">
        <h2 className="font-serif text-3xl">What makes it special</h2>
        <p className="text-neutral-600 max-w-prose">
          Designed with care so every story feels close, safe, and easy to revisit.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ title, desc, Icon }) => (
          <Card key={title} className="rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-neutral-100 grid place-items-center">
                  <Icon />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 text-sm">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
function Features() {
  return (
    <>
      <Helmet>
        <title>Features – KinRecall</title>
      </Helmet>
      <PageHeader
        title="Everything you need to build a legacy"
        subtitle="From gentle interviews to beautifully printed books and a private vault, KinRecall is with you every step."
      />
      <HomeFeatures />
      <FAQ />
      <CTA />
    </>
  );
}
function Pricing({ id }: { id?: string }) {
  const { userId, familyId } = useAppState();
  return (
    <section id={id || "pricing"} className="bg-white border-y">
      <Helmet>
        <title>Pricing – KinRecall</title>
      </Helmet>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl">Choose your legacy path</h2>
          <p className="text-neutral-600">One-time packages with optional secure hosting.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`rounded-2xl ${tier.featured ? "ring-2 ring-amber-300" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.name}</CardTitle>
                  {tier.badge && (
                    <span className="text-xs rounded-full px-2 py-1 bg-neutral-100">
                      {tier.badge}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-2xl font-semibold">{tier.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {tier.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-neutral-900/70" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() =>
                    startCheckout(
                      tier.name.toLowerCase().includes("starter")
                        ? "starter"
                        : tier.name.toLowerCase().includes("family")
                        ? "family"
                        : "evara",
                      userId,
                      familyId
                    )
                  }
                  className="w-full mt-6 rounded-2xl"
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
function PreviewGallery() {
  return (
    <section id="preview" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10">
        <h2 className="font-serif text-3xl">A glimpse inside</h2>
        <p className="text-neutral-600 max-w-prose">
          Swipe through chapters, press play to hear a laugh, or unlock a message left for a future
          milestone.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {["Audio Chapters", "Life Story Film", "Future Messages"].map((title, idx) => (
          <div key={title}>
            <div className="rounded-2xl border bg-white p-4 h-full">
              <div className="aspect-video rounded-xl bg-neutral-100 grid place-items-center">
                {idx === 0 && <I.mic />}
                {idx === 1 && <I.video />}
                {idx === 2 && <I.gift />}
              </div>
              <h3 className="mt-3 font-medium">{title}</h3>
              <p className="text-sm text-neutral-600">
                Sample preview placeholder. Replace with real screenshots or clips.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function FAQ() {
  return (
    <section className="bg-neutral-50 border-t">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <h2 className="font-serif text-3xl">Questions & Answers</h2>
          <p className="text-neutral-600">We keep things gentle, private, and simple.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map(({ q, a }) => (
            <Card key={q} className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">{q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 text-sm">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
function CTA() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h2 className="font-serif text-3xl">Ready to start a gentle conversation?</h2>
      <p className="text-neutral-600">
        Tell us a little about your loved one and the legacy you’d like to create.
      </p>
      <Link to="/contact">
        <Button size="lg" className="mt-4 rounded-2xl">
          Request a Callback
        </Button>
      </Link>
    </section>
  );
}
function Stories() {
  const items = [
    {
      title: "Anna & Gran",
      copy:
        "We recorded lullabies and wartime stories. On my daughter’s 18th, a message unlocked — we all cried.",
    },
    {
      title: "The Patel Family",
      copy:
        "Dad’s recipes became a cookbook with QR codes. Now Sunday curries taste like home again.",
    },
    {
      title: "Maya’s Heirloom Film",
      copy:
        "A 45-minute biopic we watch every Diwali. Her laugh fills the room.",
    },
  ];
  return (
    <>
      <Helmet>
        <title>Stories – KinRecall</title>
      </Helmet>
      <PageHeader
        title="Family stories"
        subtitle="A few ways KinRecall becomes part of the home."
      />
      <section className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-3 gap-6">
        {items.map((it
