import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ThemeMode = "light" | "dark" | "system";
type MapStyle  = "line" | "filled";

export default function SettingsPanel({
  isDark,
  themeMode,
  shipSpotlight,
  mapStyle,
  onThemeModeChange,
  onShipSpotlightChange,
  onMapStyleChange,
}: {
  isDark: boolean;
  themeMode: ThemeMode;
  shipSpotlight: boolean;
  mapStyle: MapStyle;
  onThemeModeChange: (m: ThemeMode) => void;
  onShipSpotlightChange: (on: boolean) => void;
  onMapStyleChange: (s: MapStyle) => void;
}) {
  const [open, setOpen] = useState(false);

  const cardBg     = isDark ? "#0a0c14"            : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const textColor  = isDark ? "#f1f5f9"            : "#0f172a";
  const subText    = isDark ? "rgba(241,245,249,0.55)" : "rgba(15,23,42,0.55)";
  const linkBorder = isDark ? "rgba(255,255,255,0.1)"  : "rgba(15,23,42,0.1)";
  const segActiveBg     = isDark ? "rgba(96,165,250,0.18)" : "rgba(99,102,241,0.12)";
  const segActiveBorder = isDark ? "rgba(96,165,250,0.55)" : "rgba(99,102,241,0.45)";

  const mapStyleOptions: { id: MapStyle; label: string; icon: React.ReactNode }[] = [
    {
      id: "line",
      label: "Line",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      ),
    },
    {
      id: "filled",
      label: "Filled",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
  ];

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "system",
      label: "System",
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
      label: "Light",
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
      label: "Dark",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Floating gear button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isDark ? "rgba(20,30,50,0.92)" : "rgba(255,255,255,0.95)",
          border: `1px solid ${cardBorder}`,
          color: isDark ? "#cbd5e1" : "#475569",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 200,
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      {/* Modal popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 380,
                maxWidth: "100%",
                background: cardBg,
                color: textColor,
                borderRadius: 18,
                padding: 24,
                border: `1px solid ${cardBorder}`,
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>Settings</h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "transparent",
                    border: "none",
                    color: "currentColor",
                    opacity: 0.55,
                    cursor: "pointer",
                    fontSize: 20,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Theme picker */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600 }}>Default theme</p>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: subText }}>
                  Choose System to match your operating system, or pick Light or Dark.
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {themeOptions.map(({ id, label, icon }) => {
                    const active = themeMode === id;
                    return (
                      <button
                        key={id}
                        onClick={() => onThemeModeChange(id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: active ? segActiveBg : "transparent",
                          border: `1px solid ${active ? segActiveBorder : linkBorder}`,
                          color: "currentColor",
                          fontWeight: active ? 600 : 500,
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ship spotlight */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600 }}>Reveal map under ships</p>
                  <p style={{ margin: 0, fontSize: 12, color: subText }}>
                    The spotlight on the map follows each ship as it travels along its route.
                  </p>
                </div>
                <Toggle on={shipSpotlight} onChange={onShipSpotlightChange} isDark={isDark} />
              </div>

              {/* Map style */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600 }}>Map style</p>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: subText }}>
                  Render the world map as country outlines or as filled landmasses.
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {mapStyleOptions.map(({ id, label, icon }) => {
                    const active = mapStyle === id;
                    return (
                      <button
                        key={id}
                        onClick={() => onMapStyleChange(id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: active ? segActiveBg : "transparent",
                          border: `1px solid ${active ? segActiveBorder : linkBorder}`,
                          color: "currentColor",
                          fontWeight: active ? 600 : 500,
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Toggle({ on, onChange, isDark }: { on: boolean; onChange: (v: boolean) => void; isDark: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? "#3b82f6" : isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.15)",
        border: "none",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s ease",
        marginTop: 2,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}
