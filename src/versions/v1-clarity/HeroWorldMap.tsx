import { useEffect, useMemo, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
// @ts-expect-error - world-atlas ships JSON without types
import worldData from "world-atlas/countries-110m.json";

const OFFICES = [
  { name: "Singapore",     lat: 1.3521,  lng: 103.8198 },
  { name: "Delhi",         lat: 28.6139, lng: 77.2090  },
  { name: "London",        lat: 51.5074, lng: -0.1278  },
  { name: "Tokyo",         lat: 35.6762, lng: 139.6503 },
  { name: "Kuala Lumpur",  lat: 3.1390,  lng: 101.6869 },
];

const VIEW_W = 1400;
const VIEW_H = 800;
const ACCENT = "#3b82f6";
// Dots follow the headline text color → dark in light theme, off-white in dark theme
const DOT_COLOR = "var(--c-text)";

/* ─── Route definitions ─────────────────────────────────────────────
   Each route has 2 or 3 ports. Segments define the curve between adjacent
   ports — "Q" (quadratic, single control point offset from segment midpoint)
   or "C" (cubic, two control points offset from each endpoint).
   Offsets are in SVG (viewBox) units, tuned to keep paths over water
   given the current projection (scale 220, translate [VIEW_W*0.43, VIEW_H*0.50]).
*/

type PortDef = { name: string; lat: number; lng: number };
type Segment =
  | { type: "Q"; cp: { dx: number; dy: number } }
  | { type: "C"; cp1: { dx: number; dy: number }; cp2: { dx: number; dy: number } };
type RouteDef = { id: string; ports: PortDef[]; segments: Segment[] };

const ROUTES: RouteDef[] = [
  // 1. Singapore → Mumbai → Dubai (always plays first)
  {
    id: "sg-mb-du",
    ports: [
      { name: "Singapore", lat: 1.3521,  lng: 103.8198 },
      { name: "Mumbai",    lat: 19.0760, lng: 72.8777  },
      { name: "Dubai",     lat: 25.2048, lng: 55.2708  },
    ],
    segments: [
      { type: "C", cp1: { dx: -60, dy: 50 }, cp2: { dx: -30, dy: 50 } }, // around south of Sri Lanka
      { type: "Q", cp: { dx: 0,  dy: 10 } },                              // Arabian Sea
    ],
  },
  // 2. Shanghai → Tokyo
  {
    id: "sh-tk",
    ports: [
      { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
      { name: "Tokyo",    lat: 35.6762, lng: 139.6503 },
    ],
    segments: [{ type: "Q", cp: { dx: 5, dy: 32 } }], // pronounced south bow into Pacific
  },
  // 3. Singapore → Shanghai
  {
    id: "sg-sh",
    ports: [
      { name: "Singapore", lat: 1.3521,  lng: 103.8198 },
      { name: "Shanghai",  lat: 31.2304, lng: 121.4737 },
    ],
    segments: [{ type: "Q", cp: { dx: -22, dy: 8 } }], // visible westward bow through Taiwan Strait area
  },
  // 4. Singapore → Darwin → Sydney
  {
    id: "sg-dw-sy",
    ports: [
      { name: "Singapore", lat: 1.3521,   lng: 103.8198 },
      { name: "Darwin",    lat: -12.4634, lng: 130.8456 },
      { name: "Sydney",    lat: -33.8688, lng: 151.2093 },
    ],
    segments: [
      { type: "C", cp1: { dx: 5,  dy: 35 }, cp2: { dx: -25, dy: -10 } }, // via Java Sea / Lombok Strait
      { type: "Q", cp: { dx: 22, dy: -8 } },                              // east through Coral Sea then south
    ],
  },
  // 5. Mumbai → Dar es Salaam
  {
    id: "mb-dar",
    ports: [
      { name: "Mumbai",        lat: 19.0760, lng: 72.8777 },
      { name: "Dar es Salaam", lat: -6.7924, lng: 39.2083 },
    ],
    segments: [{ type: "Q", cp: { dx: 12, dy: -22 } }], // visible east-north bow over Indian Ocean
  },
  // 6. Jakarta → Chennai
  {
    id: "jk-ch",
    ports: [
      { name: "Jakarta", lat: -6.2088, lng: 106.8456 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707  },
    ],
    segments: [
      { type: "C", cp1: { dx: -12, dy: 28 }, cp2: { dx: 18, dy: 28 } }, // south of Sumatra then NW up to Chennai
    ],
  },
  // 7. Ho Chi Minh → Kaohsiung
  {
    id: "hcmc-ka",
    ports: [
      { name: "Ho Chi Minh", lat: 10.8231, lng: 106.6297 },
      { name: "Kaohsiung",   lat: 22.6273, lng: 120.3014 },
    ],
    segments: [{ type: "Q", cp: { dx: 22, dy: 18 } }], // pronounced east-south bow through SCS
  },
  // 8. Algeciras → Miami
  {
    id: "al-mi",
    ports: [
      { name: "Algeciras", lat: 36.1408, lng: -5.4561  },
      { name: "Miami",     lat: 25.7617, lng: -80.1918 },
    ],
    segments: [{ type: "Q", cp: { dx: 5, dy: 42 } }], // pronounced south bow across Atlantic
  },
  // 9. Cape Town → La Guaira
  {
    id: "cp-lg",
    ports: [
      { name: "Cape Town", lat: -33.9249, lng: 18.4241  },
      { name: "La Guaira", lat: 10.6017,  lng: -66.9322 },
    ],
    segments: [{ type: "Q", cp: { dx: 55, dy: 80 } }], // strong rounded south-east arc east of Brazil's bulge
  },
  // 10. Tema → Buenos Aires
  {
    id: "tm-ba",
    ports: [
      { name: "Tema",         lat: 5.6698,   lng: -0.0166  },
      { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
    ],
    segments: [{ type: "Q", cp: { dx: 18, dy: 48 } }], // pronounced south-east bow well clear of Brazil's coast
  },
  // 11. Casablanca → Havana → Veracruz
  {
    id: "ca-hv-vz",
    ports: [
      { name: "Casablanca", lat: 33.5731, lng: -7.5898  },
      { name: "Havana",     lat: 23.1136, lng: -82.3666 },
      { name: "Veracruz",   lat: 19.1738, lng: -96.1342 },
    ],
    segments: [
      { type: "C", cp1: { dx: -8, dy: 28 }, cp2: { dx: 18, dy: 10 } }, // SW across Atlantic, south of Bermuda
      { type: "Q", cp: { dx: 0, dy: 6 } },                              // across Gulf of Mexico
    ],
  },
];

/* ─── Animation timing (seconds, per route) ─────────────────────────
   Build:  starts at 0.5s, lasts 5s   (ends at 5.5s)
   Ship:   starts at 0.5s, lasts 9s   (ends at 9.5s)
   Erase:  starts at 10s, lasts 1s    (ends at 11s)
   Slot total ≈ 13s (includes ~2s blank gap before the next route)
*/
const BUILD_START = 0.5;
const BUILD_DUR   = 5;
const SHIP_DUR    = 9;
const ERASE_START = 10;
const ERASE_DUR   = 1;
const SLOT_MS     = 13000;

/* ─── Helpers ─────────────────────────────────────────────────────── */

function buildOrder(): number[] {
  // First route always plays first (index 0 = Singapore-Mumbai-Dubai)
  const rest = Array.from({ length: ROUTES.length - 1 }, (_, i) => i + 1);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [0, ...rest];
}

function buildSvgPath(
  ports: { x: number; y: number }[],
  segments: Segment[],
): string {
  let d = `M ${ports[0].x} ${ports[0].y}`;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const p1 = ports[i];
    const p2 = ports[i + 1];
    if (seg.type === "Q") {
      const cx = (p1.x + p2.x) / 2 + seg.cp.dx;
      const cy = (p1.y + p2.y) / 2 + seg.cp.dy;
      d += ` Q ${cx} ${cy} ${p2.x} ${p2.y}`;
    } else {
      d += ` C ${p1.x + seg.cp1.dx} ${p1.y + seg.cp1.dy}, ${p2.x + seg.cp2.dx} ${p2.y + seg.cp2.dy}, ${p2.x} ${p2.y}`;
    }
  }
  return d;
}

/* Even ease-in-out splines for animateMotion, one per segment */
function easeSplines(n: number): { keyTimes: string; keySplines: string } {
  // n keyframes at evenly distributed t values, n-1 spline definitions
  const times: string[] = [];
  for (let i = 0; i < n; i++) times.push((i / (n - 1)).toFixed(3));
  const splines: string[] = [];
  for (let i = 0; i < n - 1; i++) splines.push("0.42 0 0.58 1");
  return { keyTimes: times.join(";"), keySplines: splines.join("; ") };
}

/* ─── Component ───────────────────────────────────────────────────── */

export default function HeroWorldMap({
  shipSpotlight = true,
  mapStyle = "line",
  isDark = false,
}: {
  shipSpotlight?: boolean;
  mapStyle?: "line" | "filled";
  isDark?: boolean;
}) {
  const isFilled = mapStyle === "filled";
  // Filled mode — blue tones that sit subtly above/below the hero background.
  // Dark theme hero bg ≈ #0a0c14 → dark blue, a touch lighter so it's just visible.
  // Light theme hero bg ≈ #f4f7fe → light blue, a touch darker so it's just visible.
  const FILLED_COLOR = isDark ? "#1a2547" : "#d6e1fa";
  const [hovered, setHovered] = useState<number | null>(null);
  const [cycleOrder, setCycleOrder] = useState<number[]>(() => buildOrder());
  const [slot, setSlot] = useState(0);
  const currentRouteIdx = cycleOrder[slot];

  // Advance through the cycle on a fixed interval (per-route timing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSlot((s) => {
        const next = s + 1;
        if (next >= cycleOrder.length) {
          setCycleOrder(buildOrder());
          return 0;
        }
        return next;
      });
    }, SLOT_MS);
    return () => clearTimeout(timer);
  }, [slot, cycleOrder]);

  // Move the ship spotlight (--ship-mx / --ship-my) along the ship's path so the map "reveals" under the ship as it moves
  useEffect(() => {
    const heroCard = document.getElementById("hero-card");
    if (!heroCard) return;

    // If the user has disabled it, park the spotlight off-screen and do nothing
    if (!shipSpotlight) {
      heroCard.style.setProperty("--ship-mx", "-400px");
      heroCard.style.setProperty("--ship-my", "-400px");
      return;
    }

    let frameId = 0;
    let active = true;
    const startAtMs = performance.now() + BUILD_START * 1000;
    const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep ≈ ease-in-out

    const tick = () => {
      if (!active) return;
      const path = document.getElementById(`shipRoute-${currentRouteIdx}`) as unknown as SVGGeometryElement | null;
      const svg = path?.ownerSVGElement ?? null;
      if (!path || !svg) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = (performance.now() - startAtMs) / 1000;
      if (elapsed >= 0 && elapsed <= SHIP_DUR) {
        const t = elapsed / SHIP_DUR;
        const easedT = ease(t);
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(easedT * len);
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const screen = pt.matrixTransform(ctm);
          const heroRect = heroCard.getBoundingClientRect();
          heroCard.style.setProperty("--ship-mx", `${screen.x - heroRect.left}px`);
          heroCard.style.setProperty("--ship-my", `${screen.y - heroRect.top}px`);
        }
      } else if (elapsed > SHIP_DUR) {
        // Park the ship spotlight off-screen once the ship has arrived
        heroCard.style.setProperty("--ship-mx", "-400px");
        heroCard.style.setProperty("--ship-my", "-400px");
        return;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [currentRouteIdx, shipSpotlight]);

  // Stable: base world map + offices + projection
  const { paths, projectedOffices, project } = useMemo(() => {
    const countries = feature(
      worldData,
      worldData.objects.countries
    ) as unknown as { features: { geometry: unknown }[] };

    const projection = geoEquirectangular()
      .scale(220)
      .translate([VIEW_W * 0.43, VIEW_H * 0.50]);

    const pathGen = geoPath(projection);

    const paths = countries.features
      .map((f) => pathGen(f as Parameters<typeof pathGen>[0]))
      .filter((d): d is string => Boolean(d));

    const projectedOffices = OFFICES.map((o) => {
      const p = projection([o.lng, o.lat]);
      return { ...o, x: p?.[0] ?? 0, y: p?.[1] ?? 0 };
    });

    return { paths, projectedOffices, project: projection };
  }, []);

  // Per-route: project this slot's ports and build the SVG path
  const { routePorts, routePath, routeStartX, routeEndX } = useMemo(() => {
    const route = ROUTES[currentRouteIdx];
    const ports = route.ports.map((p) => {
      const proj = project([p.lng, p.lat]);
      return { ...p, x: proj?.[0] ?? 0, y: proj?.[1] ?? 0 };
    });
    return {
      routePorts: ports,
      routePath:  buildSvgPath(ports, route.segments),
      routeStartX: ports[0].x,
      routeEndX:   ports[ports.length - 1].x,
    };
  }, [currentRouteIdx, project]);

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  };

  const MASK =
    // Hover spotlight (full radius 220px) follows --hero-mx / --hero-my (cursor)
    "radial-gradient(circle 220px at var(--hero-mx, -300px) var(--hero-my, -300px), rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 22%, rgba(0,0,0,0.45) 58%, rgba(0,0,0,0) 100%), " +
    // Ship spotlight (half radius 110px) follows --ship-mx / --ship-my (route progress)
    "radial-gradient(circle 110px at var(--ship-mx, -400px) var(--ship-my, -400px), rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 22%, rgba(0,0,0,0.45) 58%, rgba(0,0,0,0) 100%)";

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    opacity: 0.03,
  };

  const brightStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    WebkitMaskImage: MASK,
    maskImage: MASK,
  };

  const textureStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backdropFilter: "blur(4px) saturate(1.05)",
    WebkitBackdropFilter: "blur(4px) saturate(1.05)",
    background:
      "radial-gradient(circle 220px at var(--hero-mx, -300px) var(--hero-my, -300px), rgba(var(--c-spot-rgb, 59, 130, 246), 0.035) 0%, rgba(var(--c-spot-rgb, 59, 130, 246), 0.018) 50%, transparent 100%)",
    WebkitMaskImage: MASK,
    maskImage: MASK,
  };

  const glowStyle: React.CSSProperties = {
    position: "absolute",
    left: "var(--hero-mx, -300px)",
    top: "var(--hero-my, -300px)",
    width: 360,
    height: 360,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    background:
      "radial-gradient(circle, rgba(var(--c-spot-rgb, 59, 130, 246), 0.12) 0%, rgba(var(--c-spot-rgb, 59, 130, 246), 0.05) 40%, transparent 75%)",
    borderRadius: "50%",
    filter: "blur(6px)",
  };

  // animateMotion needs keyTimes/keySplines per segment so ease-in-out applies at each port
  const motionEase = useMemo(() => easeSplines(routePorts.length), [routePorts.length]);

  // Vertical fade mask — hides the world map (and texture) behind/below the tab bar area
  const mapFadeStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 40%, transparent 55%)",
    maskImage: "linear-gradient(180deg, #000 0%, #000 40%, transparent 55%)",
  };

  return (
    <div style={containerStyle}>
      {/* 1. Cursor glow halo (not masked) */}
      <div style={glowStyle} />

      {/* World map layers grouped so a single vertical fade mask cleanly hides them behind/below the tabs */}
      <div style={mapFadeStyle}>
        {/* 2. Faint baseline map — line mode only. Filled mode reveals only inside the spotlight. */}
        {!isFilled && (
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" style={baseStyle}>
            <g>
              {paths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke={ACCENT} strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          </svg>
        )}

        {/* 3. Texture (frosted lens) */}
        <div style={textureStyle} />

        {/* 4. Spotlight-revealed bright map */}
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" style={brightStyle}>
          <g>
            {paths.map((d, i) =>
              isFilled ? (
                <path key={i} d={d} fill={FILLED_COLOR} stroke="none" />
              ) : (
                <path key={i} d={d} fill="none" stroke={ACCENT} strokeWidth={0.6} strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
              )
            )}
          </g>
          {projectedOffices.map((o, i) => (
            <g key={o.name}>
              <circle cx={o.x} cy={o.y} r={3} fill="none" stroke={DOT_COLOR} strokeWidth={1.2}>
                <animate attributeName="r" from="3" to="16" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
                <animate attributeName="opacity" from="0.7" to="0" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
              </circle>
              <circle cx={o.x} cy={o.y} r={3.2} fill={DOT_COLOR} />
            </g>
          ))}
        </svg>
      </div>

      {/* 5. Current route + ship — key remounts SVG so SMIL animations restart from t=0 each slot */}
      <svg
        key={`route-${slot}-${currentRouteIdx}`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        <defs>
          <linearGradient
            id={`shipRouteGrad-${currentRouteIdx}`}
            gradientUnits="userSpaceOnUse"
            x1={routeStartX}
            y1="0"
            x2={routeEndX}
            y2="0"
          >
            <stop offset="0%"   stopColor="rgba(241,76,79,0.55)" />
            <stop offset="45%"  stopColor="rgba(220,2,165,0.55)" />
            <stop offset="75%"  stopColor="rgba(117,79,247,0.55)" />
            <stop offset="100%" stopColor="rgba(55,134,248,0.55)" />
          </linearGradient>
        </defs>

        {/* Route line — builds ahead of ship, then erases after ship arrives */}
        <path
          id={`shipRoute-${currentRouteIdx}`}
          d={routePath}
          stroke={`url(#shipRouteGrad-${currentRouteIdx})`}
          fill="none"
          strokeWidth="1"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="100"
          style={{ filter: "blur(0.5px)" }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="100" to="0"
            begin={`${BUILD_START}s`} dur={`${BUILD_DUR}s`}
            fill="freeze"
          />
          <animate
            attributeName="stroke-dashoffset"
            from="0" to="-100"
            begin={`${ERASE_START}s`} dur={`${ERASE_DUR}s`}
            fill="freeze"
          />
        </path>

        {/* Port markers — fade in as build front reaches them, fade out as erase front passes */}
        {routePorts.map((p, i) => {
          const N = routePorts.length;
          const frac = N === 1 ? 0 : i / (N - 1);
          const appearAt    = BUILD_START + frac * BUILD_DUR;
          const disappearAt = ERASE_START + frac * ERASE_DUR;
          return (
            <g key={p.name} opacity="0">
              <circle cx={p.x} cy={p.y} r={3.5} fill="var(--c-port-fill)" stroke="var(--c-port-stroke)" strokeWidth="0.6" />
              <circle cx={p.x} cy={p.y} r={1.2} fill="var(--c-port-center)" />
              <animate attributeName="opacity" from="0" to="1" begin={`${appearAt}s`} dur="0.3s" fill="freeze" />
              <animate attributeName="opacity" from="1" to="0" begin={`${disappearAt}s`} dur="0.3s" fill="freeze" />
            </g>
          );
        })}

        {/* Ship: outer g = motion, inner g = scale + opacity */}
        <g>
          <g opacity="0" transform="scale(0)">
            <circle cx="0" cy="0" r="12" fill="var(--c-hero-bg-solid)" />
            <path
              d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.64 2.62.99 4 .99h2v-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 8.65V5c0-1.1-.9-2-2-2h-3V1H9v2H6C4.9 3 4 3.9 4 5v3.65L1.72 9.04c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v2.97L12 7 6 8.97V6z"
              fill="var(--c-ship)"
              transform="scale(0.55) translate(-12 -12)"
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0;1;1;0"
              keyTimes="0;0.06;0.94;1"
              dur={`${SHIP_DUR}s`}
              begin={`${BUILD_START}s`}
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.06;0.94;1"
              dur={`${SHIP_DUR}s`}
              begin={`${BUILD_START}s`}
              fill="freeze"
            />
          </g>

          <animateMotion
            begin={`${BUILD_START}s`}
            dur={`${SHIP_DUR}s`}
            fill="freeze"
            rotate="0"
            calcMode="spline"
            keyTimes={motionEase.keyTimes}
            keySplines={motionEase.keySplines}
          >
            <mpath href={`#shipRoute-${currentRouteIdx}`} />
          </animateMotion>
        </g>
      </svg>

      {/* Hover hit-targets + tooltips for offices */}
      {projectedOffices.map((o, i) => {
        const left = `${(o.x / VIEW_W) * 100}%`;
        const top = `${(o.y / VIEW_H) * 100}%`;
        return (
          <div
            key={o.name}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  padding: "5px 10px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  border: `1px solid ${ACCENT}66`,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  pointerEvents: "none",
                }}
              >
                {o.name}
                <span
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: `4px solid ${ACCENT}66`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
