import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import HeroWorldMap from "./HeroWorldMap";
import HeroMockup from "./HeroMockup";
import SettingsPanel from "./SettingsPanel";

/* ─── Tokens ─────────────────────────────────────────────── */
const C = {
  bg:          "var(--c-bg)",
  bgAlt:       "var(--c-bg-alt)",
  bgBlue:      "var(--c-bg-blue)",
  text:        "var(--c-text)",
  sub:         "var(--c-sub)",
  muted:       "var(--c-muted)",
  accent:      "#3b82f6",
  navy:        "#1e40af",
  border:      "var(--c-border)",
  borderLight: "var(--c-border-light)",
};

/* ─── Design System ──────────────────────────────────────── */
const DS = {
  btnRadius: 9999, // pill shape — all buttons
};

/* Brand "spectrum" gradient — coral → magenta → purple → blue.
   Used in the dashboard glow, tab line, dashboard border, etc. */
const BRAND_SPECTRUM = "linear-gradient(90deg, rgba(241,76,79,1) 0%, rgba(220,2,165,1) 45%, rgba(117,79,247,1) 75%, rgba(55,134,248,1) 100%)";

/* ─── Utilities ──────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </p>
  );
}

function Wrap({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1216, margin: "0 auto", padding: "0 32px", ...style }}>
      {children}
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800, t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Marquee ────────────────────────────────────────────── */
const CLIENTS = ["Maersk","DHL","Kuehne+Nagel","DB Schenker","Cargill","Unilever","Nestlé","Nike","Samsung","BASF","Michelin","Caterpillar"];

function Marquee({ size = "sm" }: { bg?: string; size?: "sm" | "lg" }) {
  const items = [...CLIENTS, ...CLIENTS];
  const isLg = size === "lg";
  return (
    // Hard clip on both edges via overflow:hidden — no fade gradients.
    // Logos at the edges appear cut off cleanly (clipping mask, not faded).
    <div style={{ position: "relative", overflow: "hidden" }}>
      <motion.div
        style={{ display: "flex", gap: isLg ? 72 : 56, width: "max-content", alignItems: "center" }}
        animate={{ x: "-50%" }}
        transition={{ duration: isLg ? 48 : 38, repeat: Infinity, ease: "linear" }}
      >
        {items.map((name, i) => (
          <span
            key={i}
            style={{
              fontSize: isLg ? 22 : 13,
              fontWeight: 700,
              letterSpacing: isLg ? "-0.02em" : "0",
              color: C.muted,
              whiteSpace: "nowrap",
              flexShrink: 0,
              cursor: "default",
              // Slow fade in/out to the theme's brightest text color on hover
              transition: "color 0.6s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT UI MOCKUPS
══════════════════════════════════════════════════════════ */

/* ─── Shared helpers ─────────────────────────────────────── */
function MockupFrame({ children, url = "app.trames.io" }: { children: React.ReactNode; url?: string }) {
  return (
    <div style={{ borderRadius: 16, boxShadow: "0 24px 64px rgba(15,23,42,0.14), 0 1px 3px rgba(15,23,42,0.06)", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fca5a5", display: "inline-block" }}/>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fde68a", display: "inline-block" }}/>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#86efac", display: "inline-block" }}/>
        <div style={{ flex: 1, marginLeft: 6, background: "#e2e8f0", borderRadius: 5, height: 18, display: "flex", alignItems: "center", padding: "0 8px" }}>
          <span style={{ fontSize: 9.5, color: "#94a3b8" }}>{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function SideIcon({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
      background: active ? "rgba(59,130,246,0.18)" : "transparent", color: active ? C.accent : "#475569" }}>
      {children}
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, color, background: bg, padding: "2px 7px", borderRadius: 10, whiteSpace: "nowrap", display: "inline-block" }}>
      {label}
    </span>
  );
}

/* ── Container ship SVG component ───────────────────────────
   600×200 local space, stern=left (x=0), bow=right (x=600) */
function ContainerShip({ x = 0, y = 0, scale = 1, flip = false }: {
  x?: number; y?: number; scale?: number; flip?: boolean;
}) {
  const t = flip
    ? `translate(${x + scale * 600},${y}) scale(${-scale},${scale})`
    : `translate(${x},${y}) scale(${scale})`;
  const cc = ["#2563eb","#ea580c","#475569","#3b82f6","#1d4ed8","#64748b","#dc2626","#0369a1","#9a3412","#f97316","#1e3a8a","#374151"];
  const containers: React.ReactNode[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const cx2 = 140 + col * 70;
      const cy2 = 10 + row * 24;
      const color = cc[(row * 7 + col * 3) % cc.length];
      containers.push(
        <g key={`${row}-${col}`}>
          <rect x={cx2} y={cy2} width={66} height={20} rx="2" fill={color} opacity={0.93}/>
          <rect x={cx2 + 1} y={cy2 + 1} width={64} height={3} rx="1" fill="rgba(255,255,255,0.14)"/>
          <line x1={cx2 + 33} y1={cy2} x2={cx2 + 33} y2={cy2 + 20} stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
        </g>
      );
    }
  }
  return (
    <g transform={t}>
      {/* Hull */}
      <path d="M 10,115 L 555,115 L 555,165 L 20,165 Z" fill="#b91c1c"/>
      <path d="M 20,165 L 555,165 L 558,175 L 18,175 Z" fill="#7f1d1d"/>
      {/* Deck strip */}
      <rect x="10" y="104" width="545" height="13" fill="#1e293b"/>
      {/* Bow */}
      <path d="M 555,104 L 598,128 L 592,165 L 555,165 Z" fill="#991b1b"/>
      <path d="M 555,104 L 598,104 L 598,128 Z" fill="#7f1d1d"/>
      {/* Bridge tower */}
      <rect x="8" y="22" width="112" height="84" rx="3" fill="#f1f5f9"/>
      <rect x="8" y="22" width="112" height="10" fill="#e2e8f0" rx="3"/>
      <rect x="0" y="100" width="130" height="6" fill="#475569"/>
      {/* Bridge windows row 1 */}
      {[22, 46, 70, 94].map(wx => (
        <rect key={`w1-${wx}`} x={wx} y={54} width={16} height={10} rx="2" fill="#bfdbfe" opacity={0.9}/>
      ))}
      {/* Bridge windows row 2 */}
      {[22, 46, 70].map(wx => (
        <rect key={`w2-${wx}`} x={wx} y={74} width={16} height={8} rx="1.5" fill="#dbeafe" opacity={0.65}/>
      ))}
      {/* Funnels */}
      <rect x="40" y="2" width="28" height="24" rx="3" fill="#334155"/>
      <rect x="36" y="0" width="36" height="7" rx="2" fill="#1e293b"/>
      <rect x="76" y="10" width="16" height="16" rx="2" fill="#475569"/>
      {/* Containers */}
      {containers}
      {/* Water reflection */}
      <path d="M 15,175 L 560,175 L 594,185 L 10,185 Z" fill="rgba(30,58,138,0.22)"/>
      <path d="M 20,185 L 570,185 L 596,200 L 15,200 Z" fill="rgba(30,58,138,0.1)"/>
    </g>
  );
}

/* Hero — Full-width ship image */
function HeroNetworkSVG() {
  return (
    <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
      <img
        src={`${import.meta.env.BASE_URL}hero-ships.webp`}
        alt="Container ships on ocean"
        style={{
          width: "100%",
          height: "clamp(360px, 52vw, 680px)",
          objectFit: "cover",
          objectPosition: "center 62%",
          display: "block",
        }}
      />
      {/* Bottom fade so image blends into next section */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: `linear-gradient(to bottom, transparent, ${C.bg})`,
        pointerEvents: "none",
      }}/>
    </div>
  );
}

/* Pillar 1 — Shipment detail */
function SVGVisibility() {
  const steps = [
    { label: "Origin",     sub: "Shanghai",    done: true,  active: false },
    { label: "Loaded",     sub: "Departure",   done: true,  active: false },
    { label: "In Transit", sub: "Pacific",     done: false, active: true  },
    { label: "Customs",    sub: "Rotterdam",   done: false, active: false },
    { label: "Delivered",  sub: "Destination", done: false, active: false },
  ];
  return (
    <MockupFrame url="app.trames.io/shipments/TRM-28471">
      <div style={{ background: "#fff", padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>BL #TRM-28471</p>
            <p style={{ fontSize: 9.5, color: C.muted, margin: "2px 0 0" }}>MSC ARIA · SHA → RTM · 40HC</p>
          </div>
          <Badge label="In Transit" color="#f59e0b" bg="#fffbeb"/>
        </div>
        <div style={{ background: C.bgBlue, border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 8.5, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Estimated Arrival</p>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.navy, margin: "2px 0 0" }}>Jul 28, 2025</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8.5, color: C.muted, margin: 0 }}>Container</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "1px 0 0" }}>MSKU 304182-5</p>
          </div>
        </div>
        <div style={{ position: "relative", padding: "4px 0 12px" }}>
          <div style={{ position: "absolute", top: 18, left: 12, right: 12, height: 2, background: C.borderLight }}/>
          <div style={{ position: "absolute", top: 18, left: 12, width: "42%", height: 2, background: C.accent }}/>
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
                <div style={{
                  width: s.active ? 22 : 17, height: s.active ? 22 : 17, borderRadius: "50%", flexShrink: 0,
                  background: s.active ? C.accent : s.done ? C.navy : "white",
                  border: `2px solid ${s.active ? C.accent : s.done ? C.navy : "#cbd5e1"}`,
                  boxShadow: s.active ? "0 0 0 4px rgba(59,130,246,0.18)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {s.done && !s.active && <svg width="7" height="7" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  {s.active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }}/>}
                </div>
                <p style={{ fontSize: 8, fontWeight: s.active ? 700 : 500, color: s.active ? C.accent : s.done ? C.text : C.muted, margin: 0, textAlign: "center", lineHeight: 1.3 }}>{s.label}</p>
                <p style={{ fontSize: 7.5, color: C.muted, margin: 0, textAlign: "center" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Bill of Lading", "Packing List", "Commercial Invoice"].map(d => (
            <div key={d} style={{ flex: 1, background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 8px" }}>
              <p style={{ fontSize: 10, margin: 0 }}>📄</p>
              <p style={{ fontSize: 8.5, fontWeight: 600, color: C.text, margin: "2px 0 0", lineHeight: 1.3 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* Pillar 2 — Exception queue */
function SVGAutomation() {
  const items = [
    { id: "EX-0084", title: "Vessel departure delayed 18h",  sev: "High",   sevC: "#ef4444", sevBg: "#fef2f2", action: "Notify team",  time: "2 min ago",  bl: "TRM-28471" },
    { id: "EX-0083", title: "Missing customs documentation", sev: "High",   sevC: "#ef4444", sevBg: "#fef2f2", action: "Request docs", time: "14 min ago", bl: "TRM-28398" },
    { id: "EX-0081", title: "ETA deviation over 48 hours",   sev: "Medium", sevC: "#f59e0b", sevBg: "#fffbeb", action: "Update ETA",  time: "1h ago",     bl: "TRM-28380" },
    { id: "EX-0079", title: "Invoice vs contract mismatch",  sev: "Medium", sevC: "#f59e0b", sevBg: "#fffbeb", action: "Flag dispute", time: "3h ago",    bl: "TRM-28360" },
  ];
  return (
    <MockupFrame url="app.trames.io/automation/exceptions">
      <div style={{ background: "#fff" }}>
        <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>Exception Queue</p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }}/>
            <span style={{ fontSize: 9.5, color: C.sub, fontWeight: 500 }}>4 active</span>
          </div>
        </div>
        {items.map((ex, i) => (
          <div key={i} style={{ padding: "10px 14px", borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : "none", display: "flex", alignItems: "center", gap: 10, background: i === 0 ? "#fff8f8" : "white" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 8.5, fontWeight: 600, color: C.muted }}>{ex.id}</span>
                <Badge label={ex.sev} color={ex.sevC} bg={ex.sevBg}/>
                <span style={{ fontSize: 8.5, color: C.muted }}>· {ex.bl}</span>
              </div>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.3 }}>{ex.title}</p>
              <p style={{ fontSize: 8.5, color: C.muted, margin: "2px 0 0" }}>{ex.time}</p>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.accent, background: C.bgBlue, border: "1px solid #bfdbfe", padding: "3px 9px", borderRadius: 8, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              {ex.action}
            </span>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* Pillar 3 — Analytics dashboard */
function SVGAnalytics() {
  const kpis = [
    { label: "Active Shipments", val: "142", change: "+12%", color: "#22c55e" },
    { label: "On-Time Rate",     val: "83%", change: "+4pp", color: "#22c55e" },
    { label: "Avg Delay",        val: "2.1d", change: "−0.6d", color: "#22c55e" },
  ];
  const bars = [
    { route: "SHA→EU", val: "$4.2M", pct: 82, color: "#3b82f6" },
    { route: "SG→US",  val: "$3.1M", pct: 61, color: "#6366f1" },
    { route: "ME→EU",  val: "$2.2M", pct: 44, color: "#8b5cf6" },
    { route: "Other",  val: "$1.4M", pct: 27, color: "#a5b4fc" },
  ];
  const trend = [
    { m: "Jan", v: 62 }, { m: "Feb", v: 71 }, { m: "Mar", v: 68 },
    { m: "Apr", v: 79 }, { m: "May", v: 76 }, { m: "Jun", v: 83 },
  ];
  return (
    <MockupFrame url="app.trames.io/analytics">
      <div style={{ background: "#fff", padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: C.bgAlt, borderRadius: 8, padding: "9px 10px", border: `1px solid ${C.borderLight}` }}>
              <p style={{ fontSize: 8.5, color: C.muted, margin: 0, fontWeight: 500 }}>{k.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 3 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0, lineHeight: 1 }}>{k.val}</p>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: k.color }}>{k.change}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* Bar chart */}
          <div style={{ background: C.bgAlt, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.borderLight}` }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.sub, margin: "0 0 8px" }}>Spend by Route</p>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 72 }}>
              {bars.map(b => (
                <div key={b.route} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 7.5, fontWeight: 700, color: C.sub }}>{b.val}</span>
                  <div style={{ width: "100%", height: b.pct * 0.52, background: b.color, borderRadius: "3px 3px 0 0", opacity: 0.9 }}/>
                  <span style={{ fontSize: 7.5, color: C.muted, whiteSpace: "nowrap" }}>{b.route}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Line chart */}
          <div style={{ background: C.bgAlt, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.borderLight}` }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.sub, margin: "0 0 8px" }}>On-Time Rate %</p>
            <svg viewBox="0 0 120 72" width="100%" style={{ display: "block" }}>
              <polyline
                points={trend.map((t, i) => `${10 + i * 20},${72 - t.v * 0.68}`).join(" ")}
                fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {trend.map((t, i) => (
                <circle key={i} cx={10 + i * 20} cy={72 - t.v * 0.68} r="2.5" fill={C.accent}/>
              ))}
              {trend.map((t, i) => (
                <text key={i} x={10 + i * 20} y="71" textAnchor="middle" fontSize="7" fill={C.muted} fontFamily="Inter,system-ui">{t.m}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* Pillar 4 — Invoice audit table */
function SVGSpend() {
  const lines = [
    { desc: "Ocean Freight – 20FT", contract: "$3,200", invoice: "$3,200", status: "match",    label: "Match",   color: "#22c55e", bg: "#f0fdf4" },
    { desc: "Origin THC",           contract: "$420",   invoice: "$420",   status: "match",    label: "Match",   color: "#22c55e", bg: "#f0fdf4" },
    { desc: "Bunker Surcharge",     contract: "$680",   invoice: "$1,120", status: "mismatch", label: "+$440",   color: "#ef4444", bg: "#fef2f2" },
    { desc: "Destination THC",      contract: "$380",   invoice: "$380",   status: "match",    label: "Match",   color: "#22c55e", bg: "#f0fdf4" },
    { desc: "Documentation Fee",    contract: "$80",    invoice: "$1,090", status: "mismatch", label: "+$1,010", color: "#ef4444", bg: "#fef2f2" },
  ];
  return (
    <MockupFrame url="app.trames.io/spend/INV-0411">
      <div style={{ background: "#fff" }}>
        <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>INV-2025-0411 · Maersk</p>
            <p style={{ fontSize: 9.5, color: C.muted, margin: "1px 0 0" }}>BL #TRM-28471 · Total: $14,210</p>
          </div>
          <Badge label="2 Disputes" color="#ef4444" bg="#fef2f2"/>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 56px", padding: "5px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
          {["Line Item","Contract","Invoice","Status"].map(h => (
            <p key={h} style={{ fontSize: 8, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>{h}</p>
          ))}
        </div>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 56px", padding: "8px 16px", borderBottom: i < lines.length - 1 ? `1px solid ${C.borderLight}` : "none", background: l.status === "mismatch" ? "#fff8f8" : "white", alignItems: "center" }}>
            <p style={{ fontSize: 10, color: C.text, margin: 0, paddingRight: 8 }}>{l.desc}</p>
            <p style={{ fontSize: 10, color: C.sub, margin: 0 }}>{l.contract}</p>
            <p style={{ fontSize: 10, fontWeight: l.status === "mismatch" ? 700 : 400, color: l.status === "mismatch" ? "#ef4444" : C.sub, margin: 0 }}>{l.invoice}</p>
            <Badge label={l.label} color={l.color} bg={l.bg}/>
          </div>
        ))}
        <div style={{ padding: "10px 16px", background: "#fef2f2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>Total Overcharge Detected</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>+$1,450</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE SECTIONS
══════════════════════════════════════════════════════════ */

/* ─── NAV ────────────────────────────────────────────────── */
function Nav({ isDark }: { isDark: boolean }) {
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const compute = () => {
      const heroCard = document.getElementById("hero-card");
      if (heroCard) {
        const heroBottom = heroCard.offsetTop + heroCard.offsetHeight;
        setPastHero(window.scrollY > heroBottom - 80);
      } else {
        setPastHero(window.scrollY > 800);
      }
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // In light theme, hero bg is light → dark text. In dark theme, hero bg is dark → light text.
  // Pill has its own bg matching the theme, so same rule applies.
  const useDark = !isDark;
  const linkColor = useDark ? C.sub : "rgba(255,255,255,0.65)";
  const linkHover = useDark ? C.text : "#ffffff";
  const hamburgerColor = useDark ? C.text : "#ffffff";

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    top: 16,
    left: "50%",
    zIndex: 50,
    width: "calc(100% - 32px)",
  };

  const wideStyle: React.CSSProperties = {
    ...baseStyle,
    position: "absolute",
    maxWidth: 1280,
    borderRadius: 18,
    background: "transparent",
    border: "1px solid transparent",
  };

  const pillStyle: React.CSSProperties = {
    ...baseStyle,
    maxWidth: 980,
    borderRadius: 9999,
    background: isDark ? "rgba(10,12,20,0.55)" : "rgba(255,255,255,0.62)",
    backdropFilter: "blur(20px) saturate(1.4)",
    WebkitBackdropFilter: "blur(20px) saturate(1.4)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}`,
    boxShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.18)"
      : "0 8px 32px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)",
  };

  const renderContent = (showBookDemo: boolean, padding: string) => (
    <Wrap style={{ height: 60, maxWidth: "none", padding, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          {/* Logo */}
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Tramés"
            style={{
              height: 32,
              width: "auto",
              display: "block",
              filter: useDark ? "none" : "brightness(0) invert(0.92)",
              transition: "filter 0.3s",
            }}
          />

          {/* Desktop links + CTAs — right-aligned, links sit beside Contact */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
            {["Features","Company","Resources","Newsroom"].map(l => (
              <a key={l} href="#" style={{ fontSize: 14, fontWeight: 500, color: linkColor, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
                onMouseLeave={e => (e.currentTarget.style.color = linkColor)}>
                {l}
              </a>
            ))}
            <a href="#" style={{ fontSize: 14, fontWeight: 500, color: linkColor, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
              onMouseLeave={e => (e.currentTarget.style.color = linkColor)}>Contact</a>
            {showBookDemo && (
              <motion.button
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{ padding: "9px 20px", borderRadius: DS.btnRadius, background: C.accent, color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.navy)}
                onMouseLeave={e => (e.currentTarget.style.background = C.accent)}>
                Book Demo
              </motion.button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden"
            style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ width: 20, display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ height: 2, background: hamburgerColor, borderRadius: 2, transition: "all 0.2s", transform: open ? "rotate(45deg) translate(0,6px)" : "", display: "block" }}/>
              <span style={{ height: 2, background: hamburgerColor, borderRadius: 2, opacity: open ? 0 : 1, display: "block" }}/>
              <span style={{ height: 2, background: hamburgerColor, borderRadius: 2, transition: "all 0.2s", transform: open ? "rotate(-45deg) translate(0,-6px)" : "", display: "block" }}/>
            </div>
          </button>
        </Wrap>
      );

      return (
        <>
          <AnimatePresence>
            {!pastHero && (
              <motion.nav
                key="wide"
                initial={{ x: "-50%", opacity: 1 }}
                animate={{ x: "-50%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={wideStyle}
              >
                {renderContent(false, "0 64px")}
              </motion.nav>
            )}
            {pastHero && (
              <motion.nav
                key="pill"
                initial={{ x: "-50%", y: -110, opacity: 0 }}
                animate={{ x: "-50%", y: 0, opacity: 1 }}
                exit={{ x: "-50%", y: -110, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={pillStyle}
              >
                {renderContent(true, "0 16px")}
              </motion.nav>
            )}
          </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: "fixed", top: 84, left: 16, right: 16, zIndex: 40, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 18, padding: "20px 24px 24px", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}>
            {["Features","Company","Resources","Newsroom","Contact"].map(l => (
              <a key={l} href="#" style={{ display: "block", padding: "10px 0", fontSize: 15, fontWeight: 500, color: C.text, textDecoration: "none", borderBottom: `1px solid ${C.borderLight}` }}>{l}</a>
            ))}
            <button style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: DS.btnRadius, background: C.accent, color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>
              Book Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


/* ─── HERO ───────────────────────────────────────────────── */
const HERO_TABS = [
  { id: "tracking",  label: "Tracking" },
  { id: "automate",  label: "Workflows" },
  { id: "analytics", label: "Analytics" },
  { id: "spend",     label: "Spend" },
];

function Hero({ isDark, shipSpotlight, mapStyle }: { isDark: boolean; shipSpotlight: boolean; mapStyle: "line" | "filled" }) {
  const heroEndColor = isDark ? "#090d18" : "#f4f7fe";
  const dashboardBody = isDark ? "#0d1117" : "#ffffff";
  const [activeTab, setActiveTab] = useState<string>("tracking");
  const [titleHover, setTitleHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--hero-mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--hero-my", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--hero-mx", "-400px");
    el.style.setProperty("--hero-my", "-400px");
  };

  return (
    <div style={{ background: C.bg, padding: "12px 12px 0 12px", position: "relative", zIndex: 2 }}>

      {/* Card — auto height, full dashboard + trusted-by inside */}
      <div
        id="hero-card"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ borderRadius: 16, overflow: "hidden", background: "var(--c-hero-bg)", position: "relative", border: `1px solid ${C.borderLight}` }}
      >

        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "-10%", left: "5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 60%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", top: "30%", right: "-8%", width: 560, height: 560, background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 60%)", pointerEvents: "none" }}/>

        {/* World map — spotlight-revealed, behind content */}
        <HeroWorldMap shipSpotlight={shipSpotlight} mapStyle={mapStyle} isDark={isDark} />

        <div style={{ position: "relative", zIndex: 1 }}>

          <Wrap style={{ paddingTop: 280 }}>

            <motion.h1
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
              onMouseEnter={() => setTitleHover(true)}
              onMouseLeave={() => setTitleHover(false)}
              style={{ fontSize: "clamp(36px, 4.5vw, 64px)", fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.03em", color: C.text, margin: "0 0 28px", maxWidth: "65%", textShadow: "0 0 16px var(--c-hero-bg-solid), 0 0 32px var(--c-hero-bg-solid)" }}
            >
              The{" "}
              <span style={{
                background: BRAND_SPECTRUM,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: titleHover ? "transparent" : "currentColor",
                transition: "-webkit-text-fill-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                textShadow: "none",
              }}>
                AI-native OS
              </span>
              {" "}for<br />global supply chains.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40, marginBottom: 72, flexWrap: "wrap" }}
            >
              <p style={{ fontSize: 16, lineHeight: 1.6, color: C.sub, maxWidth: 420, margin: 0, textShadow: "0 0 12px var(--c-hero-bg-solid), 0 0 24px var(--c-hero-bg-solid)" }}>
                One platform for global freight — real-time tracking, carrier integrations, and full control.
              </p>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: DS.btnRadius, background: "var(--c-btn-bg)", color: C.sub, fontWeight: 500, fontSize: 14, border: "1px solid var(--c-btn-border)", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-btn-border)"; e.currentTarget.style.color = C.sub; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch
                </button>
                <button
                  style={{ padding: "10px 22px", borderRadius: DS.btnRadius, background: C.accent, color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.navy)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.accent)}
                >
                  Book Demo
                </button>
              </div>
            </motion.div>

          </Wrap>

          {/* Tab bar — line spans full dashboard width, tabs inset inside; single SVG with gradient stroke and CSS blur for soft glow */}
          {(() => {
            const activeIndex = HERO_TABS.findIndex(t => t.id === activeTab);
            const N      = HERO_TABS.length;
            const PAD    = 64;          // viewBox padding around tabs (matches tab inset from dashboard edge)
            const TW     = 256;         // viewBox tab width
            const totalW = PAD * 2 + N * TW;  // 1152 = dashboard width
            const H      = 50;          // viewBox tab strip height
            const aL     = PAD + activeIndex * TW;
            const aR     = PAD + (activeIndex + 1) * TW;
            const IR     = 10;          // inverse curve radius
            const TR     = 16;          // top corner radius — matches dashboard top radius
            const yT     = 0.5;
            const yB     = H - 0.5;

            const pathD = [
              `M 0 ${yB}`,                                         // left straight end at dashboard's left edge
              `L ${aL - IR} ${yB}`,                                // horizontal line to start of left inverse curve
              `Q ${aL} ${yB}, ${aL} ${yB - IR}`,                   // left inverse curve up into active tab
              `L ${aL} ${yT + TR}`,                                // up active tab's left border
              `Q ${aL} ${yT}, ${aL + TR} ${yT}`,                   // top-left rounded corner
              `L ${aR - TR} ${yT}`,                                // top border
              `Q ${aR} ${yT}, ${aR} ${yT + TR}`,                   // top-right rounded corner
              `L ${aR} ${yB - IR}`,                                // down active tab's right border
              `Q ${aR} ${yB}, ${aR + IR} ${yB}`,                   // right inverse curve out
              `L ${totalW} ${yB}`,                                 // horizontal to dashboard's right edge
            ].join(" ");

            return (
              <div style={{ position: "relative", maxWidth: 1216, margin: "0 auto", width: "100%", padding: "0 32px", marginBottom: 36, zIndex: 3 }}>
                <div style={{ position: "relative" }}>
                  <svg
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      overflow: "visible",
                    }}
                    viewBox={`0 0 ${totalW} ${H}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="tabLineGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={totalW} y2="0">
                        <stop offset="0%"   stopColor="rgba(241,76,79,0)" />
                        <stop offset="6%"   stopColor="rgba(241,76,79,0.6)" />
                        <stop offset="45%"  stopColor="rgba(220,2,165,0.6)" />
                        <stop offset="75%"  stopColor="rgba(117,79,247,0.6)" />
                        <stop offset="94%"  stopColor="rgba(55,134,248,0.6)" />
                        <stop offset="100%" stopColor="rgba(55,134,248,0)" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d={pathD}
                      stroke="url(#tabLineGrad)"
                      fill="none"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      initial={false}
                      animate={{ d: pathD }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>

                  <div style={{ display: "flex", width: "100%", position: "relative", zIndex: 1, padding: "0 64px", boxSizing: "border-box" }}>
                    {HERO_TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <div
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          style={{
                            flex: 1,
                            padding: "14px 20px",
                            background: "transparent",
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? C.text : C.sub,
                            fontSize: 15,
                            textAlign: "center",
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "color 0.15s",
                          }}
                        >
                          {tab.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dashboard — full height, fade at bottom */}
          <div style={{ position: "relative", maxWidth: 1216, margin: "0 auto", width: "100%" }}>
            {/* Glow clipping wrapper — overflow:hidden clips blur extension below the dashboard */}
            <div style={{
              position: "absolute",
              inset: "-32px 0px 0px",
              zIndex: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(241,76,79,0.5) 0%, rgba(220,2,165,0.5) 45%, rgba(117,79,247,0.5) 75%, rgba(55,134,248,0.5) 100%)",
                // Two stacked masks — vertical for top/bottom fade, horizontal for left/right fade — composited via intersect so only pixels visible in BOTH show
                WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 22%, #000 62%, transparent 100%), linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskImage: "linear-gradient(180deg, transparent 0%, #000 22%, #000 62%, transparent 100%), linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)",
                maskComposite: "intersect",
                filter: "blur(24px)",
                borderRadius: 20,
              }} />
            </div>

            {/* Inner cover — matches the BOTTOM color of the hero gradient (where the
                dashboard fades into the page) so the cover blends seamlessly. Using the
                solid mid-tone would leave a visible flat block in dark theme. */}
            <div style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 32,
              right: 32,
              background: "var(--c-hero-end)",
              borderRadius: "16px 16px 0 0",
              zIndex: 1,
              pointerEvents: "none",
            }} />

            <motion.div
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease }}
              style={{
                position: "relative",
                padding: "0 32px",
                width: "100%",
                zIndex: 2,
                WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 65%, transparent 100%)",
                maskImage: "linear-gradient(180deg, #000 0%, #000 65%, transparent 100%)",
              }}
            >
              <HeroMockup isDark={isDark} activeTab={activeTab} />
            </motion.div>
          </div>

          {/* Trusted by — centered heading above, dashboard-width clipped logo row below.
              Stops the hero cursor spotlight inside this section: onMouseEnter parks the
              spotlight off-screen, onMouseMove stopPropagation prevents the parent's
              mousemove handler from updating --hero-mx/--hero-my while we're in here. */}
          <div
            style={{ padding: "80px 0" }}
            onMouseEnter={() => {
              const el = cardRef.current;
              if (!el) return;
              el.style.setProperty("--hero-mx", "-400px");
              el.style.setProperty("--hero-my", "-400px");
            }}
            onMouseMove={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: C.sub,
                textAlign: "center",
                margin: "0 0 36px",
                padding: "0 24px",
              }}
            >
              Trusted by global shippers, freight forwarders, and operations teams at leading enterprises
            </p>
            {/* Match the dashboard's outer max-width AND its inner 32px side padding,
                then fade the logos out at both edges with a horizontal gradient mask
                (same gradual fade approach as the dashboard's bottom mask) */}
            <div style={{ maxWidth: 1216, margin: "0 auto", width: "100%", padding: "0 32px" }}>
              <div
                style={{
                  overflow: "hidden",
                  WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                  maskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                }}
              >
                <Marquee size="lg" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── TRUST ──────────────────────────────────────────────── */
function TrustBar() {
  return (
    <div style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "20px 0" }}>
      <Wrap>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap", flexShrink: 0 }}>Trusted by</p>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Marquee bg={C.bgAlt}/>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

/* ─── PROBLEM ────────────────────────────────────────────── */
const PAINS = [
  {
    title: "Fragmented data across 12+ systems",
    body: "ERPs, carrier portals, freight forwarder platforms, customs systems, and email chains. No single source of truth — your team reconciles instead of manages.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="10" y1="6.5" x2="14" y2="6.5"/><line x1="17.5" y1="10" x2="17.5" y2="14"/><line x1="10" y1="17.5" x2="14" y2="17.5"/></svg>,
  },
  {
    title: "You find out about delays after your customers",
    body: "When a vessel is delayed or a shipment is stuck in customs, the information trickles in too late to respond proactively — every firefight costs credibility.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 13.5"/></svg>,
  },
  {
    title: "Freight invoices that never match contracts",
    body: "Rate discrepancies, unapplied contract terms, incorrect surcharges. Without automated verification, overcharges go undetected — month after month.",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  },
];

/* ─── SCROLL REVEAL STATEMENT ────────────────────────────── */

// Sample the brand spectrum gradient at position t ∈ [0, 1].
// Stops: coral 0%, magenta 45%, purple 75%, blue 100%.
function brandSpectrumAt(t: number): string {
  const stops: [number, [number, number, number]][] = [
    [0,    [241, 76,  79]],
    [0.45, [220, 2,   165]],
    [0.75, [117, 79,  247]],
    [1,    [55,  134, 248]],
  ];
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (clamped >= t0 && clamped <= t1) {
      const seg = (clamped - t0) / (t1 - t0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * seg);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * seg);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * seg);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  const [, last] = stops[stops.length - 1];
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

// One word in the paragraph. Renders a muted base layer + an absolutely
// positioned colored copy whose opacity is driven by the section's fill
// progress. Each word's transition window is centered on its threshold
// (its 0..1 position in the paragraph), with a small overlap so adjacent
// words crossfade smoothly into a wave-like reveal.
function ScrollWord({
  word,
  threshold,
  progress,
  targetColor,
  isLast,
}: {
  word: string;
  threshold: number;
  progress: import("framer-motion").MotionValue<number>;
  targetColor: string;
  isLast: boolean;
}) {
  const WIN = 0.06; // half-width of the fade-in window per word
  const opacity = useTransform(
    progress,
    [Math.max(0, threshold - WIN), Math.min(1, threshold + WIN)],
    [0, 1],
    { clamp: true }
  );
  return (
    <>
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ color: "var(--c-reveal-base)" }}>{word}</span>
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            color: targetColor,
            opacity,
            pointerEvents: "none",
            whiteSpace: "pre",
          }}
        >
          {word}
        </motion.span>
      </span>
      {!isLast && " "}
    </>
  );
}

// Four minimal value tiles pinned at the bottom of the Statement section's
// sticky viewport. No "learn more" CTA, no big icons, just a tiny faint glyph
// + short title + brief description. Aligned to the dashboard width band so
// the column rhythm matches the meteor lines above.
const STATEMENT_VALUES: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: "Neutrality",
    desc:  "Forwarder and carrier agnostic for greater digital collaboration.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v16" />
        <path d="M5 8h14" />
        <path d="M5 8l-2 5a3 3 0 0 0 6 0L7 8" />
        <path d="M19 8l-2 5a3 3 0 0 0 6 0L21 8" />
      </svg>
    ),
  },
  {
    title: "Configurability",
    desc:  "Highly flexible platform aligned to your business processes.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="14" y2="6" />
        <line x1="18" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="8" y2="12" />
        <line x1="12" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="16" y2="18" />
        <line x1="20" y1="18" x2="20" y2="18" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="10" cy="12" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: "Agility",
    desc:  "Fast project implementation for quicker time to market.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M9 2h6" />
      </svg>
    ),
  },
  {
    title: "Affordability",
    desc:  "Affordable solution to maximise return on investment.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
];

// One value tile — fades up + in based on its window of the row's tilesProgress.
// Window per tile is staggered so the four read as a quick cascade rather than a
// hard cut. Window width is wide enough to feel smooth, not snappy.
function StatementValueTile({
  item,
  index,
  progress,
}: {
  item: { title: string; desc: string; icon: React.ReactNode };
  index: number;
  progress: import("framer-motion").MotionValue<number>;
}) {
  const STAGGER = 0.12;
  const WINDOW  = 0.5;
  const start   = index * STAGGER;
  const end     = Math.min(1, start + WINDOW);
  const opacity = useTransform(progress, [start, end], [0, 1], { clamp: true });
  const y       = useTransform(progress, [start, end], [24, 0], { clamp: true });

  return (
    <motion.div
      style={{
        opacity,
        y,
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        // Tiles' text shouldn't visually fight the meteor lines either.
        textShadow: "0 0 6px var(--c-bg), 0 0 14px var(--c-bg)",
      }}
    >
      <div style={{ color: "var(--c-sub)", opacity: 0.55, display: "flex", alignItems: "center" }}>
        {item.icon}
      </div>
      <h4
        style={{
          fontSize: 15,
          fontWeight: 600,
          margin: 0,
          color: "var(--c-text)",
          letterSpacing: "-0.005em",
        }}
      >
        {item.title}
      </h4>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          margin: 0,
          color: "var(--c-sub)",
          maxWidth: 240,
        }}
      >
        {item.desc}
      </p>
    </motion.div>
  );
}

function StatementValuesRow({
  progress,
}: {
  progress: import("framer-motion").MotionValue<number>;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 0,
        right: 0,
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: 1216,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
        }}
      >
        {STATEMENT_VALUES.map((v, i) => (
          <StatementValueTile key={i} item={v} index={i} progress={progress} />
        ))}
      </div>
    </div>
  );
}

// Backdrop: N evenly-distributed faint vertical lines via CSS grid columns.
// Each line has a small scroll-driven "meteor" — a 70px linear-gradient segment
// (transparent at top, muted at bottom) that travels top→bottom as the section's
// fillProgress goes 0→1. Reads as N shooting stars scanning down behind the text.
// Want more / fewer lines? Just change LINE_COUNT below — the grid auto-redistributes.
function StatementBackdrop({
  isDark,
  progress,
}: {
  isDark: boolean;
  progress: import("framer-motion").MotionValue<number>;
}) {
  const LINE_COUNT     = 5;
  const lineColor      = isDark ? "rgba(241,245,249,0.05)" : "rgba(15,23,42,0.05)";
  const METEOR_PX      = 70;
  // Middle ground: text color at 35% — visible enough to read as a "shooting
  // star" but not as loud as the previous 50%. Gradient fades transparent→solid
  // top→bottom for the comet-tail feel.
  const meteorBaseRGB  = isDark ? "241,245,249" : "15,23,42";
  const METEOR_MAX_A   = 0.35;
  const meteorGradient = `linear-gradient(to bottom, transparent 0%, rgba(${meteorBaseRGB}, ${METEOR_MAX_A}) 100%)`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
      aria-hidden
    >
      {/* Constrain to the dashboard's outer max-width AND match its inner 32px
          side padding — so the first line sits at the dashboard's left content
          edge and the last line sits at its right content edge (same band as
          the trusted-by logos above). */}
      <div
        style={{
          height: "100%",
          maxWidth: 1216,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {Array.from({ length: LINE_COUNT }).map((_, i) => (
          <BackdropLine
            key={i}
            progress={progress}
            lineColor={lineColor}
            meteorGradient={meteorGradient}
            meteorPx={METEOR_PX}
          />
        ))}
      </div>
    </div>
  );
}

function BackdropLine({
  progress,
  lineColor,
  meteorGradient,
  meteorPx,
}: {
  progress: import("framer-motion").MotionValue<number>;
  lineColor: string;
  meteorGradient: string;
  meteorPx: number;
}) {
  // Meteor's top edge as `calc(progress*100% − progress*meteorPx)` so it stays
  // inside the line (bottom edge of meteor never overshoots the line bottom).
  const meteorTop = useTransform(
    progress,
    (v) => `calc(${v * 100}% - ${v * meteorPx}px)`
  );

  return (
    // 1px tall line — flex parent places it via space-between distribution
    <div style={{ position: "relative", width: 1, height: "100%", background: lineColor, flexShrink: 0 }}>
      <motion.div
        style={{
          position: "absolute",
          top: meteorTop,
          left: 0,
          width: 1,
          height: meteorPx,
          background: meteorGradient,
        }}
      />
    </div>
  );
}

function ScrollRevealStatement({ isDark }: { isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  // Measure hero height + viewport — these set the fill trigger window.
  const [heroHeight, setHeroHeight] = useState(800);
  const [viewportH,  setViewportH]  = useState(800);
  useEffect(() => {
    const measure = () => {
      const heroCard = document.getElementById("hero-card");
      const heroWrapper = heroCard?.parentElement;
      if (heroWrapper) setHeroHeight(heroWrapper.offsetHeight);
      setViewportH(window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Fill starts when hero is 95% scrolled away (≈ at the top of viewport with
  // only ~5% left), and ends about 60% of a viewport later — gives a clear
  // but not rushed fill as the user keeps scrolling through the pin.
  const fillStart  = heroHeight * 0.95;
  const fillEnd    = heroHeight + viewportH * 0.6;

  // After the fill completes, a small gap, then the 4 value tiles cascade up
  // into view. The meteor extends across the whole sequence (fill + gap + tile
  // reveal) so it visually scrubs down the line and naturally crosses the tile
  // tops at the moment the tiles begin to appear.
  const tilesStart = fillEnd  + viewportH * 0.3;
  const tilesEnd   = tilesStart + viewportH * 0.4;

  const { scrollY }     = useScroll();
  const fillProgress    = useTransform(scrollY, [fillStart, fillEnd],   [0, 1], { clamp: true });
  const tilesProgress   = useTransform(scrollY, [tilesStart, tilesEnd], [0, 1], { clamp: true });
  const meteorProgress  = useTransform(scrollY, [fillStart, tilesEnd],  [0, 1], { clamp: true });

  // Text wrapper lifts up by ~50px as the tiles appear — keeps the text
  // perfectly viewport-centered when tiles aren't visible yet, then balances
  // it above the tile row once they're in. Bound to tilesProgress so the
  // shift is in lockstep with the tile cascade.
  const textY = useTransform(tilesProgress, [0, 1], [0, -50]);

  // Word-by-word reveal: each word fades from the muted base color into a
  // colored copy of itself. Color per word is sampled from the brand spectrum
  // based on the word's position in the paragraph — so the paragraph as a
  // whole still reads coral → magenta → purple → blue, just resolved per word.
  const statementText =
    "The holistic platform for the world's supply chains. Where AI turns data into decisions. Freight in focus. Teams in flow.";
  const words = statementText.split(/\s+/);

  const baseStyle: React.CSSProperties = {
    fontSize: "clamp(28px, 3vw, 48px)",
    fontWeight: 600,
    letterSpacing: "-0.015em",
    lineHeight: 1.35,
    margin: 0,
    textAlign: "center",
    maxWidth: 780,
    marginLeft: "auto",
    marginRight: "auto",
    // Theme-aware halo so the lines behind don't bleed through the glyphs.
    // Stacked bg-coloured shadows create a soft "knockout" around each letter.
    textShadow:
      "0 0 6px var(--c-bg), 0 0 14px var(--c-bg), 0 0 22px var(--c-bg)",
  };

  return (
    // Shutter reveal: this section sits BEHIND the hero (lower z-index) with a
    // small negative margin-top so its top edge is tucked under the hero's
    // bottom. The hero acts as the shutter — as the user scrolls, the hero
    // rolls up and reveals this section that was waiting underneath.
    // No rounded corners, no shadow — it's not popping out, it's already there.
    // Attio-style shutter reveal. This section starts BEHIND the hero (negative
    // margin-top + z-index 1 vs hero's z-index 2), and its inner div is
    // position:sticky so the text is pinned at viewport center from the very
    // first frame. The hero (opaque, on top) covers it — as the user scrolls,
    // the hero rolls up off the screen and uncovers the pinned text. After the
    // section's full scroll length is consumed, sticky releases and the rest
    // of the page scrolls normally.
    <section
      ref={ref}
      style={{
        background: C.bg,
        position: "relative",
        zIndex: 1,
        marginTop: "-100vh",   // start one viewport above natural position → behind hero
        // Pin must last until the tile reveal completes (tilesEnd = heroHeight + 130vh).
        // Math: pin ends at scrollY = section.docBottom − 100vh
        //     = (heroHeight − 100vh + minHeight) − 100vh
        //     = heroHeight + (minHeight − 200vh)
        // For pin end ≥ heroHeight + 130vh → minHeight ≥ 330vh. 360vh gives a
        // 30vh dwell after tiles finish appearing before the section scrolls away.
        minHeight: "360vh",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* 5 vertical "scanning" lines with scroll-driven meteor segments — bound
            to meteorProgress so they keep scrubbing past the text fill, through
            the gap, and across the tile-reveal window. */}
        <StatementBackdrop isDark={isDark} progress={meteorProgress} />

        {/* 4 value tiles pinned at viewport bottom — cascade in once the text
            fill is complete + a small gap. */}
        <StatementValuesRow progress={tilesProgress} />

        <motion.div style={{ y: textY, position: "relative", zIndex: 1 }}>
          <Wrap>
          {/* Word-by-word reveal — each word fades in as the scroll passes its
              position. Color per word is sampled from the brand spectrum so the
              paragraph still reads coral → magenta → purple → blue overall. */}
          <p style={{ ...baseStyle, color: "var(--c-reveal-base)" }}>
            {words.map((word, i) => {
              const threshold = words.length === 1 ? 0 : i / (words.length - 1);
              return (
                <ScrollWord
                  key={i}
                  word={word}
                  threshold={threshold}
                  progress={fillProgress}
                  targetColor={brandSpectrumAt(threshold)}
                  isLast={i === words.length - 1}
                />
              );
            })}
          </p>
          </Wrap>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── ECOSYSTEM ──────────────────────────────────────────────
   Tramés at center, partners + systems + documents radiating out on
   5 concentric dotted rings. Sticky pin for the duration of the
   rotation; rings rotate (alternating CW / CCW), labels fade in in
   waves, caption appears near the end. Different scroll grammar from
   the Statement section's shutter — pins normally instead of hiding
   behind the previous section. */

type EcosystemLabel = { text: string; kind: "system" | "document" };

const ECOSYSTEM_RINGS: {
  labels:      EcosystemLabel[];
  radius:      number;   // in vmin (radius from centre, % of min(vw, vh))
  rotation:    number;   // total deg rotated from revealStart → progress 1 (sign = direction)
  revealStart: number;   // 0..1 progress where the ring begins activating (fade-in + rotation)
  startAngle:  number;   // initial angle offset for the first label (deg, 0 = top, CW)
}[] = [
  // Centre ring — empty (no labels); pure dotted halo around the logo for
  // visual room. Ring 0 starts almost immediately (revealStart 0.005 ≈ 2vh
  // into the 400vh pin). 10% spacing between rings. Last ring fully visible
  // by 0.50, logo + label colour reveal [0.70, 0.90], rotation freezes at
  // ECOSYSTEM_ROTATION_END (0.90), then a 10% settled leg = 40vh of dwell
  // before sticky releases.
  { labels: [], radius: 18, rotation: 70, revealStart: 0, startAngle: 0 },
  {
    labels: [
      { text: "WMS",   kind: "system" },
      { text: "TMS",   kind: "system" },
      { text: "ERP",   kind: "system" },
      { text: "Email", kind: "document" },
    ],
    radius: 30, rotation: -55, revealStart: 0.10, startAngle: 0,
  },
  {
    labels: [
      { text: "FMS",             kind: "system" },
      { text: "Purchase Order",  kind: "document" },
      { text: "Bill of Ladings", kind: "document" },
      { text: "Arrival Notice",  kind: "document" },
      { text: "Importer",        kind: "document" },
    ],
    radius: 45, rotation: 60, revealStart: 0.20, startAngle: 45,
  },
  {
    labels: [
      { text: "Carrier",       kind: "system" },
      { text: "Maritime Line", kind: "system" },
      { text: "Suppliers",     kind: "system" },
      { text: "3PL",           kind: "document" },
      { text: "Packing List",  kind: "document" },
    ],
    radius: 60, rotation: -50, revealStart: 0.30, startAngle: 30,
  },
  {
    labels: [
      { text: "Port Terminal",     kind: "system" },
      { text: "Customs Broker",    kind: "system" },
      { text: "Freight forwarder", kind: "system" },
      { text: "Exporter",          kind: "document" },
      { text: "Invoices",          kind: "document" },
    ],
    radius: 76, rotation: 55, revealStart: 0.40, startAngle: 15,
  },
];

const ECOSYSTEM_CAPTION =
  "Tramés structures your unstructured data from emails, spreadsheets, portals, and systems of record (ERP, TMS, WMS…) into a single, AI-ready layer — shifting your operating model from managing by crisis to managing by exception.";

// Shift the entire ring system down so its top edge clears the pill nav once
// the section reaches the top of the viewport.
const ECOSYSTEM_CENTER_OFFSET = 56;

// Progress (0 → 1 across the rings sticky-pin window) at which ring rotation
// reaches its final angle and freezes. Everything after this is the "settled
// leg". With 400vh pin duration, 0.90 leaves a 10% leg = 40vh of dwell.
const ECOSYSTEM_ROTATION_END = 0.90;

// One ring's filled disc — drawn back-to-front (largest first) so cumulative
// alpha gives a soft radial highlight that intensifies toward centre.
function EcosystemFill({
  ring, isDark, centerTop, progress,
}: {
  ring: typeof ECOSYSTEM_RINGS[number];
  isDark: boolean;
  centerTop: string;
  progress: import("framer-motion").MotionValue<number>;
}) {
  // Each ring fades its disc in as it activates
  const opacity = useTransform(progress, [Math.max(0, ring.revealStart - 0.05), ring.revealStart + 0.15], [0, 1], { clamp: true });
  const fillColor = isDark ? "rgba(99,102,241,0.045)" : "rgba(99,102,241,0.035)";
  return (
    <motion.div
      style={{
        position: "absolute",
        top: centerTop,
        left: "50%",
        width:  `${ring.radius * 2}vmin`,
        height: `${ring.radius * 2}vmin`,
        x: "-50%",
        y: "-50%",
        borderRadius: "50%",
        background: fillColor,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// One ring — dashed border, rotating with motion's `rotate` so labels orbit
// the centre. Only "active" rings (the inner ones with tags, not the very
// centre halo or the outermost boundary) get the border-colour transition
// from muted to brand-blue as they activate. Centre and outermost stay at
// the muted colour throughout.
function EcosystemRingBg({
  ring, isActive, isDark, centerTop, progress,
}: {
  ring: typeof ECOSYSTEM_RINGS[number];
  isActive: boolean;
  isDark: boolean;
  centerTop: string;
  progress: import("framer-motion").MotionValue<number>;
}) {
  // Rotation clamps at ECOSYSTEM_ROTATION_END (not 1). So the ring stops
  // moving once that progress is reached, leaving a static "settled" phase.
  const rot = useTransform(progress, [ring.revealStart, ECOSYSTEM_ROTATION_END], [0, ring.rotation], { clamp: true });

  const borderInactive = isDark ? "rgba(120,130,200,0.18)" : "rgba(60,75,150,0.14)";
  const borderActive   = isDark ? "rgba(99,102,241,0.45)"  : "rgba(99,102,241,0.40)";
  // Always call useTransform (hook ordering), but for inactive rings keep the
  // target = inactive so the border colour never changes visually.
  const borderColor = useTransform(
    progress,
    [ring.revealStart, ring.revealStart + 0.12],
    [borderInactive, isActive ? borderActive : borderInactive],
    { clamp: true }
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        top: centerTop,
        left: "50%",
        width:  `${ring.radius * 2}vmin`,
        height: `${ring.radius * 2}vmin`,
        x: "-50%",
        y: "-50%",
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor,
        borderRadius: "50%",
        rotate: rot,
        pointerEvents: "none",
      }}
    />
  );
}

function Ecosystem({ isDark }: { isDark: boolean }) {
  // ringsRef = sticky-pin container. scrollYProgress runs 0 → 1 across the
  // pin's scroll window: 0 = sticky just pinned, 1 = sticky about to release.
  const ringsRef = useRef<HTMLDivElement>(null);

  // Measure vmin for ring sizing — re-measures on resize.
  const [vmin, setVmin] = useState(800);
  useEffect(() => {
    const measure = () => setVmin(Math.min(window.innerWidth, window.innerHeight));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Track scroll within the rings sticky container only. Heading + caption
  // sit OUTSIDE the sticky (above/below) and scroll naturally with the page —
  // no JS-driven translation, no jerk, no awkward empty gap between phases.
  const { scrollYProgress } = useScroll({
    target: ringsRef,
    offset: ["start start", "end end"],
  });

  // Logo crossfades from FLAT gray to the real brand-coloured icon right as
  // the last ring finishes activating. Plenty of "settled" time afterwards
  // for the colour to live on screen before sticky releases.
  const logoGray     = useTransform(scrollYProgress, [0.50, 0.65], [1, 0], { clamp: true });
  const colorOpacity = useTransform(logoGray, (v) => 1 - v);
  const colorFilter  = useTransform(logoGray, (v) => {
    if (!isDark) return "none";
    const intensity = 1 - v;
    return `drop-shadow(0 18px 40px rgba(99,102,241,${intensity * 0.35})) drop-shadow(0 6px 14px rgba(0,0,0,${intensity * 0.25}))`;
  });
  const glowOpacity = useTransform(logoGray, (v) => 1 - v); // halo strengthens as the logo colours up

  // "THE ECOSYSTEM" label under the logo — starts fading in EARLIER than the
  // logo colour reveal so the user sees it well before the section starts
  // settling. Slow 15% fade-in. To pull it even sooner, lower the first
  // number in the range below (e.g. [0.30, 0.45] for very early appearance).
  const ecosystemLabelOpacity = useTransform(scrollYProgress, [0.40, 0.55], [0, 1], { clamp: true });

  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const centerTop   = `calc(50% + ${ECOSYSTEM_CENTER_OFFSET}px)`;

  return (
    <section
      style={{
        position: "relative",
        background: "var(--c-bg)",
        borderTop:    `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      {/* ─── HEADING SECTION ── natural-scroll, no pin, no JS transform.
          Scrolls up naturally as user passes, no jerk, no awkward empty gap. */}
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6vh 24px",
        }}
      >
        <p
          style={{
            maxWidth: 820,
            margin: 0,
            textAlign: "center",
            fontSize: "clamp(22px, 2.4vw, 36px)",
            fontWeight: 600,
            letterSpacing: "-0.015em",
            lineHeight: 1.35,
            color: "var(--c-text)",
          }}
        >
          Every system, every document, every partner.<br />
          Unified into one operating layer.
        </p>
      </div>

      {/* ─── RINGS STICKY CONTAINER ── 500vh tall, with a 100vh sticky inner.
          Sticky pins for the full 400vh of pin duration. All ring activations
          happen during this window, driven by scrollYProgress (0 = pin start,
          1 = pin about to release). After ROTATION_END (0.70), there's a 30%
          "settled leg" = 120vh of dwell before sticky releases. */}
      <div ref={ringsRef} style={{ position: "relative", height: "500vh" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            // Soft vertical fade at top + bottom of the viewport so the outer
            // ring (and any chips at top/bottom of orbit) blend into the bg
            // instead of being chopped hard at the viewport edge. Top 10vh
            // and bottom 10vh fade from transparent → opaque; middle 80vh
            // fully visible.
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
            maskImage:       "linear-gradient(180deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          }}
        >
        {/* (1) Filled discs — light theme only. Cumulative alpha (largest first
                so smaller ones overlay) builds a soft radial highlight toward
                centre. In dark theme the filled discs muddied the rings, so we
                skip them entirely. */}
        {!isDark &&
          [...ECOSYSTEM_RINGS]
            .map((ring, i) => ({ ring, i }))
            .sort((a, b) => b.ring.radius - a.ring.radius)
            .map(({ ring, i }) => (
              <EcosystemFill
                key={`fill-${i}`}
                ring={ring}
                isDark={isDark}
                centerTop={centerTop}
                progress={scrollYProgress}
              />
            ))}

        {/* (2) Rotating rings — dashed border, no meteor. Only the rings with
                tags AND not the outermost / centre get the active-blue border
                tint. Rings 1, 2, 3 are "active"; ring 0 (centre halo) and ring
                4 (outermost boundary) stay quiet. */}
        {ECOSYSTEM_RINGS.map((ring, i) => (
          <EcosystemRingBg
            key={`ring-${i}`}
            ring={ring}
            isActive={i > 0 && i < ECOSYSTEM_RINGS.length - 1}
            isDark={isDark}
            centerTop={centerTop}
            progress={scrollYProgress}
          />
        ))}

        {/* (3) Soft brand-blue glow behind the logo — gives the logo a halo as
                the section activates. Sits BELOW the logo in z-order. */}
        <motion.div
          style={{
            position: "absolute",
            top: centerTop,
            left: "50%",
            width:  "min(300px, 32vmin)",
            height: "min(300px, 32vmin)",
            x: "-50%",
            y: "-50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.06) 35%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 9,
            opacity: glowOpacity,
          }}
        />

        {/* (4) Centre Tramés icon — two stacked layers crossfading on activation.
            Bottom: the real /icon.svg in full brand colour.
            Top: a mask-image of the same icon filled with var(--c-reveal-base)
                 (the Statement section's muted-text colour) — gives us a flat
                 theme-aware gray silhouette with no shadow, no gradient.
            As scroll passes the activation window, the gray fades out and the
            colour layer fades in. Drop-shadow is on the colour layer only and
            only in dark theme. */}
        <div
          style={{
            position: "absolute",
            top: centerTop,
            left: "50%",
            width:  "min(120px, 13vmin)",
            height: "min(120px, 13vmin)",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {/* Flat gray layer rendered FIRST so it sits BEHIND the colour layer.
              When the colour layer is fully opaque, it occludes the gray
              underneath — no tint, no residue. mask-mode: alpha forces the
              mask to use the SVG's alpha channel (clean silhouette) rather
              than the default luminance mode (which made colourful paths only
              partially opaque). */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--c-reveal-base)",
              WebkitMaskImage:    `url(${import.meta.env.BASE_URL}icon.svg)`,
              maskImage:          `url(${import.meta.env.BASE_URL}icon.svg)`,
              WebkitMaskSize:     "contain",
              maskSize:           "contain",
              WebkitMaskRepeat:   "no-repeat",
              maskRepeat:         "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition:       "center",
              WebkitMaskMode:     "alpha",
              maskMode:           "alpha",
              opacity: logoGray,
            }}
          />
          {/* Colour layer rendered ON TOP — fades in on activation, fully
              covering the gray once colorOpacity hits 1. */}
          <motion.img
            src={`${import.meta.env.BASE_URL}icon.svg`}
            alt="Tramés"
            style={{
              position: "absolute",
              inset: 0,
              width:  "100%",
              height: "100%",
              display: "block",
              opacity: colorOpacity,
              filter: colorFilter,
            }}
          />
        </div>

        {/* Rotating labels — one chip per label, each driven by its own motion value */}
        {ECOSYSTEM_RINGS.map((ring, ringIdx) =>
          ring.labels.map((label, labelIdx) => {
            const baseAngle = ring.startAngle + (labelIdx / ring.labels.length) * 360;
            return (
              <EcosystemChip
                key={`${ringIdx}-${labelIdx}`}
                label={label}
                baseAngle={baseAngle}
                radiusPx={(ring.radius * vmin) / 100}
                rotation={ring.rotation}
                progress={scrollYProgress}
                revealStart={ring.revealStart + labelIdx * 0.015}
                centerTop={centerTop}
                isDark={isDark}
              />
            );
          })
        )}

        {/* "THE ECOSYSTEM" label — positioned 18px below the logo's bottom
            edge (centre offset 56 + half-height 60 + 18px gap = 134px below
            the absolute centre). Fades in slowly. */}
        <motion.div
          style={{
            position: "absolute",
            top: `calc(50% + ${ECOSYSTEM_CENTER_OFFSET + 78}px)`,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 12,
            opacity: ecosystemLabelOpacity,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              // Theme-aware: pure white in dark mode, dark slate in light mode
              color: isDark ? "#ffffff" : "var(--c-text)",
            }}
          >
            The Ecosystem
          </span>
        </motion.div>

        </div>{/* /sticky inner */}
      </div>{/* /rings sticky container */}

      {/* ─── CAPTION SECTION ── natural-scroll, no pin. Once the rings sticky
          container has released, this scrolls into view from below naturally. */}
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6vh 24px",
        }}
      >
        <p
          style={{
            maxWidth: 760,
            margin: 0,
            textAlign: "center",
            fontSize: "clamp(15px, 1.4vw, 20px)",
            lineHeight: 1.6,
            color: "var(--c-sub)",
          }}
        >
          {ECOSYSTEM_CAPTION}
        </p>
      </div>
    </section>
  );
}

function EcosystemChip({
  label,
  baseAngle,
  radiusPx,
  rotation,
  progress,
  revealStart,
  centerTop,
  isDark,
}: {
  label: EcosystemLabel;
  baseAngle: number;
  radiusPx: number;
  rotation: number;
  progress: import("framer-motion").MotionValue<number>;
  revealStart: number;
  centerTop: string;
  isDark: boolean;
}) {
  // Angle: stays at baseAngle until the ring activates (revealStart), then
  // interpolates through to baseAngle + rotation by progress 1. Sign of
  // `rotation` = direction. Polar → cartesian uses (a − 90) so 0° = top
  // (12 o'clock) and positive = clockwise.
  // Match ring rotation timing — chip orbits stop when the ring stops.
  const angleDeg = useTransform(progress, [revealStart, ECOSYSTEM_ROTATION_END], [baseAngle, baseAngle + rotation], { clamp: true });
  const left = useTransform(angleDeg, (a) => `calc(50% + ${Math.cos((a - 90) * Math.PI / 180) * radiusPx}px)`);
  const top  = useTransform(angleDeg, (a) => `calc(${centerTop} + ${Math.sin((a - 90) * Math.PI / 180) * radiusPx}px)`);
  const opacity = useTransform(progress, [revealStart, revealStart + 0.10], [0, 1], { clamp: true });

  const dotColor = label.kind === "document" ? "#f97316" : "#6366f1";
  const bg     = isDark ? "rgba(15,18,32,0.7)"     : "rgba(255,255,255,0.85)";
  const border = isDark ? "rgba(120,130,200,0.25)" : "rgba(15,23,42,0.10)";
  const text   = isDark ? "rgba(241,245,249,0.92)" : "rgba(15,23,42,0.85)";

  return (
    <motion.div
      style={{
        position: "absolute",
        left,
        top,
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* Inner div handles the -50% centre offset so it doesn't fight the motion left/top */}
      <div
        style={{
          transform: "translate(-50%, -50%)",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px",
          borderRadius: 6,
          background: bg,
          border: `1px solid ${border}`,
          color: text,
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 7,
            height: 7,
            background: dotColor,
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        {label.text}
      </div>
    </motion.div>
  );
}

function Problem() {
  return (
    <section style={{ background: C.bg, padding: "100px 0" }}>
      <Wrap>
        <Reveal className="text-center" style={{ textAlign: "center", marginBottom: 56 }}>
          <Label>The Challenge</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: C.text, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            Global freight is broken by fragmentation.
          </h2>
          <p style={{ fontSize: 17, color: C.sub, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            When shipment data lives across a dozen systems, your team spends more time chasing information than managing operations.
          </p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }} className="grid-cols-1 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ padding: "36px 32px", borderRight: i < 2 ? `1px solid ${C.border}` : "none", background: C.bg, height: "100%", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = C.bg)}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.bgBlue, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 10px", lineHeight: 1.4 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, margin: 0 }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── PILLARS ────────────────────────────────────────────── */
const PILLARS = [
  {
    label: "Full Visibility",
    title: "See every shipment, everywhere, at all times.",
    body: "We synchronise fragmented data across all your carriers, geographies, and systems — layered with best-in-class tracking across sea, air, road, and express. Your team always works from the same picture.",
    bullets: ["Multimodal track & trace from PO to delivery","Predictive ETAs that update with live carrier data","Real-time exception alerts before delays escalate","Unified document repository with instant access"],
    cta: "Visibility Features",
    illus: <SVGVisibility/>,
    flip: false,
  },
  {
    label: "Workflow Automation",
    title: "Let the platform do the routine work.",
    body: "Digitalise your existing SOPs and optimise them with workflow automation and configurable alerts — so your team focuses on decisions, not administration.",
    bullets: ["Configurable workflows that match your exact SOPs","Automated exception routing with action assignment","Stakeholder collaboration with full audit trail","24/7 digital updates across all time zones"],
    cta: "Automation Features",
    illus: <SVGAutomation/>,
    flip: true,
  },
  {
    label: "Real-Time Analytics",
    title: "Turn freight data into strategic decisions.",
    body: "Visualise your operations across booking visibility, root cause analysis, vendor performance, and custom KPIs — and identify gaps, risks, and opportunities before they compound.",
    bullets: ["Customisable dashboards per team and role","Root cause analysis for recurring disruptions","Vendor and carrier performance scorecards","Exportable reports for stakeholder reviews"],
    cta: "Analytics Features",
    illus: <SVGAnalytics/>,
    flip: false,
  },
  {
    label: "Spend Management",
    title: "Pay only what you actually owe.",
    body: "We ingest your contract rates, SOAs, and invoices — then automatically verify every line item so you only pay for the actual transportation cost. No more overpaying.",
    bullets: ["Automated freight invoice verification at line level","Contract rate management and benchmarking","Free Trade Agreement opportunity detection","Real-time freight spend monitoring by route and carrier"],
    cta: "Spend Management Features",
    illus: <SVGSpend/>,
    flip: true,
  },
];

function Pillars() {
  return (
    <section style={{ background: C.bgAlt, padding: "100px 0" }}>
      <Wrap>
        <Reveal style={{ textAlign: "center", marginBottom: 72 }}>
          <Label>The Platform</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            One platform. Four superpowers.
          </h2>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 96 }}>
          {PILLARS.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", direction: p.flip ? "rtl" : "ltr" }} className="grid-cols-1 md:grid-cols-2">
              <Reveal delay={0.05} style={{ direction: "ltr" }}>
                <div>
                  <Label>{p.label}</Label>
                  <h3 style={{ fontSize: "clamp(22px, 2.2vw, 34px)", fontWeight: 800, color: C.text, margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 16, color: C.sub, lineHeight: 1.75, margin: "0 0 24px" }}>{p.body}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {p.bullets.map((b, bi) => (
                      <li key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: C.sub }}>
                        <svg style={{ flexShrink: 0, marginTop: 2 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <a href="#" style={{ fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.accent)}>
                    {p.cta} →
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.12} style={{ direction: "ltr" }}>
                {p.illus}
              </Reveal>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── FEATURE GRID ───────────────────────────────────────── */
const FEATURES = [
  { name: "Shipment & Order Management", desc: "All shipments and orders unified in a single real-time view" },
  { name: "Multimodal Track & Trace",    desc: "Order-level tracking across sea, air, road, and express" },
  { name: "Configurable Workflow",       desc: "Collaboration tools built around your exact process SOPs" },
  { name: "Exception Alerts",            desc: "Automated, real-time alerts on shipment updates and tasks" },
  { name: "Predictive ETAs",             desc: "Reliable arrival estimates that update with live carrier data" },
  { name: "Document Repository",         desc: "Secure, centralised storage for all freight documents" },
  { name: "Contract Rate Management",    desc: "Digitise and manage evolving freight rate agreements" },
  { name: "Freight Audit",               desc: "Automated invoice verification — pay only the actual cost" },
  { name: "Partner Performance",         desc: "Carrier and vendor scorecards with actionable insights" },
  { name: "Global Sailing Schedule",     desc: "Search and compare routes across all major carriers" },
  { name: "Free Trade Agreement",        desc: "Identify duty savings through bilateral FTA opportunities" },
  { name: "ERP Integrations",            desc: "Connect via EDI, API, FTP, or Excel — any system" },
];

function FeatureGrid() {
  return (
    <section style={{ background: C.bg, padding: "100px 0" }}>
      <Wrap>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <Label>Everything Included</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: C.text, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Built for every part of your freight operation.
          </h2>
          <p style={{ fontSize: 17, color: C.sub, maxWidth: 480, margin: "0 auto" }}>
            Every feature your logistics team needs — out of the box, fully configurable.
          </p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: C.border, borderRadius: 20, overflow: "hidden" }} className="grid-cols-2 md:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={(i % 4) * 0.04 + Math.floor(i / 4) * 0.05}>
              <div style={{ padding: "28px 24px", background: C.bg, height: "100%", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = C.bg)}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: C.bgBlue, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 11, fontWeight: 700, color: C.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 6px", lineHeight: 1.4 }}>{f.name}</p>
                <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── METRICS ────────────────────────────────────────────── */
const STATS = [
  { to: 2400000, suffix: "+", prefix: "",  label: "Shipments tracked",    note: "Across all modes and geographies" },
  { to: 12,      suffix: "M+", prefix: "$", label: "Freight costs audited", note: "In verified invoice discrepancies" },
  { to: 40,      suffix: "+", prefix: "",  label: "Carrier integrations",  note: "Ocean, air, road, and express" },
  { to: 999,     suffix: "%", prefix: "99.", label: "Platform uptime",    note: "Enterprise-grade reliability" },
];

function Metrics() {
  return (
    <section style={{ background: "#0f172a", padding: "96px 0" }}>
      <Wrap>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accent, marginBottom: 14 }}>By The Numbers</p>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
            The platform global supply chains run on.
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }} className="grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ padding: "44px 32px", textAlign: "center", background: "#0f172a" }}>
                <p style={{ fontSize: "clamp(36px, 3vw, 52px)", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  {s.prefix}<Counter to={s.to} suffix={s.suffix}/>
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{s.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────── */
const QUOTES = [
  { quote: "Tramés reduced our freight billing disputes by 73% in the first quarter. The automated audit caught overcharges we had been paying for years without realising.", name: "Sarah Chen", role: "Head of Global Logistics", co: "Industrial Manufacturing Co." },
  { quote: "We finally have one place where our entire team — across Singapore, Rotterdam, and Chicago — sees the same information at the same time. The difference in decision speed is remarkable.", name: "Marcus Weber", role: "VP Supply Chain", co: "Consumer Goods Group" },
  { quote: "The predictive ETA feature alone paid for the platform within six weeks of going live. Our customer service team stopped receiving delay calls before we did.", name: "Priya Nair", role: "Freight Operations Manager", co: "APAC Retail Group" },
];

function Testimonials() {
  return (
    <section style={{ background: C.bgAlt, padding: "100px 0" }}>
      <Wrap>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <Label>What Our Clients Say</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            Real results from real operations.
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="grid-cols-1 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "36px 32px", display: "flex", flexDirection: "column", height: "100%" }}>
                <svg width="30" height="22" viewBox="0 0 30 22" fill="none" style={{ marginBottom: 20, flexShrink: 0 }}>
                  <path d="M0 22V14.5C0 10.5 1.1 7.2 3.3 4.6 5.5 1.8 8.7.3 12.8 0l.9 2.2C11 2.8 9.2 3.8 7.9 5.3 6.6 6.7 5.9 8.6 5.7 11H11V22H0zm14.5 0V14.5c0-3.8 1.1-7.2 3.4-9.9 2.2-2.7 5.4-4.2 9.5-4.6l.9 2.2c-2.7.5-4.5 1.5-5.8 3-1.3 1.4-2 3.3-2.2 5.8H26V22H14.5z"
                    fill={C.accent} opacity="0.18"/>
                </svg>
                <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.sub, margin: "0 0 28px", flex: 1 }}>"{q.quote}"</p>
                <div style={{ paddingTop: 20, borderTop: `1px solid ${C.borderLight}` }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: "0 0 3px" }}>{q.name}</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{q.role} · {q.co}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section style={{ background: C.accent, padding: "96px 0" }}>
      <Wrap>
        <Reveal style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>Get Started</p>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 46px)", fontWeight: 800, color: "#fff", margin: "0 0 18px", maxWidth: 560, marginLeft: "auto", marginRight: "auto", letterSpacing: "-0.02em" }}>
            Take control of your freight operations today.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.78)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.7 }}>
            See how Tramés brings full visibility, automation, analytics, and spend management into one platform — configured to your operations in weeks, not months.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "13px 28px", borderRadius: DS.btnRadius, background: "#fff", color: C.accent, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
              Book a Demo
            </button>
            <button style={{ padding: "13px 28px", borderRadius: DS.btnRadius, background: "transparent", color: "#fff", fontWeight: 700, fontSize: 15, border: "1.5px solid rgba(255,255,255,0.45)", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)")}>
              Start a POC
            </button>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────── */
const FCOLS = [
  { h: "Platform",  links: ["Shipment Management","Track & Trace","Workflow Automation","Exception Alerts","Predictive ETAs","Document Repository"] },
  { h: "Solutions", links: ["For Shippers","For Freight Teams","Enterprise","Mid-Market","Integrations"] },
  { h: "Company",   links: ["About Tramés","Newsroom","Careers","Contact Us","Partners"] },
  { h: "Resources", links: ["Documentation","API Reference","Case Studies","Blog","Security","Privacy Policy"] },
];

function Footer({ themeMode, onThemeModeChange }: { themeMode: ThemeMode; onThemeModeChange: (m: ThemeMode) => void }) {
  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "system",
      label: "Use system theme",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: "light",
      label: "Light theme",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
          <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
          <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
        </svg>
      ),
    },
    {
      id: "dark",
      label: "Dark theme",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "72px 0 40px" }}>
      <Wrap>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }} className="grid-cols-2 md:grid-cols-5">
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Tramés" style={{ height: 22, width: "auto", display: "block", filter: "brightness(0) invert(0.92)" }} />
            </div>
            <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>Complete visibility and control across your global freight operations.</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["in","tw","yt"].map(s => (
                <a key={s} href="#" style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#64748b", textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#64748b"; }}>
                  {s}
                </a>
              ))}
            </div>
          </div>
          {/* Link cols */}
          {FCOLS.map(col => (
            <div key={col.h}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 16 }}>{col.h}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 12, color: "#475569" }}>© 2025 Tramés Pte Ltd. All rights reserved.</p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Theme switcher — system / light / dark */}
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 999, border: "1px solid rgba(255,255,255,0.06)" }}>
              {themeOptions.map(({ id, label, icon }) => {
                const active = themeMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => onThemeModeChange(id)}
                    aria-label={label}
                    title={label}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: active ? "rgba(255,255,255,0.14)" : "transparent",
                      color: active ? "#f1f5f9" : "#64748b",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#cbd5e1"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#64748b"; }}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy","Terms of Service","Security"].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </Wrap>
    </footer>
  );
}

/* ─── PAGE ───────────────────────────────────────────────── */
type ThemeMode = "light" | "dark" | "system";
type MapStyle  = "line" | "filled";

const SETTINGS_KEYS = {
  themeMode:     "trames-v1-theme-mode",
  shipSpotlight: "trames-v1-ship-spotlight",
  mapStyle:      "trames-v1-map-style",
};

export default function V1Page() {
  // Restore from localStorage on first render (fall back to defaults)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(SETTINGS_KEYS.themeMode) as ThemeMode | null;
    return stored ?? "dark";
  });
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [shipSpotlight, setShipSpotlight] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(SETTINGS_KEYS.shipSpotlight);
    return stored === null ? true : stored === "true";
  });
  const [mapStyle, setMapStyle] = useState<MapStyle>(() => {
    if (typeof window === "undefined") return "line";
    const stored = window.localStorage.getItem(SETTINGS_KEYS.mapStyle) as MapStyle | null;
    return stored ?? "line";
  });

  // Watch the OS color-scheme preference so "system" mode reacts live
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Persist
  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEYS.themeMode, themeMode);
  }, [themeMode]);
  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEYS.shipSpotlight, shipSpotlight ? "true" : "false");
  }, [shipSpotlight]);
  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEYS.mapStyle, mapStyle);
  }, [mapStyle]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Tramés — Structured Clarity";
  }, []);

  const isDark = themeMode === "system" ? systemDark : themeMode === "dark";

  const cssVars = (isDark ? {
    "--c-bg":           "#0a0a0a",
    "--c-bg-alt":       "#111111",
    "--c-bg-blue":      "#0f1f3d",
    "--c-text":         "#f1f5f9",
    "--c-sub":          "#94a3b8",
    "--c-muted":        "#64748b",
    "--c-border":       "#1e293b",
    "--c-border-light": "#0f172a",
    "--c-reveal-base":  "#1a2030",
    "--c-hero-bg":       "linear-gradient(180deg, #0a0a0a 0%, #0b0e1e 55%, #0a0e1b 100%)",
    "--c-hero-bg-solid": "#0a0c14",
    "--c-hero-end":      "#0a0e1b",
    "--c-spot-rgb":      "96, 165, 250",
    "--c-btn-bg":        "#0a0e1d",
    "--c-btn-border":    "#1e2944",
    "--c-ship":          "#cbd5e1",
    "--c-port-fill":     "rgba(15,23,42,0.95)",
    "--c-port-stroke":   "rgba(167,139,250,0.7)",
    "--c-port-center":   "#a78bfa",
  } : {
    "--c-bg":           "#ffffff",
    "--c-bg-alt":       "#f8fafc",
    "--c-bg-blue":      "#eff6ff",
    "--c-text":         "#0f172a",
    "--c-sub":          "#475569",
    "--c-muted":        "#94a3b8",
    "--c-border":       "#e2e8f0",
    "--c-border-light": "#f1f5f9",
    "--c-reveal-base":  "#dde3ec",
    "--c-hero-bg":       "linear-gradient(180deg, #f8faff 0%, #eef2ff 50%, #f4f7fe 100%)",
    "--c-hero-bg-solid": "#f4f7fe",
    "--c-hero-end":      "#f4f7fe",
    "--c-spot-rgb":      "99, 102, 241",
    "--c-btn-bg":        "#eff3ff",
    "--c-btn-border":    "#d6e0f5",
    "--c-ship":          "#64748b",
    "--c-port-fill":     "rgba(255,255,255,0.9)",
    "--c-port-stroke":   "rgba(117,79,247,0.6)",
    "--c-port-center":   "#754ff7",
  }) as React.CSSProperties;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, overflowX: "clip", ...cssVars }}>
      <Nav isDark={isDark} />
      <Hero isDark={isDark} shipSpotlight={shipSpotlight} mapStyle={mapStyle} />
      <ScrollRevealStatement isDark={isDark} />
      <Ecosystem isDark={isDark} />
      <div style={{ height: 1, background: C.border }}/>
      <Problem />
      <div style={{ height: 1, background: C.border }}/>
      <Pillars />
      <div style={{ height: 1, background: C.border }}/>
      <FeatureGrid />
      <Metrics />
      <Testimonials />
      <CTABanner />
      <Footer themeMode={themeMode} onThemeModeChange={setThemeMode} />
      <SettingsPanel
        isDark={isDark}
        themeMode={themeMode}
        shipSpotlight={shipSpotlight}
        mapStyle={mapStyle}
        onThemeModeChange={setThemeMode}
        onShipSpotlightChange={setShipSpotlight}
        onMapStyleChange={setMapStyle}
      />
    </div>
  );
}
