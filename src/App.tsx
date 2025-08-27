// Use the App.tsx provided in canvas (KinRecall branding)
import React, { useEffect, useState, useContext, createContext } from "react";
import { BrowserRouter, HashRouter, Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { createClient } from "@supabase/supabase-js";

/********************
 * UI primitives
 ********************/
function Button({ children, className = "", variant, size, ...props }: any) {
  const base = "inline-flex items-center justify-center font-medium border rounded-md transition px-4 py-2";
  const styles = variant === "outline"
    ? "bg-transparent border-gray-300 hover:bg-gray-50"
    : variant === "link"
      ? "bg-transparent border-transparent underline hover:opacity-80"
      : "bg-black text-white border-black hover:bg-gray-800";
  const sizes = size === "lg" ? "px-5 py-3 text-base" : size === "icon" ? "p-2" : "";
  return (
    <button className={`${base} ${styles} ${sizes} ${className}`} {...props}>{children}</button>
  );
}
function Card({ className = "", children }: any) {
  return <div className={`border rounded-xl bg-white ${className}`}>{children}</div>;
}
function CardHeader({ children, className = "" }: any) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}
function CardTitle({ children, className = "" }: any) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
function CardContent({ children, className = "" }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function Input(props: any) {
  return <input {...props} className={`w-full border rounded-md px-3 py-2 outline-none focus:ring ${props.className||""}`} />;
}
function Textarea(props: any) {
  return <textarea {...props} className={`w-full border rounded-md px-3 py-2 outline-none focus:ring ${props.className||""}`} />;
}

/********************
 * Icons
 ********************/
const I = {
  heart: (props:any) => <span aria-hidden {...props}>💛</span>,
  book: (props:any) => <span aria-hidden {...props}>📖</span>,
  gift: (props:any) => <span aria-hidden {...props}>🎁</span>,
  lock: (props:any) => <span aria-hidden {...props}>🔒</span>,
  mic: (props:any) => <span aria-hidden {...props}>🎤</span>,
  video: (props:any) => <span aria-hidden {...props}>🎬</span>,
  image: (props:any) => <span aria-hidden {...props}>🖼️</span>,
  shield: (props:any) => <span aria-hidden {...props}>🛡️</span>,
  play: (props:any) => <span aria-hidden {...props}>▶️</span>,
  sparkles: (props:any) => <span aria-hidden {...props}>✨</span>,
  calendar: (props:any) => <span aria-hidden {...props}>📅</span>,
};

/********************
 * Data
 ********************/
const features = [
  { title: "Hear Their Voice, Anytime", desc: "Private audio stories in chapters — Childhood, Love Story, Wisdom, and more.", Icon: I.mic },
  { title: "A Life in Motion", desc: "Short films that weave photos, interviews, and favorite music into a biopic.", Icon: I.video },
  { title: "Storybook + QR Codes", desc: "Beautiful books with scannable codes that play the exact moment being read.", Icon: I.book },
  { title: "Future Messages", desc: "Time-locked notes for birthdays, weddings, and milestones yet to come.", Icon: I.calendar },
  { title: "Private Family Vault", desc: "Invite-only access with encryption and granular sharing controls.", Icon: I.shield },
  { title: "Photo & Document Digitisation", desc: "Curated galleries of photos, letters, recipes, and keepsakes.", Icon: I.image },
];

const tiers = [
  { name: "Starter Capsule", price: "£249 one-time", highlights: ["1–2 hr guided audio session","Up to 30 photos digitised","Mini storybook (20 pages)","Private vault access"], cta: "Get Starter", badge: "Great for first-timers" },
  { name: "Family Legacy Vault", price: "£990 one-time", highlights: ["Up to 6 hrs video + audio","100+ photos & documents","Hardcover life storybook (100 pages)","Future messages scheduling"], cta: "Build Your Vault", featured: true, badge: "Most popular" },
  { name: "KinRecall Box", price: "£2,900 one-time", highlights: ["Documentary film (30–60 min)","Engraved keepsake box + USB","Archival-quality hardcover","Interactive frame with voice play"], cta: "Create an Heirloom", badge: "Luxury heirloom" },
];

const faqs = [
  { q: "Who is KinRecall for?", a: "Families who want a warm, human way to preserve a loved one’s stories, voice, and presence for future generations." },
  { q: "How is content kept private?", a: "Your family vault is invite-only with encryption at rest and in transit. You control exactly who sees each chapter." },
  { q: "Can we add more later?", a: "Yes. You can add recordings, photos, and future messages at any time. We offer ongoing curation on request." },
  { q: "Do you work with hospices and funeral homes?", a: "Yes. We partner with care providers to offer gentle, high-touch recording and curation packages." },
];

/********************
 * Supabase client
 ********************/
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const SUPABASE_ENABLED = !!supabase;

/********************
 * Router chooser
 ********************/
const RouterChooser: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const isSandbox = typeof window !== 'undefined' && String(window.location.origin || '').startsWith('sandbox:');
  const R: any = isSandbox ? HashRouter : BrowserRouter;
  return <R>{children}</R>;
};

/********************
 * Global state
 ********************/
type AppState = { userId: string|null, familyId: string|null, setUserId: (v:string|null)=>void, setFamilyId: (v:string|null)=>void };
const AppStateContext = createContext<AppState>({ userId: null, familyId: null, setUserId: ()=>{}, setFamilyId: ()=>{} });
const useAppState = () => useContext(AppStateContext);

/********************
 * App
 ********************/
export default function App() {
  const [userId, setUserId] = useState<string|null>(null);
  const [familyId, setFamilyId] = useState<string|null>(null);
  const state = { userId, familyId, setUserId, setFamilyId };

  return (
    <HelmetProvider>
      <AppStateContext.Provider value={state}>
        <RouterChooser>
          <Helmet>
            <title>KinRecall – Preserve Family Stories</title>
            <meta name="description" content="KinRecall helps families preserve stories, laughter, and wisdom as an interactive archive — a private place where memories become an heirloom." />
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
 * Pages and components (Hero, Features, Pricing, etc.)
 * -- to save space, I'm not re-pasting *all* helper pages here,
 * but in your earlier canvas version they are included.
 * Make sure you copy the full App.tsx from that version.
 ********************/

function ScrollTitle() {
  const location = useLocation();
  useEffect(() => {
    const map: Record<string,string> = {
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
        <Link to="/contact"><Button className="rounded-2xl">Request a Demo</Button></Link>
      </div>
    </header>
  );
}
function NavItem({ to = "/", children }: any) {
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
          <p className="text-sm text-neutral-600 mt-3 max-w-xs">Stories that outlive time. Built with privacy and tenderness at the core.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li><Link to="/features" className="hover:underline">Features</Link></li>
            <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link to="/partners" className="hover:underline">Partners</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Get updates</h4>
          <div className="flex gap-2">
            <Input placeholder="Email address" type="email" />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">By subscribing you agree to our privacy policy.</p>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-500 pb-8">© {new Date().getFullYear()} KinRecall. All rights reserved.</div>
    </footer>
  );
}
