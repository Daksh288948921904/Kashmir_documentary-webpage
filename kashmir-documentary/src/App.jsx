import { useState, useEffect, useRef, useCallback } from "react";

const API = "/api";

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function relTime(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

async function apiFetch(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

const CATEGORY_COLORS = {
  political: "#D4A853",
  conflict: "#C44B3F",
  cultural: "#5B9279",
  humanitarian: "#7B8CDE",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
`;

function KashmirMap({ events, activeEvent, onEventClick }) {
  const mapRef = useRef(null);
  const kashmirPath =
    "M120,40 Q140,20 180,25 Q220,15 260,30 Q300,20 340,35 Q370,50 380,80 Q390,120 370,160 Q360,200 340,230 Q310,260 280,270 Q250,285 220,280 Q190,290 160,270 Q130,260 110,230 Q90,200 80,170 Q70,130 85,100 Q95,70 120,40 Z";

  const toSVG = (lat, lng) => {
    const x = ((lng - 73.5) / (77 - 73.5)) * 300 + 50;
    const y = ((35.2 - lat) / (35.2 - 32.5)) * 250 + 20;
    return { x, y };
  };

  const mappable = events.filter((ev) => ev.lat != null && ev.lng != null);

  return (
    <svg
      ref={mapRef}
      viewBox="0 0 440 310"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 40px rgba(212,168,83,0.15))" }}
    >
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2a1a" />
          <stop offset="100%" stopColor="#0a0f0a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pulse">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={kashmirPath}
        fill="url(#mapGlow)"
        stroke="#D4A853"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        filter="url(#glow)"
      />

      {[60, 100, 140, 180, 220].map((y, i) => (
        <line
          key={i}
          x1="80"
          y1={y}
          x2={360 - i * 20}
          y2={y + 10}
          stroke="#D4A853"
          strokeOpacity="0.06"
          strokeWidth="0.5"
        />
      ))}

      {/* Line of Control */}
      <path
        d="M180,20 Q200,80 220,140 Q240,200 250,280"
        fill="none"
        stroke="#C44B3F"
        strokeWidth="1"
        strokeDasharray="6,4"
        strokeOpacity="0.3"
      />
      <text
        x="260"
        y="145"
        fill="#C44B3F"
        fontSize="7"
        fontFamily="'Cormorant Garamond', serif"
        opacity="0.5"
        transform="rotate(-70, 260, 145)"
      >
        Line of Control
      </text>

      {mappable.map((ev, idx) => {
        const pos = toSVG(ev.lat, ev.lng);
        const isActive = activeEvent?.year === ev.year;
        const color = CATEGORY_COLORS[ev.category] || "#D4A853";
        return (
          <g
            key={`${ev.year}-${idx}`}
            onClick={() => onEventClick(ev)}
            style={{ cursor: "pointer" }}
          >
            {/* Outer pulse ring (always shown, dimmer when inactive) */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 18 : 12}
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity={isActive ? 0.35 : 0.1}
            >
              {isActive && (
                <>
                  <animate
                    attributeName="r"
                    values="10;22;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </>
              )}
            </circle>
            {isActive && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill={color}
                fillOpacity="0.12"
                filter="url(#pulse)"
              />
            )}
            {/* Main dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 8 : 6}
              fill={isActive ? color : "rgba(20,25,20,0.9)"}
              stroke={color}
              strokeWidth={isActive ? 2.5 : 1.8}
              filter="url(#dotGlow)"
              style={{ transition: "all 0.4s ease" }}
            />
            {/* Year label */}
            <text
              x={pos.x}
              y={pos.y - 13}
              textAnchor="middle"
              fill={isActive ? color : "#887755"}
              fontSize={isActive ? "9.5" : "8"}
              fontFamily="'Cormorant Garamond', serif"
              fontWeight={isActive ? "700" : "500"}
              style={{ transition: "all 0.3s ease", pointerEvents: "none" }}
            >
              {ev.year}
            </text>
            {/* Place label for active event */}
            {isActive && ev.place && (
              <text
                x={pos.x}
                y={pos.y + 20}
                textAnchor="middle"
                fill={color}
                fontSize="7.5"
                fontFamily="'Cormorant Garamond', serif"
                fontStyle="italic"
                style={{ pointerEvents: "none" }}
              >
                {ev.place}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function KashmirDocumentary() {
  const [currentSection, setCurrentSection] = useState("home");
  const [activeTimelineEvent, setActiveTimelineEvent] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [socialFilter, setSocialFilter] = useState("all");
  const [visibleSections, setVisibleSections] = useState(new Set(["hero"]));
  const sectionRefs = useRef({});

  const [timelineEvents, setTimelineEvents] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [overviewData, setOverviewData] = useState(null);

  const [payEmail, setPayEmail] = useState("");
  const [payName, setPayName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("kashmir_access_token");
    if (!token) return;
    fetch(`${API}/payment/verify-access`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.valid) setHasAccess(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch("/documentary/timeline")
      .then((d) => setTimelineEvents(d.events || []))
      .catch(() => {});

    apiFetch("/documentary/timestamps")
      .then((d) =>
        setChapters(
          (d.markers || []).map((m) => ({
            time: fmtTime(m.timestamp_seconds),
            title: m.title,
            desc: m.description,
          }))
        )
      )
      .catch(() => {});

    apiFetch("/documentary/overview")
      .then(setOverviewData)
      .catch(() => {});

    apiFetch("/news/feed")
      .then((d) => setNewsItems(d.articles || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const qs = socialFilter !== "all" ? `?platform=${socialFilter}` : "";
    setSocialLoading(true);
    apiFetch(`/social/feed${qs}`)
      .then((d) => setSocialPosts(d.posts || []))
      .catch(() => setSocialPosts([]))
      .finally(() => setSocialLoading(false));
  }, [socialFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
        });
      },
      { threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [currentSection]);

  const registerRef = useCallback(
    (id) => (el) => {
      sectionRefs.current[id] = el;
    },
    []
  );
  const isVisible = (id) => visibleSections.has(id);

  function handlePayment() {
    setHasAccess(true);
    setCurrentSection("movie");
  }

  const globalStyles = `
    ${FONTS}
    @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes breathe { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
    @keyframes grain { 0%, 100% { transform: translate(0,0); } 10% { transform: translate(-2%,-3%); } 30% { transform: translate(3%,2%); } 50% { transform: translate(-1%,3%); } 70% { transform: translate(2%,-1%); } 90% { transform: translate(-3%,1%); } }
    .grain-overlay { position: fixed; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="300" height="300" filter="url(%23n)" opacity="0.04"/></svg>'); animation: grain 8s steps(10) infinite; pointer-events: none; z-index: 9999; }
    .section-reveal { opacity: 0; transform: translateY(40px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
    .section-reveal.visible { opacity: 1; transform: translateY(0); }
    html, body { margin: 0; padding: 0; overflow-x: hidden; background: #060806; }
    * { scrollbar-width: thin; scrollbar-color: #D4A853 #0a0f0a; box-sizing: border-box; }
    *::-webkit-scrollbar { width: 6px; }
    *::-webkit-scrollbar-track { background: #0a0f0a; }
    *::-webkit-scrollbar-thumb { background: #D4A853; border-radius: 3px; }
    .timeline-item:hover { background: rgba(212,168,83,0.06) !important; }
    .social-card:hover { border-color: rgba(212,168,83,0.35) !important; transform: translateY(-3px) !important; }
    .nav-link:hover { color: #D4A853 !important; }
    @media (max-width: 768px) {
      .timeline-grid { grid-template-columns: 1fr !important; }
      .overview-grid { grid-template-columns: 1fr !important; }
      .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .social-grid { grid-template-columns: 1fr !important; }
    }
  `;

  // ─── MOVIE PAGE ───
  if (currentSection === "movie") {
    return (
      <div
        style={{
          background: "#060806",
          minHeight: "100vh",
          width: "100%",
          color: "#e8e0d0",
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        <style>{globalStyles}</style>
        <div className="grain-overlay" />

        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background:
              "linear-gradient(180deg, rgba(6,8,6,0.97) 0%, transparent 100%)",
            padding: "18px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(212,168,83,0.08)",
          }}
        >
          <button
            onClick={() => setCurrentSection("home")}
            style={{
              background: "none",
              border: "1px solid rgba(212,168,83,0.25)",
              color: "#D4A853",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "8px 18px",
              borderRadius: "2px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,168,83,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            ← Back to Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {[
              { href: "#movie-social", label: "Social Feed" },
              { href: "#movie-news", label: "News" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#665544",
                  textDecoration: "none",
                  padding: "7px 16px",
                  border: "1px solid rgba(212,168,83,0.18)",
                  borderRadius: "2px",
                  transition: "all 0.3s",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#D4A853";
                  e.currentTarget.style.borderColor = "rgba(212,168,83,0.45)";
                  e.currentTarget.style.background = "rgba(212,168,83,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#665544";
                  e.currentTarget.style.borderColor = "rgba(212,168,83,0.18)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </a>
            ))}
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#443322",
              }}
            >
              Now Watching
            </span>
          </div>
        </nav>

        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Player + Chapters */}
          <div
            style={{
              paddingTop: "80px",
              display: "flex",
              gap: "0",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 65%", minWidth: "300px" }}>
              <div
                style={{
                  aspectRatio: "16/9",
                  background:
                    "linear-gradient(135deg, #0a120a 0%, #1a1510 50%, #0a0f0a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  margin: "0 20px 0 40px",
                  borderRadius: "6px",
                  border: "1px solid rgba(212,168,83,0.15)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/></filter><rect width=\"200\" height=\"200\" filter=\"url(%23n)\" opacity=\"0.08\"/></svg>')",
                    opacity: 0.5,
                  }}
                />
                <div style={{ textAlign: "center", zIndex: 1 }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      border: "2px solid #D4A853",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      cursor: "pointer",
                      background: "rgba(212,168,83,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "22px solid #D4A853",
                        borderTop: "14px solid transparent",
                        borderBottom: "14px solid transparent",
                        marginLeft: "6px",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: "#887755",
                    }}
                  >
                    Documentary Placeholder
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#554433",
                      marginTop: "8px",
                    }}
                  >
                    Video player will be integrated here
                  </p>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "rgba(212,168,83,0.1)",
                  }}
                >
                  <div
                    style={{
                      width: "0%",
                      height: "100%",
                      background: "linear-gradient(90deg, #D4A853, #C44B3F)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  margin: "16px 20px 0 40px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "22px",
                      color: "#e8e0d0",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {overviewData?.title || "Kashmir: Untold Echoes"}
                  </h2>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#887755",
                      margin: "4px 0 0",
                      letterSpacing: "2px",
                    }}
                  >
                    {overviewData
                      ? `${overviewData.duration_minutes} MIN • ${overviewData.release_year} • DOCUMENTARY`
                      : "95 MIN • 2026 • DOCUMENTARY"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chapters Sidebar */}
            <div
              style={{
                flex: "1 1 30%",
                minWidth: "280px",
                padding: "0 40px 0 20px",
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: "11px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#D4A853",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(212,168,83,0.2)",
                }}
              >
                Chapters
              </h3>
              {chapters.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#554433" }}>
                  Loading chapters…
                </p>
              ) : (
                chapters.map((ch, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveChapter(i)}
                    style={{
                      padding: "14px 16px",
                      marginBottom: "6px",
                      background:
                        activeChapter === i
                          ? "rgba(212,168,83,0.08)"
                          : "transparent",
                      borderLeft:
                        activeChapter === i
                          ? "2px solid #D4A853"
                          : "2px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: activeChapter === i ? 600 : 400,
                          color: activeChapter === i ? "#e8e0d0" : "#887755",
                        }}
                      >
                        {ch.title}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#554433",
                          fontFamily: "monospace",
                        }}
                      >
                        {ch.time}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#665544",
                        margin: "6px 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      {ch.desc}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Social Posts */}
          <div
            id="movie-social"
            style={{
              padding: "60px 40px",
              borderTop: "1px solid rgba(212,168,83,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "36px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "6px",
                    textTransform: "uppercase",
                    color: "#D4A853",
                    marginBottom: "8px",
                  }}
                >
                  Social Feed
                </p>
                <h3
                  style={{
                    fontSize: "30px",
                    fontWeight: 400,
                    color: "#e8e0d0",
                    margin: 0,
                  }}
                >
                  Kashmir on Social
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#887755",
                    marginTop: "6px",
                    fontFamily: "'Libre Baskerville', serif",
                  }}
                >
                  Voices from Instagram & Twitter
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["all", "instagram", "twitter"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSocialFilter(f)}
                    style={{
                      padding: "7px 18px",
                      background:
                        socialFilter === f
                          ? "rgba(212,168,83,0.12)"
                          : "transparent",
                      border:
                        socialFilter === f
                          ? "1px solid #D4A853"
                          : "1px solid rgba(212,168,83,0.2)",
                      color: socialFilter === f ? "#D4A853" : "#887755",
                      borderRadius: "20px",
                      fontSize: "11px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "'Cormorant Garamond', serif",
                      transition: "all 0.3s",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {socialLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color: "#554433",
                  fontSize: "14px",
                  letterSpacing: "2px",
                }}
              >
                Loading social feed…
              </div>
            ) : socialPosts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color: "#554433",
                  fontSize: "14px",
                }}
              >
                No posts available.
              </div>
            ) : (
              <div
                className="social-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {socialPosts.map((post, i) => (
                  <a
                    key={i}
                    href={post.post_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="social-card"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(212,168,83,0.12)",
                        borderRadius: "8px",
                        padding: "22px",
                        transition: "all 0.35s ease",
                        cursor: "pointer",
                        height: "100%",
                      }}
                    >
                      {post.media_url && (
                        <div
                          style={{
                            width: "100%",
                            height: "180px",
                            borderRadius: "4px",
                            marginBottom: "16px",
                            background: `url(${post.media_url}) center/cover`,
                            filter: "saturate(0.7) contrast(1.1)",
                          }}
                        />
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "12px",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "#e8e0d0",
                              marginBottom: "2px",
                            }}
                          >
                            {post.author}
                          </div>
                          <div
                            style={{ fontSize: "12px", color: "#665544" }}
                          >
                            {post.author_handle}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "9px",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color:
                              post.platform === "instagram"
                                ? "#C13584"
                                : "#1DA1F2",
                            padding: "4px 10px",
                            border: `1px solid ${
                              post.platform === "instagram"
                                ? "rgba(193,53,132,0.3)"
                                : "rgba(29,161,242,0.3)"
                            }`,
                            borderRadius: "12px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {post.platform}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.75,
                          color: "#aa9977",
                          fontFamily: "'Libre Baskerville', serif",
                          margin: "0 0 14px",
                        }}
                      >
                        {post.content}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#554433",
                          paddingTop: "12px",
                          borderTop: "1px solid rgba(212,168,83,0.08)",
                        }}
                      >
                        <span style={{ display: "flex", gap: "12px" }}>
                          <span>♥ {post.likes.toLocaleString()}</span>
                          {post.shares > 0 && (
                            <span>↺ {post.shares.toLocaleString()}</span>
                          )}
                        </span>
                        <span>{relTime(post.posted_at)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* News */}
          <div
            id="movie-news"
            style={{
              padding: "60px 40px",
              borderTop: "1px solid rgba(212,168,83,0.1)",
              background: "rgba(212,168,83,0.015)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#D4A853",
                marginBottom: "8px",
              }}
            >
              Latest Updates
            </p>
            <h3
              style={{
                fontSize: "30px",
                fontWeight: 400,
                color: "#e8e0d0",
                margin: "0 0 6px",
              }}
            >
              Kashmir Dispatch
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#887755",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "36px",
              }}
            >
              Direct to source
            </p>
            {newsItems.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#554433" }}>
                Loading news…
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {newsItems.map((item, i) => (
                  <a
                    key={i}
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        padding: "20px 16px",
                        borderBottom: "1px solid rgba(212,168,83,0.06)",
                        transition: "all 0.3s",
                        alignItems: "flex-start",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212,168,83,0.05)";
                        e.currentTarget.style.paddingLeft = "24px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.paddingLeft = "16px";
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontSize: "17px",
                            fontWeight: 500,
                            color: "#e8e0d0",
                            margin: "0 0 6px",
                            lineHeight: 1.4,
                          }}
                        >
                          {item.headline}
                        </h4>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#887755",
                            margin: 0,
                            lineHeight: 1.6,
                            fontFamily: "'Libre Baskerville', serif",
                          }}
                        >
                          {item.brief}
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          minWidth: "100px",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#D4A853",
                            letterSpacing: "1px",
                          }}
                        >
                          {item.source_name}
                        </span>
                        <br />
                        <span style={{ fontSize: "10px", color: "#554433" }}>
                          {relTime(item.published_at)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <footer
            style={{
              padding: "40px",
              textAlign: "center",
              borderTop: "1px solid rgba(212,168,83,0.1)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#554433",
              }}
            >
              Kashmir: Untold Echoes • 2026
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // ─── HOME PAGE ───
  return (
    <div
      style={{
        background: "#060806",
        minHeight: "100vh",
        width: "100%",
        color: "#e8e0d0",
        fontFamily: "'Cormorant Garamond', serif",
        overflowX: "hidden",
      }}
    >
      <style>{globalStyles}</style>
      <div className="grain-overlay" />

      {/* ═══ NAV ═══ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(6,8,6,0.9) 0%, transparent 100%)",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: "#D4A853",
            fontWeight: 400,
          }}
        >
          Kashmir
        </span>
        <div style={{ display: "flex", gap: "32px" }}>
          {[
            { id: "timeline", label: "Roadmap" },
            { id: "trailer", label: "Trailer" },
            { id: "cta", label: "Watch" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link"
              style={{
                fontSize: "10px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#665544",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        id="hero"
        ref={registerRef("hero")}
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(91,146,121,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(196,75,63,0.05) 0%, transparent 50%)",
          }}
        />
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: "#D4A853",
              borderRadius: "50%",
              left: `${10 + (i * 7) % 80}%`,
              top: `${10 + (i * 11) % 80}%`,
              animation: `breathe ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 3) * 0.8}s`,
              opacity: 0.3,
            }}
          />
        ))}
        <div
          style={{
            textAlign: "center",
            zIndex: 2,
            padding: "0 20px",
            maxWidth: "800px",
          }}
        >
          <div style={{ animation: "fadeIn 2s ease-out", animationFillMode: "both" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "8px",
                textTransform: "uppercase",
                color: "#D4A853",
                marginBottom: "30px",
              }}
            >
              A Documentary Film
            </p>
          </div>
          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 300,
              lineHeight: 0.95,
              margin: "0 0 20px",
              animation: "fadeUp 1.5s ease-out 0.3s",
              animationFillMode: "both",
            }}
          >
            <span style={{ display: "block", color: "#e8e0d0" }}>Kashmir</span>
            <span
              style={{
                display: "block",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "0.5em",
                color: "#D4A853",
                marginTop: "8px",
              }}
            >
              Untold Echoes
            </span>
          </h1>
          <div
            style={{
              width: "60px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, #D4A853, transparent)",
              margin: "30px auto",
              animation: "fadeIn 2s ease-out 1s",
              animationFillMode: "both",
            }}
          />
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.9,
              color: "#aa9977",
              maxWidth: "550px",
              margin: "0 auto",
              fontFamily: "'Libre Baskerville', serif",
              fontWeight: 400,
              animation: "fadeUp 1.5s ease-out 0.8s",
              animationFillMode: "both",
            }}
          >
            An unflinching journey through centuries of beauty, conflict, and
            resilience. From Mughal gardens to modern-day struggles — this is
            the story of a land caught between paradise and pain.
          </p>
          <div
            style={{
              marginTop: "50px",
              animation: "fadeUp 1.5s ease-out 1.2s",
              animationFillMode: "both",
            }}
          >
            <a
              href="#timeline"
              style={{
                display: "inline-block",
                padding: "14px 40px",
                border: "1px solid #D4A853",
                color: "#D4A853",
                fontSize: "11px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.4s",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,168,83,0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Explore the Timeline
            </a>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "breathe 3s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "linear-gradient(180deg, #D4A853, transparent)",
              margin: "0 auto",
            }}
          />
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#887755",
              marginTop: "10px",
            }}
          >
            Scroll
          </p>
        </div>
      </section>

      {/* ═══ OVERVIEW ═══ */}
      <section
        id="overview"
        ref={registerRef("overview")}
        className={`section-reveal ${isVisible("overview") ? "visible" : ""}`}
        style={{ padding: "120px 40px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}
      >
        <div
          className="overview-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#D4A853",
                marginBottom: "20px",
              }}
            >
              About the Film
            </p>
            <h2
              style={{
                fontSize: "38px",
                fontWeight: 300,
                lineHeight: 1.2,
                margin: "0 0 24px",
              }}
            >
              A land that has been
              <br />
              <em style={{ fontWeight: 500, color: "#D4A853" }}>fought over</em>
              ,
              <br />
              but rarely{" "}
              <em style={{ fontWeight: 500, color: "#D4A853" }}>listened to</em>
              .
            </h2>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.9,
                color: "#887755",
                fontFamily: "'Libre Baskerville', serif",
              }}
            >
              {overviewData?.synopsis ||
                "For decades, Kashmir has existed in headlines — reduced to a geopolitical dispute, a security problem, a territorial claim. But beneath the barbed wire and beyond the curfews, there are lives being lived, stories being whispered, and a culture refusing to disappear."}
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                aspectRatio: "3/4",
                background:
                  "linear-gradient(135deg, #1a2a1a 0%, #0a0f0a 50%, #1a1510 100%)",
                borderRadius: "2px",
                border: "1px solid rgba(212,168,83,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <div style={{ fontSize: "48px", opacity: 0.3 }}>🏔</div>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#554433",
                }}
              >
                Film Poster
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                width: "60px",
                height: "60px",
                borderTop: "1px solid #D4A853",
                borderRight: "1px solid #D4A853",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-12px",
                left: "-12px",
                width: "60px",
                height: "60px",
                borderBottom: "1px solid #D4A853",
                borderLeft: "1px solid #D4A853",
                opacity: 0.4,
              }}
            />
          </div>
        </div>
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "40px",
            marginTop: "80px",
            paddingTop: "60px",
            borderTop: "1px solid rgba(212,168,83,0.1)",
          }}
        >
          {[
            {
              num: overviewData ? `${overviewData.duration_minutes}` : "95",
              label: "Minutes",
            },
            { num: "700+", label: "Years of History" },
            { num: "47", label: "Interviews" },
            { num: "12", label: "Locations Filmed" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: 300,
                  color: "#D4A853",
                  margin: "0 0 6px",
                }}
              >
                {stat.num}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#887755",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HISTORY ROADMAP / MAP TIMELINE ═══ */}
      <section
        id="timeline"
        ref={registerRef("timeline")}
        className={`section-reveal ${isVisible("timeline") ? "visible" : ""}`}
        style={{
          padding: "100px 0",
          background:
            "linear-gradient(180deg, rgba(212,168,83,0.025) 0%, transparent 50%, rgba(212,168,83,0.025) 100%)",
        }}
      >
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#D4A853",
                marginBottom: "16px",
              }}
            >
              History Roadmap
            </p>
            <h2
              style={{ fontSize: "42px", fontWeight: 300, margin: "0 0 12px" }}
            >
              The Road to{" "}
              <em style={{ fontWeight: 500, color: "#D4A853" }}>Kashmir</em>
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#887755",
                fontFamily: "'Libre Baskerville', serif",
              }}
            >
              Click any map point or timeline entry to explore its story
            </p>
          </div>

          {timelineEvents.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#554433",
                fontSize: "14px",
              }}
            >
              Loading timeline…
            </p>
          ) : (
            <>
              {/* Map + List grid */}
              <div
                className="timeline-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "32px",
                  alignItems: "start",
                }}
              >
                {/* LEFT: Map */}
                <div
                  style={{
                    position: "sticky",
                    top: "80px",
                    background: "rgba(8,12,8,0.7)",
                    border: "1px solid rgba(212,168,83,0.12)",
                    borderRadius: "8px",
                    padding: "24px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#554433",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    Kashmir Region — {timelineEvents.filter(e => e.lat).length} Historical Sites
                  </p>
                  <KashmirMap
                    events={timelineEvents}
                    activeEvent={activeTimelineEvent}
                    onEventClick={(ev) =>
                      setActiveTimelineEvent(
                        activeTimelineEvent?.year === ev.year ? null : ev
                      )
                    }
                  />
                  {/* Category legend */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                      marginTop: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                      <div
                        key={cat}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: color,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "10px",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            color: "#665544",
                          }}
                        >
                          {cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Scrollable event list */}
                <div
                  style={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                    }}
                  >
                    {timelineEvents.map((ev, idx) => {
                      const isActive = activeTimelineEvent?.year === ev.year;
                      const color = CATEGORY_COLORS[ev.category] || "#D4A853";
                      return (
                        <div
                          key={`${ev.year}-${idx}`}
                          className="timeline-item"
                          onClick={() =>
                            setActiveTimelineEvent(isActive ? null : ev)
                          }
                          style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "flex-start",
                            padding: "14px 18px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            borderLeft: `3px solid ${isActive ? color : "transparent"}`,
                            background: isActive
                              ? `rgba(${
                                  color === "#D4A853"
                                    ? "212,168,83"
                                    : color === "#C44B3F"
                                    ? "196,75,63"
                                    : color === "#5B9279"
                                    ? "91,146,121"
                                    : "123,140,222"
                                },0.08)`
                              : "transparent",
                            borderRadius: "0 6px 6px 0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              paddingTop: "2px",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: isActive ? color : "transparent",
                                border: `2px solid ${color}`,
                                transition: "all 0.3s",
                                flexShrink: 0,
                              }}
                            />
                            {idx < timelineEvents.length - 1 && (
                              <div
                                style={{
                                  width: "1px",
                                  height: "20px",
                                  background: `${color}22`,
                                }}
                              />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "12px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "15px",
                                  color: color,
                                  fontWeight: 600,
                                  minWidth: "44px",
                                }}
                              >
                                {ev.year}
                              </span>
                              <span
                                style={{
                                  fontSize: "15px",
                                  color: isActive ? "#e8e0d0" : "#aa9977",
                                  fontWeight: isActive ? 500 : 400,
                                  transition: "color 0.3s",
                                }}
                              >
                                {ev.title}
                              </span>
                            </div>
                            {ev.place && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#554433",
                                  letterSpacing: "1px",
                                  display: "block",
                                  marginTop: "3px",
                                }}
                              >
                                📍 {ev.place}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              color: isActive ? color : "#443322",
                              letterSpacing: "2px",
                              textTransform: "uppercase",
                              flexShrink: 0,
                              marginTop: "2px",
                              transition: "color 0.3s",
                            }}
                          >
                            {ev.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detail Panel — full width, appears when event is selected */}
              {activeTimelineEvent && (
                <div
                  style={{
                    marginTop: "32px",
                    animation: "slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(10,15,10,0.8)",
                      border: `1px solid ${
                        CATEGORY_COLORS[activeTimelineEvent.category] || "#D4A853"
                      }33`,
                      borderRadius: "10px",
                      padding: "36px 40px",
                      position: "relative",
                      overflow: "hidden",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {/* Colored top bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background:
                          CATEGORY_COLORS[activeTimelineEvent.category] ||
                          "#D4A853",
                        opacity: 0.7,
                      }}
                    />

                    {/* Back button */}
                    <button
                      onClick={() => setActiveTimelineEvent(null)}
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "24px",
                        background: "rgba(212,168,83,0.08)",
                        border: "1px solid rgba(212,168,83,0.2)",
                        color: "#D4A853",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "11px",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        padding: "8px 18px",
                        borderRadius: "4px",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212,168,83,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(212,168,83,0.08)";
                      }}
                    >
                      ← Back to Roadmap
                    </button>

                    <div
                      style={{
                        display: "flex",
                        gap: "40px",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: "1 1 300px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "20px",
                            marginBottom: "16px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "64px",
                              fontWeight: 300,
                              color:
                                CATEGORY_COLORS[
                                  activeTimelineEvent.category
                                ] || "#D4A853",
                              lineHeight: 1,
                            }}
                          >
                            {activeTimelineEvent.year}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                              color:
                                CATEGORY_COLORS[
                                  activeTimelineEvent.category
                                ] || "#D4A853",
                              padding: "5px 14px",
                              border: `1px solid ${
                                CATEGORY_COLORS[
                                  activeTimelineEvent.category
                                ] || "#D4A853"
                              }44`,
                              borderRadius: "3px",
                            }}
                          >
                            {activeTimelineEvent.category}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: "28px",
                            fontWeight: 500,
                            margin: "0 0 8px",
                            color: "#e8e0d0",
                            lineHeight: 1.3,
                          }}
                        >
                          {activeTimelineEvent.title}
                        </h3>
                        {activeTimelineEvent.place && (
                          <p
                            style={{
                              fontSize: "13px",
                              color:
                                CATEGORY_COLORS[
                                  activeTimelineEvent.category
                                ] || "#D4A853",
                              letterSpacing: "2px",
                              margin: "0 0 24px",
                            }}
                          >
                            📍 {activeTimelineEvent.place}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: "15px",
                            lineHeight: 1.9,
                            color: "#aa9977",
                            fontFamily: "'Libre Baskerville', serif",
                            margin: 0,
                          }}
                        >
                          {activeTimelineEvent.description}
                        </p>
                      </div>

                      {/* Navigation arrows inside detail */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          alignSelf: "center",
                          flexShrink: 0,
                        }}
                      >
                        {(() => {
                          const idx = timelineEvents.findIndex(
                            (e) => e.year === activeTimelineEvent.year
                          );
                          return (
                            <>
                              {idx > 0 && (
                                <button
                                  onClick={() =>
                                    setActiveTimelineEvent(
                                      timelineEvents[idx - 1]
                                    )
                                  }
                                  style={{
                                    background: "rgba(212,168,83,0.06)",
                                    border: "1px solid rgba(212,168,83,0.15)",
                                    color: "#887755",
                                    fontFamily:
                                      "'Cormorant Garamond', serif",
                                    fontSize: "12px",
                                    letterSpacing: "2px",
                                    cursor: "pointer",
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    transition: "all 0.3s",
                                    textAlign: "left",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#D4A853";
                                    e.currentTarget.style.borderColor =
                                      "rgba(212,168,83,0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#887755";
                                    e.currentTarget.style.borderColor =
                                      "rgba(212,168,83,0.15)";
                                  }}
                                >
                                  ↑ {timelineEvents[idx - 1].year}
                                  <br />
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#554433",
                                    }}
                                  >
                                    {timelineEvents[idx - 1].title.slice(
                                      0,
                                      22
                                    )}
                                    …
                                  </span>
                                </button>
                              )}
                              {idx < timelineEvents.length - 1 && (
                                <button
                                  onClick={() =>
                                    setActiveTimelineEvent(
                                      timelineEvents[idx + 1]
                                    )
                                  }
                                  style={{
                                    background: "rgba(212,168,83,0.06)",
                                    border: "1px solid rgba(212,168,83,0.15)",
                                    color: "#887755",
                                    fontFamily:
                                      "'Cormorant Garamond', serif",
                                    fontSize: "12px",
                                    letterSpacing: "2px",
                                    cursor: "pointer",
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    transition: "all 0.3s",
                                    textAlign: "left",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#D4A853";
                                    e.currentTarget.style.borderColor =
                                      "rgba(212,168,83,0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#887755";
                                    e.currentTarget.style.borderColor =
                                      "rgba(212,168,83,0.15)";
                                  }}
                                >
                                  ↓ {timelineEvents[idx + 1].year}
                                  <br />
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#554433",
                                    }}
                                  >
                                    {timelineEvents[idx + 1].title.slice(
                                      0,
                                      22
                                    )}
                                    …
                                  </span>
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══ TRAILER ═══ */}
      <section
        id="trailer"
        ref={registerRef("trailer")}
        className={`section-reveal ${isVisible("trailer") ? "visible" : ""}`}
        style={{ padding: "120px 40px" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "#D4A853",
              marginBottom: "16px",
            }}
          >
            Watch the Trailer
          </p>
          <h2
            style={{ fontSize: "36px", fontWeight: 300, margin: "0 0 40px" }}
          >
            Two minutes that will
            <br />
            <em style={{ fontWeight: 500, color: "#D4A853" }}>
              change how you see Kashmir
            </em>
          </h2>
          <div
            style={{
              aspectRatio: "16/9",
              background: "linear-gradient(135deg, #0a120a, #1a1510)",
              borderRadius: "8px",
              border: "1px solid rgba(212,168,83,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,168,83,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,168,83,0.15)";
            }}
          >
            <div style={{ textAlign: "center", zIndex: 1 }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  border: "2px solid #D4A853",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  background: "rgba(212,168,83,0.05)",
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "28px solid #D4A853",
                    borderTop: "18px solid transparent",
                    borderBottom: "18px solid transparent",
                    marginLeft: "8px",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "12px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#887755",
                }}
              >
                Trailer Placeholder
              </p>
              <p style={{ fontSize: "11px", color: "#554433", marginTop: "4px" }}>
                YouTube / Vimeo embed will go here
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PAYMENT / CTA ═══ */}
      <section
        id="cta"
        ref={registerRef("cta")}
        className={`section-reveal ${isVisible("cta") ? "visible" : ""}`}
        style={{
          padding: "120px 40px",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(196,75,63,0.04) 50%, transparent 100%)",
          position: "relative",
        }}
      >
        <div
          style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "#C44B3F",
              marginBottom: "20px",
            }}
          >
            Take the Dive
          </p>
          <h2
            style={{
              fontSize: "42px",
              fontWeight: 300,
              lineHeight: 1.2,
              margin: "0 0 20px",
            }}
          >
            Ready to witness
            <br />
            <em style={{ fontWeight: 500, color: "#D4A853" }}>
              Kashmir's untold story?
            </em>
          </h2>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.8,
              color: "#887755",
              fontFamily: "'Libre Baskerville', serif",
              marginBottom: "40px",
            }}
          >
            95 minutes of unfiltered truth. No narrator — just the voices of
            Kashmir.
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "40px 60px",
              background: "rgba(212,168,83,0.04)",
              border: "1px solid rgba(212,168,83,0.2)",
              borderRadius: "8px",
              marginBottom: "30px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#887755",
                margin: "0 0 8px",
              }}
            >
              Full Documentary Access
            </p>
            <p
              style={{
                fontSize: "48px",
                fontWeight: 300,
                color: "#D4A853",
                margin: "0 0 4px",
              }}
            >
              ₹299
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#554433",
                marginBottom: "24px",
              }}
            >
              30-day streaming access
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={payName}
              onChange={(e) => setPayName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                marginBottom: "10px",
                background: "rgba(212,168,83,0.05)",
                border: "1px solid rgba(212,168,83,0.2)",
                borderRadius: "2px",
                color: "#e8e0d0",
                fontSize: "14px",
                fontFamily: "'Cormorant Garamond', serif",
                outline: "none",
              }}
            />
            <input
              type="email"
              placeholder="Your email"
              value={payEmail}
              onChange={(e) => setPayEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(212,168,83,0.05)",
                border: "1px solid rgba(212,168,83,0.2)",
                borderRadius: "2px",
                color: "#e8e0d0",
                fontSize: "14px",
                fontFamily: "'Cormorant Garamond', serif",
                outline: "none",
              }}
            />
          </div>

          <br />

          <button
            onClick={handlePayment}
            style={{
              padding: "16px 50px",
              background: "linear-gradient(135deg, #D4A853, #B8912F)",
              border: "none",
              color: "#060806",
              fontSize: "12px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "4px",
              transition: "all 0.4s",
              boxShadow: "0 4px 30px rgba(212,168,83,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 8px 40px rgba(212,168,83,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 30px rgba(212,168,83,0.2)";
            }}
          >
            Enter Kashmir →
          </button>

          {hasAccess && (
            <p
              style={{
                fontSize: "12px",
                color: "#5B9279",
                marginTop: "16px",
                cursor: "pointer",
              }}
              onClick={() => setCurrentSection("movie")}
            >
              You already have access — click to watch →
            </p>
          )}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          padding: "60px 40px 40px",
          borderTop: "1px solid rgba(212,168,83,0.08)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "20px",
            fontStyle: "italic",
            color: "#887755",
            marginBottom: "20px",
          }}
        >
          "If there is a paradise on earth, it is this, it is this, it is this."
        </p>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "2px",
            color: "#554433",
            marginBottom: "30px",
          }}
        >
          — attributed to Mughal Emperor Jahangir
        </p>
        <div
          style={{
            width: "40px",
            height: "1px",
            background: "#D4A853",
            margin: "0 auto 20px",
            opacity: 0.3,
          }}
        />
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#443322",
          }}
        >
          Kashmir: Untold Echoes • MMXXVI
        </p>
      </footer>
    </div>
  );
}
