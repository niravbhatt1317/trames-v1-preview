import { motion, AnimatePresence } from "framer-motion";

type Theme = {
  body: string;
  sectionBorder: string;
  brandText: string;
  activeBg: string;
  activeDot: string;
  activeText: string;
  inactiveDot: string;
  inactiveText: string;
  headerText: string;
  subText: string;
  exportBg: string;
  exportBorder: string;
  searchBg: string;
  searchBorder: string;
  searchText: string;
  filterInactive: string;
  filterActive: string;
  filterActiveBorder: string;
  filterActiveBg: string;
  filterBorder: string;
  tableHeaderText: string;
  rowBorder: string;
  exceptionRowBg: string;
  exceptionRowBorder: string;
  rowId: string;
  rowText: string;
  cardBorder: string;
  outerBorder: string;
  logoFilter: string;
};

const DARK: Theme = {
  body:               "#0d1117",
  sectionBorder:      "rgba(255,255,255,0.05)",
  brandText:          "#e6edf3",
  activeBg:           "rgba(59,130,246,0.12)",
  activeDot:          "#3b82f6",
  activeText:         "#60a5fa",
  inactiveDot:        "#2d333b",
  inactiveText:       "#6b7a9a",
  headerText:         "#e6edf3",
  subText:            "#6b7a9a",
  exportBg:           "#21262d",
  exportBorder:       "rgba(255,255,255,0.06)",
  searchBg:           "#161b22",
  searchBorder:       "rgba(255,255,255,0.06)",
  searchText:         "#4b5563",
  filterInactive:     "#6b7a9a",
  filterActive:       "#60a5fa",
  filterActiveBorder: "rgba(59,130,246,0.4)",
  filterActiveBg:     "rgba(59,130,246,0.08)",
  filterBorder:       "rgba(255,255,255,0.06)",
  tableHeaderText:    "#4b5563",
  rowBorder:          "rgba(255,255,255,0.025)",
  exceptionRowBg:     "rgba(239,68,68,0.03)",
  exceptionRowBorder: "rgba(239,68,68,0.06)",
  rowId:              "#58a6ff",
  rowText:            "#8b949e",
  cardBorder:         "rgba(255,255,255,0.06)",
  outerBorder:        "rgba(214,224,245,0.12)",
  logoFilter:         "brightness(0) invert(0.92)",
};

const LIGHT: Theme = {
  body:               "#ffffff",
  sectionBorder:      "#f1f5f9",
  brandText:          "#0f172a",
  activeBg:           "#eff6ff",
  activeDot:          "#3b82f6",
  activeText:         "#3b82f6",
  inactiveDot:        "#cbd5e1",
  inactiveText:       "#64748b",
  headerText:         "#0f172a",
  subText:            "#64748b",
  exportBg:           "#ffffff",
  exportBorder:       "#e2e8f0",
  searchBg:           "#f8fafc",
  searchBorder:       "#e2e8f0",
  searchText:         "#94a3b8",
  filterInactive:     "#64748b",
  filterActive:       "#3b82f6",
  filterActiveBorder: "rgba(59,130,246,0.35)",
  filterActiveBg:     "#eff6ff",
  filterBorder:       "#e2e8f0",
  tableHeaderText:    "#94a3b8",
  rowBorder:          "#f1f5f9",
  exceptionRowBg:     "#fef2f2",
  exceptionRowBorder: "#fee2e2",
  rowId:              "#3b82f6",
  rowText:            "#475569",
  cardBorder:         "rgba(15,23,42,0.06)",
  outerBorder:        "rgba(214,224,245,0.5)",
  logoFilter:         "none",
};

/* ─── Per-tab content config ─────────────────────────────── */

type Row = { c1: string; c2: string; c3: string; c4: string; status: string; sC: string; sBgDark: string; sBgLight: string };

type TabContent = {
  title: string;
  subtitle: string;
  filters: string[];
  columns: string[];
  searchPlaceholder: string;
  rows: Row[];
};

const TAB_CONTENT: Record<string, TabContent> = {
  tracking: {
    title: "Tracking",
    subtitle: "142 active shipments · live carrier feeds",
    filters: ["All", "In Transit", "Exceptions", "Delivered"],
    columns: ["Shipment ID", "Route", "Carrier", "ETA", "Status"],
    searchPlaceholder: "Search shipments...",
    rows: [
      { c1: "TRM-28471", c2: "SHA → RTM", c3: "MSC",        c4: "Jul 28", status: "In Transit", sC: "#f59e0b", sBgDark: "rgba(245,158,11,0.12)", sBgLight: "#fff7ed" },
      { c1: "TRM-28470", c2: "SIN → LAX", c3: "Maersk",     c4: "Jul 18", status: "Delivered",  sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "TRM-28469", c2: "DXB → HAM", c3: "CMA",        c4: "Jul 31", status: "Exception",  sC: "#ef4444", sBgDark: "rgba(239,68,68,0.12)",  sBgLight: "#fef2f2" },
      { c1: "TRM-28468", c2: "PUS → FXT", c3: "ONE",        c4: "Aug 12", status: "At Origin",  sC: "#64748b", sBgDark: "rgba(100,116,139,0.1)", sBgLight: "#f1f5f9" },
      { c1: "TRM-28467", c2: "HKG → NYC", c3: "COSCO",      c4: "Aug 04", status: "In Transit", sC: "#f59e0b", sBgDark: "rgba(245,158,11,0.12)", sBgLight: "#fff7ed" },
      { c1: "TRM-28466", c2: "RTM → ORD", c3: "DHL",        c4: "Jul 22", status: "Customs",    sC: "#818cf8", sBgDark: "rgba(129,140,248,0.1)", sBgLight: "#eef2ff" },
      { c1: "TRM-28465", c2: "BOM → FRA", c3: "Lufthansa",  c4: "Jul 25", status: "In Transit", sC: "#f59e0b", sBgDark: "rgba(245,158,11,0.12)", sBgLight: "#fff7ed" },
      { c1: "TRM-28464", c2: "LAX → YOK", c3: "K-Line",     c4: "Aug 18", status: "Booked",     sC: "#60a5fa", sBgDark: "rgba(96,165,250,0.1)",  sBgLight: "#eff6ff" },
      { c1: "TRM-28463", c2: "TXG → ANT", c3: "Evergreen",  c4: "Aug 02", status: "Delivered",  sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "TRM-28462", c2: "SEA → BRE", c3: "Hapag",      c4: "Aug 09", status: "At Origin",  sC: "#64748b", sBgDark: "rgba(100,116,139,0.1)", sBgLight: "#f1f5f9" },
    ],
  },
  automate: {
    title: "Workflows",
    subtitle: "12 active rules · 184 actions automated this week",
    filters: ["All", "Active", "Paused", "Custom"],
    columns: ["Rule ID", "Trigger", "Action", "Last run", "Status"],
    searchPlaceholder: "Search rules...",
    rows: [
      { c1: "WFL-2412", c2: "Delay > 24h",       c3: "Notify ops",         c4: "2m ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2411", c2: "Customs hold",      c3: "Escalate to L2",     c4: "12m ago",   status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2410", c2: "Doc mismatch",      c3: "Request reupload",   c4: "1h ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2409", c2: "ETA shift > 48h",   c3: "Customer alert",     c4: "3h ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2408", c2: "Cost variance",     c3: "Flag for audit",     c4: "6h ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2407", c2: "Vessel arrival",    c3: "Auto-update ETA",    c4: "Yesterday", status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2406", c2: "Damage reported",   c3: "Insurance claim",    c4: "2d ago",    status: "Paused", sC: "#f59e0b", sBgDark: "rgba(245,158,11,0.12)", sBgLight: "#fff7ed" },
      { c1: "WFL-2405", c2: "Delivery POD",      c3: "Confirm & archive",  c4: "2d ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2404", c2: "New rate sheet",    c3: "Compare carriers",   c4: "3d ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "WFL-2403", c2: "Invoice received",  c3: "Audit & verify",     c4: "4d ago",    status: "Active", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
    ],
  },
  spend: {
    title: "Spend",
    subtitle: "$284k YTD · $48k recovered through audit",
    filters: ["All", "Verified", "Disputed", "Pending"],
    columns: ["Invoice", "Carrier", "Amount", "Date", "Status"],
    searchPlaceholder: "Search invoices...",
    rows: [
      { c1: "INV-8472", c2: "MSC",        c3: "$24,180", c4: "Aug 12", status: "Verified", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "INV-8471", c2: "Maersk",     c3: "$18,440", c4: "Aug 10", status: "Disputed", sC: "#ef4444", sBgDark: "rgba(239,68,68,0.12)",  sBgLight: "#fef2f2" },
      { c1: "INV-8470", c2: "DHL",        c3: "$5,320",  c4: "Aug 09", status: "Verified", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "INV-8469", c2: "CMA",        c3: "$12,750", c4: "Aug 08", status: "Pending",  sC: "#f59e0b", sBgDark: "rgba(245,158,11,0.12)", sBgLight: "#fff7ed" },
      { c1: "INV-8468", c2: "K-Line",     c3: "$8,920",  c4: "Aug 07", status: "Verified", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "INV-8467", c2: "COSCO",      c3: "$16,310", c4: "Aug 05", status: "Verified", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "INV-8466", c2: "Hapag",      c3: "$22,840", c4: "Aug 04", status: "Disputed", sC: "#ef4444", sBgDark: "rgba(239,68,68,0.12)",  sBgLight: "#fef2f2" },
      { c1: "INV-8465", c2: "ONE",        c3: "$11,470", c4: "Aug 03", status: "Verified", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "INV-8464", c2: "Evergreen",  c3: "$19,250", c4: "Aug 01", status: "Verified", sC: "#22c55e", sBgDark: "rgba(34,197,94,0.1)",   sBgLight: "#f0fdf4" },
      { c1: "INV-8463", c2: "Lufthansa",  c3: "$7,560",  c4: "Jul 31", status: "Pending",  sC: "#f59e0b", sBgDark: "rgba(245,158,11,0.12)", sBgLight: "#fff7ed" },
    ],
  },
};

/* ─── Component ──────────────────────────────────────────── */

const MAIN_HEIGHT = 520;

export default function HeroMockup({ isDark, activeTab }: { isDark: boolean; activeTab: string }) {
  const T = isDark ? DARK : LIGHT;

  const navItems = [
    { label: "Dashboard",  active: false },
    { label: "Shipments",  active: activeTab === "tracking" },
    { label: "Exceptions", active: false, badge: "4" },
    { label: "Analytics",  active: activeTab === "analytics" },
    { label: "Workflows",  active: activeTab === "automate" },
    { label: "Spend",      active: activeTab === "spend" },
  ];

  return (
    <div style={{
      borderRadius: "16px 16px 0 0",
      overflow: "hidden",
      border: `1px solid ${T.outerBorder}`,
      background: T.body,
      // --- Hidden: gradient border (kept for future use) ---
      // border: "2px solid transparent",
      // background: `linear-gradient(${T.body}, ${T.body}) padding-box, linear-gradient(90deg, rgba(241,76,79,0.25) 0%, rgba(220,2,165,0.25) 45%, rgba(117,79,247,0.25) 75%, rgba(55,134,248,0.25) 100%) border-box`,
    }}>
      <div style={{ display: "flex", background: T.body }}>
        {/* Sidebar - always the same; only highlight changes */}
        <div style={{ width: 192, background: T.body, borderRight: `1px solid ${T.sectionBorder}`, padding: "14px 8px", flexShrink: 0 }}>
          <div style={{ padding: "4px 8px 18px" }}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Tramés" style={{ height: 18, width: "auto", display: "block", filter: T.logoFilter }} />
          </div>
          {navItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 5, marginBottom: 1, background: item.active ? T.activeBg : "transparent", transition: "background 0.15s" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.active ? T.activeDot : T.inactiveDot, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, fontWeight: item.active ? 600 : 400, color: item.active ? T.activeText : T.inactiveText, flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 9, background: "#ef4444", color: "#fff", padding: "1px 5px", borderRadius: 8 }}>{item.badge}</span>}
            </div>
          ))}
        </div>

        {/* Main panel — fixed height so the dashboard stays constant across tabs */}
        <div style={{ flex: 1, minWidth: 0, height: MAIN_HEIGHT, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", inset: 0 }}
            >
              {activeTab === "analytics"
                ? <AnalyticsView T={T} />
                : <TableView T={T} content={TAB_CONTENT[activeTab] ?? TAB_CONTENT.tracking} isDark={isDark} />
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Table view (shared by tracking / automate / spend) ── */

function TableView({ T, content, isDark }: { T: Theme; content: TabContent; isDark: boolean }) {
  return (
    <>
      <div style={{ padding: "12px 18px 10px", borderBottom: `1px solid ${T.sectionBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.headerText, margin: 0 }}>{content.title}</p>
          <p style={{ fontSize: 9.5, color: T.subText, margin: "1px 0 0" }}>{content.subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ padding: "4px 9px", borderRadius: 5, background: T.exportBg, border: `1px solid ${T.exportBorder}`, fontSize: 9.5, color: T.inactiveText }}>Export</div>
          <div style={{ padding: "4px 9px", borderRadius: 5, background: "#3b82f6", fontSize: 9.5, color: "#fff", fontWeight: 600 }}>+ New</div>
        </div>
      </div>
      <div style={{ padding: "8px 18px", borderBottom: `1px solid ${T.sectionBorder}`, display: "flex", gap: 5, alignItems: "center" }}>
        <div style={{ flex: 1, background: T.searchBg, border: `1px solid ${T.searchBorder}`, borderRadius: 5, padding: "4px 8px", display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={T.searchText} strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontSize: 10, color: T.searchText }}>{content.searchPlaceholder}</span>
        </div>
        {content.filters.map((f, i) => (
          <div key={f} style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${i === 0 ? T.filterActiveBorder : T.filterBorder}`, fontSize: 9.5, color: i === 0 ? T.filterActive : T.filterInactive, background: i === 0 ? T.filterActiveBg : "transparent", whiteSpace: "nowrap" }}>{f}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "106px 134px 76px 84px 96px", gap: 4, padding: "6px 18px", borderBottom: `1px solid ${T.sectionBorder}` }}>
        {content.columns.map(h => (
          <span key={h} style={{ fontSize: 8.5, fontWeight: 600, color: T.tableHeaderText, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
        ))}
      </div>
      {content.rows.map((r, i) => {
        const flagged = r.status === "Exception" || r.status === "Disputed";
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "106px 134px 76px 84px 96px", gap: 4, padding: "8px 18px", borderBottom: `1px solid ${flagged ? T.exceptionRowBorder : T.rowBorder}`, background: flagged ? T.exceptionRowBg : "transparent", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.rowId, fontFamily: "monospace" }}>{r.c1}</span>
            <span style={{ fontSize: 10, color: T.rowText }}>{r.c2}</span>
            <span style={{ fontSize: 10, color: T.rowText }}>{r.c3}</span>
            <span style={{ fontSize: 10, color: T.rowText }}>{r.c4}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: r.sC, background: isDark ? r.sBgDark : r.sBgLight, padding: "2px 7px", borderRadius: 4, display: "inline-block", whiteSpace: "nowrap" }}>{r.status}</span>
          </div>
        );
      })}
    </>
  );
}

/* ─── Analytics view ─────────────────────────────────────── */

function AnalyticsView({ T }: { T: Theme }) {
  const metrics = [
    { label: "Total Shipments", value: "2,847", delta: "+12.4%", up: true },
    { label: "On-Time Rate",    value: "94.2%", delta: "+2.1%",  up: true },
    { label: "Avg Delay",       value: "0.8 d", delta: "-0.3 d", up: true },
    { label: "Cost Savings",    value: "$28k",  delta: "+$4.2k", up: true },
  ];
  const bars = [42, 58, 49, 67, 73, 61, 78, 84, 71, 92, 88, 95];

  return (
    <div style={{ padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.headerText, margin: 0 }}>Analytics</p>
          <p style={{ fontSize: 9.5, color: T.subText, margin: "1px 0 0" }}>Last 30 days · updated 4 min ago</p>
        </div>
        <div style={{ padding: "4px 9px", borderRadius: 5, background: T.exportBg, border: `1px solid ${T.exportBorder}`, fontSize: 9.5, color: T.inactiveText }}>30 days ▾</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ padding: "10px 12px", background: T.searchBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6 }}>
            <p style={{ fontSize: 9, color: T.subText, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: T.headerText, margin: "4px 0 2px" }}>{m.value}</p>
            <p style={{ fontSize: 9.5, color: m.up ? "#22c55e" : "#ef4444", margin: 0, fontWeight: 600 }}>{m.delta}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 14px", background: T.searchBg, border: `1px solid ${T.cardBorder}`, borderRadius: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: T.headerText, margin: 0 }}>Shipment volume</p>
          <p style={{ fontSize: 9.5, color: T.subText, margin: 0 }}>Daily, last 12 days</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}>
          {bars.map((v, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${v}%`,
              background: `linear-gradient(180deg, #3b82f6 0%, #6366f1 100%)`,
              borderRadius: "2px 2px 0 0",
              opacity: 0.85,
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 8.5, color: T.subText }}>May 12</span>
          <span style={{ fontSize: 8.5, color: T.subText }}>May 24</span>
        </div>
      </div>
    </div>
  );
}
