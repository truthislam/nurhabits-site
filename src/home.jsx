// src/Home.jsx — NurHabits v3: Blueprint-First, Visual-Heavy, 40% Leaner
// Flow: Hero (Blueprint PDF giveaway) → Enemy (scannable) → Blueprint Preview (images) → How It Works → Story → Ledger → Pricing → Join
import { useState, useEffect, useRef } from "react";

const FORMSPREE_ID = "https://formspree.io/f/xzdjrlqw";
const IG = "https://instagram.com/nurhabits";

// ── BLUEPRINT PDF URL ──
// Replace this with the actual hosted PDF link (e.g. a Payhip free download, Google Drive link, or direct file)
const BLUEPRINT_PDF = "/blueprint.pdf";

/* ---------- Reveal ---------- */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVis(true), delay); obs.unobserve(e.target); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>{children}</div>
  );
}

/* ---------- Divider ---------- */
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "72px 0" }}>
      <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.4))" }} />
      <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" fill="none" stroke="rgba(212,168,83,0.4)" strokeWidth="1" /></svg>
      <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, rgba(212,168,83,0.4), transparent)" }} />
    </div>
  );
}

/* ---------- Particles ---------- */
function Particles() {
  const dots = useRef(Array.from({ length: 16 }, () => ({
    w: 1 + Math.random() * 2, left: Math.random() * 100, top: Math.random() * 100,
    dur: 8 + Math.random() * 12, del: Math.random() * 5, anim: Math.floor(Math.random() * 3),
  })));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {dots.current.map((d, i) => (
        <div key={i} style={{
          position: "absolute", width: `${d.w}px`, height: `${d.w}px`, borderRadius: "50%",
          background: "rgba(212,168,83,0.15)", left: `${d.left}%`, top: `${d.top}%`,
          animation: `float${d.anim} ${d.dur}s ease-in-out infinite`, animationDelay: `${d.del}s`,
        }} />
      ))}
    </div>
  );
}

/* ---------- Tier Card ---------- */
function TierCard({ name, price, period, tagline, features, cta, ctaHref, highlighted, badge }) {
  return (
    <div className="tier-card" style={{
      background: highlighted ? "linear-gradient(160deg, rgba(212,168,83,0.10) 0%, rgba(26,26,46,0.98) 60%)" : "rgba(255,255,255,0.02)",
      border: highlighted ? "1.5px solid rgba(212,168,83,0.45)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px", position: "relative",
      display: "flex", flexDirection: "column",
      ...(highlighted && { boxShadow: "0 0 80px rgba(212,168,83,0.06)" }),
    }}>
      {badge && (
        <span style={{ position: "absolute", top: "14px", right: "14px", background: "#D4A853", color: "#1a1a2e", fontSize: "9px", fontWeight: 800, padding: "5px 12px", borderRadius: "20px", letterSpacing: "1.5px", textTransform: "uppercase" }}>{badge}</span>
      )}
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: highlighted ? "rgba(212,168,83,0.7)" : "rgba(255,255,255,0.3)", marginBottom: "10px" }}>{name}</div>
      <div style={{ marginBottom: "6px" }}>
        <span style={{ fontSize: "36px", fontWeight: 800, color: highlighted ? "#D4A853" : "#fff" }}>{price}</span>
        {period && <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginLeft: "4px" }}>/{period}</span>}
      </div>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: "20px", minHeight: "40px" }}>{tagline}</p>
      <div style={{ display: "grid", gap: "8px", marginBottom: "24px", flex: 1 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: highlighted ? "#D4A853" : "rgba(212,168,83,0.5)", fontSize: "13px", lineHeight: 1.5, flexShrink: 0 }}>&#10003;</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
      <a href={ctaHref || "#join"} style={{
        display: "block", textAlign: "center",
        background: highlighted ? "linear-gradient(135deg, #D4A853 0%, #b8923d 100%)" : "rgba(255,255,255,0.06)",
        color: highlighted ? "#1a1a2e" : "rgba(255,255,255,0.6)",
        padding: "14px 24px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none",
        border: highlighted ? "none" : "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease",
      }}>{cta}</a>
    </div>
  );
}


export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("nurUser");
    if (user) setIsLogged(true);
  }, []);

  const send = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("sending");
    try {
      const r = await fetch(FORMSPREE_ID, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(r.ok ? "done" : "error");
      if (r.ok) setEmail("");
    } catch { setStatus("error"); }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: "100vh", background: "#1a1a2e", color: "#fff", fontFamily: "'Outfit', sans-serif", position: "relative" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{background:#1a1a2e;overflow-x:hidden}
        ::selection{background:rgba(212,168,83,0.25);color:#fff}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes breathe{0%,100%{opacity:.3}50%{opacity:.7}}
        @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes float1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-15px) translateX(10px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px) translateX(-8px)}}
        @keyframes subtleFloat{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-8px) rotate(0deg)}}
        .cta-main{
          display:inline-block;background:linear-gradient(135deg,#D4A853 0%,#b8923d 100%);
          color:#1a1a2e;padding:18px 44px;border-radius:8px;font-weight:700;font-size:17px;
          text-decoration:none;letter-spacing:0.3px;transition:all 0.3s ease;font-family:'Outfit',sans-serif;
        }
        .cta-main:hover{transform:scale(1.04);box-shadow:0 12px 48px rgba(212,168,83,0.3)}
        .cta-ghost{
          display:inline-block;border:1.5px solid rgba(212,168,83,0.35);color:#D4A853;
          padding:16px 36px;border-radius:8px;font-weight:600;font-size:15px;
          text-decoration:none;transition:all 0.3s ease;font-family:'Outfit',sans-serif;
        }
        .cta-ghost:hover{background:rgba(212,168,83,0.08);border-color:rgba(212,168,83,0.7)}
        .mockup-container{
          position:relative;max-width:380px;margin:0 auto;
          animation:subtleFloat 6s ease-in-out infinite;
        }
        .mockup-glow{
          position:absolute;top:-20px;left:-20px;right:-20px;bottom:-20px;border-radius:24px;
          background:radial-gradient(ellipse at center,rgba(212,168,83,0.12) 0%,transparent 70%);
          pointer-events:none;z-index:0;
        }
        .page-wrapper{overflow-x:hidden}

        /* ── Hero button row ── */
        .hero-buttons{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}

        /* ── Tier card grid ── */
        .tier-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;align-items:stretch}

        /* ── Tier card base ── */
        .tier-card{padding:32px 24px}

        /* ── MRC book grid ── */
        .mrc-book-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}

        /* ── Nav links ── */
        .nav-links{display:flex;gap:24px;align-items:center}
        .nav-text-link{color:rgba(255,255,255,0.5);text-decoration:none;font-size:13px;font-weight:500}

        /* ── Email row ── */
        .email-row{display:flex;gap:8px}

        /* ═══════════════════════════════════════
           MOBILE — max-width: 600px
           ═══════════════════════════════════════ */
        @media(max-width:600px){
          /* 1. Stack hero CTAs full-width */
          .hero-buttons{flex-direction:column;gap:12px;width:100%}
          .hero-buttons .cta-main,
          .hero-buttons .cta-ghost{width:100%;text-align:center;padding:18px 20px}

          /* 2. Mockup glow — tighten to prevent horizontal bleed */
          .mockup-glow{top:-12px;left:-12px;right:-12px;bottom:-12px}

          /* 3. Tier card padding — tighter on mobile */
          .tier-card{padding:24px 16px}

          /* 4. MRC book grid — already auto-fit but ensure minimum */
          .mrc-book-grid{grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px}

          /* 5. Nav — hide text links, keep logo + CTA */
          .nav-text-link{display:none}
          .nav-links{gap:12px}

          /* 6. Email row — stack on very small screens */
          .email-row{flex-direction:column;gap:8px}
          .email-row input,.email-row button{width:100%}

          /* 7. General section padding tighten */
          .section-pad{padding-left:16px;padding-right:16px}
        }

        /* ═══════════════════════════════════════
           SMALL MOBILE — max-width: 380px
           ═══════════════════════════════════════ */
        @media(max-width:380px){
          .tier-card{padding:20px 14px}
          .mrc-book-grid{grid-template-columns:1fr 1fr;gap:8px}
          .mockup-glow{top:-8px;left:-8px;right:-8px;bottom:-8px}
        }
      `}</style>

      <Particles />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px",
        background: "rgba(26,26,46,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#D4A853", letterSpacing: "1px" }}>NURHABITS</span>
        <div className="nav-links">
          <a href="https://nurhabits.substack.com/" target="_blank" rel="noopener noreferrer" className="nav-text-link">Blog</a>
          <a href="#pricing" className="nav-text-link">Pricing</a>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/walk" style={{ background: "linear-gradient(135deg, #D4A853 0%, #b8923d 100%)", color: "#1a1a2e", padding: "8px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", textDecoration: "none" }}>Start Free</a>
            {isLogged && (
              <a href="/walk" style={{ color: "#D4A853", fontSize: "18px", textDecoration: "none", background: "rgba(212,168,83,0.1)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>&#128100;</a>
            )}
          </div>
        </div>
      </nav>


      {/* ================================================================
          1. HERO — Logo → Headline → PDF Mockup → CTA
          ================================================================ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px", textAlign: "center", position: "relative", zIndex: 1,
      }}>

        <div style={{
          position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* ── LOGO ── */}
        <div style={{ animation: "fadeUp 0.8s ease both", position: "relative" }}>
          <img src="/logo.png" alt="NurHabits" style={{ height: "180px", width: "auto", objectFit: "contain" }} />
        </div>

        <p style={{
          fontSize: "11px", color: "rgba(212,168,83,0.6)", letterSpacing: "4px",
          textTransform: "uppercase", fontWeight: 700, marginTop: "12px",
          animation: "fadeUp 0.8s ease 0.1s both",
        }}>Free PDF — The Daily System of the Prophet &#65018;</p>

        <h1 style={{
          fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900,
          color: "#fff", marginTop: "12px", letterSpacing: "-1.5px", lineHeight: 1.08,
          animation: "fadeUp 0.8s ease 0.2s both", maxWidth: "700px",
        }}>
          The greatest routine ever lived.<br/>
          <span style={{ color: "#D4A853" }}>Yours for free.</span>
        </h1>

        <p style={{
          fontSize: "clamp(14px, 2.2vw, 17px)", color: "rgba(255,255,255,0.45)",
          maxWidth: "440px", lineHeight: 1.7, marginTop: "14px", fontWeight: 300,
          animation: "fadeUp 0.8s ease 0.3s both",
        }}>
          Tahajjud to sleep adhkar. Every Prophetic habit. Every hadith reference. One page.
        </p>

        {/* ── PDF MOCKUP (visual anchor below headline) ── */}
        <div style={{ animation: "fadeUp 0.8s ease 0.4s both", marginTop: "32px" }} className="mockup-container">
          <div className="mockup-glow" />
          {/*
            ┌──────────────────────────────────────────────────────┐
            │  Replace src with your high-quality mockup image.    │
            │  Recommended: 3D angled view of the Blueprint PDF,   │
            │  dark background, 840×1080px.                        │
            │  Save as: /public/blueprint-mockup.png               │
            └──────────────────────────────────────────────────────┘
          */}
          <img
            src="/blueprint-mockup.png"
            alt="The Prophetic Blueprint — Free PDF"
            style={{
              width: "100%", maxWidth: "380px", height: "auto",
              borderRadius: "12px",
              border: "1px solid rgba(212,168,83,0.2)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,83,0.1)",
              position: "relative", zIndex: 1,
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
          <div style={{
            display: "none", width: "100%", maxWidth: "380px", aspectRatio: "210/297",
            borderRadius: "12px", border: "1.5px dashed rgba(212,168,83,0.3)",
            background: "rgba(212,168,83,0.04)", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "12px",
            margin: "0 auto", position: "relative", zIndex: 1,
          }}>
            <span style={{ fontSize: "48px" }}>&#128220;</span>
            <span style={{ fontSize: "13px", color: "rgba(212,168,83,0.6)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>The Prophetic Blueprint</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>Add /public/blueprint-mockup.png</span>
          </div>
        </div>

        <div className="hero-buttons" style={{ marginTop: "28px", animation: "fadeUp 0.8s ease 0.55s both" }}>
          <a href={BLUEPRINT_PDF} target="_blank" rel="noopener noreferrer" className="cta-main">
            Download The Blueprint — Free
          </a>
          <a href="/walk" className="cta-ghost">
            Start Tracking
          </a>
        </div>

        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", marginTop: "14px", animation: "fadeUp 0.8s ease 0.65s both" }}>
          No email. No account. No ads. Just the work.
        </p>

        <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", animation: "breathe 2.5s ease infinite" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10l6 6 6-6" stroke="rgba(212,168,83,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      </section>


      {/* ================================================================
          2. ENEMY — Scannable Hooks, Not a Manifesto
          ================================================================ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "24px" }}>You already know the type</p>
          </Reveal>

          <Reveal delay={60}>
            <p style={{ fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.45, marginBottom: "24px" }}>
              Bismillah in the intro.<br/>
              Rented Lambo in the thumbnail.<br/>
              Empty course in the link.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ display: "grid", gap: "10px", marginBottom: "28px" }}>
              {['"Scale to 10K/month from Dubai."', '"AI copywriting mastery."', '"Cold outreach secrets."'].map((line, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,60,60,0.04)", border: "1px solid rgba(255,60,60,0.08)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>{line}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={170}>
            <p style={{
              fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 700, color: "#D4A853",
              lineHeight: 1.4, fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginBottom: "16px",
            }}>
              Since when did the Deen become a sales funnel?
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div style={{ padding: "18px 0 18px 22px", borderLeft: "3px solid rgba(212,168,83,0.35)" }}>
              <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 600, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                You do not need another course.<br/>You need the routine of the man who already perfected it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ================================================================
          3. BLUEPRINT PREVIEW — Image Only, Let the PDF Sell Itself
          ================================================================ */}
      <section id="the-blueprint" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "clamp(24px, 4.5vw, 38px)", fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>
                His day was not random. <span style={{ color: "#D4A853" }}>It was an operating system.</span>
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginTop: "12px", maxWidth: "480px", margin: "12px auto 0" }}>
                Dawn to sunrise. Midday to sunset. Nightfall to sleep. Every hour mapped. Every habit sourced to an authentic hadith.
              </p>
            </div>
          </Reveal>

          {/* ── Full Blueprint Image ── */}
          <Reveal delay={80}>
            <div style={{
              borderRadius: "16px", overflow: "hidden",
              border: "1px solid rgba(212,168,83,0.15)",
              boxShadow: "0 16px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,168,83,0.08)",
              marginBottom: "28px",
            }}>
              {/*
                ┌──────────────────────────────────────────────────────────┐
                │  Replace src with a high-res screenshot of the full      │
                │  Blueprint PDF showing all 3 phases.                     │
                │  Save as: /public/blueprint-preview.png                  │
                │  Recommended: 1600×900px, cropped to show detail.        │
                └──────────────────────────────────────────────────────────┘
              */}
              <img
                src="/blueprint-preview.png"
                alt="The Prophetic Blueprint — Full Preview"
                style={{ width: "100%", height: "auto", display: "block" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
              <div style={{
                display: "none", width: "100%", aspectRatio: "16/9",
                background: "rgba(212,168,83,0.03)", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                <span style={{ fontSize: "36px" }}>&#128196;</span>
                <span style={{ fontSize: "12px", color: "rgba(212,168,83,0.5)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Full Blueprint Preview</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Add /public/blueprint-preview.png</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ textAlign: "center" }}>
              <a href={BLUEPRINT_PDF} target="_blank" rel="noopener noreferrer" className="cta-main" style={{ padding: "16px 40px", fontSize: "16px" }}>
                Download The Blueprint — Free
              </a>
              <p style={{ marginTop: "10px", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Every habit. Every hadith. One page. Yours to keep.</p>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ================================================================
          4. HOW IT WORKS — Lean Steps
          ================================================================ */}
      <section id="how-it-works" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>How it works</p>
            <h2 style={{ fontSize: "clamp(24px, 4.5vw, 36px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "10px" }}>
              Two minutes a day. <span style={{ color: "#D4A853" }}>That is it.</span>
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "28px" }}>
              Open the tracker. Tap your prayers. See your streak. See your brother's streak. Close it.
            </p>
          </Reveal>

          {[
            { num: "01", title: "Track the Prophetic habits.", body: "Five prayers. Sunnah prayers. Quran. Adhkar. You did it or you did not." },
            { num: "02", title: "Build the streak.", body: "7-day streak in one week. The consistency compounds. The guilt of breaking it becomes fuel." },
            { num: "03", title: "Walk with one brother.", body: "One companion sees your streak. You see his. No details. No group chat. Quiet pressure." },
            { num: "04", title: "Level up.", body: "Foundation → Growth → Elite. Move when you are ready." },
          ].map((step, i) => (
            <Reveal key={i} delay={60 + i * 50}>
              <div style={{
                display: "flex", gap: "14px", marginBottom: "12px",
                padding: "18px 16px", background: "rgba(255,255,255,0.015)",
                borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "rgba(212,168,83,0.2)", lineHeight: 1, flexShrink: 0 }}>{step.num}</span>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{step.title}</h3>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={280}>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <a href="/walk" className="cta-main" style={{ padding: "16px 40px", fontSize: "16px" }}>Start Tracking — Free</a>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ================================================================
          5. STORY — Trimmed to Bone
          ================================================================ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "540px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "24px" }}>Your brother on the walk</p>
          </Reveal>

          <Reveal delay={60}>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: "16px" }}>
              I am Kassim. Somali-American. Landed in Egypt January 2020. Left three times chasing dollars. Came back with $6,000. Then $2,000. Then $1,800. Less money every time. Further from Allah every time.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ padding: "18px 0 18px 22px", borderLeft: "3px solid rgba(212,168,83,0.35)", marginBottom: "16px" }}>
              <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.55, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                A brother my age died in a car crash. We are not promised tomorrow.
              </p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginTop: "12px" }}>
                Made istikhara with my wife. Committed. Staying in Egypt. $0.14 to my name. I would rather perish here broke than crush my iman for mere human gain.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              I mapped the Prophet's daily system, built a tracker around it, and said: walk with me. That is the whole pitch.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ── LEDGER ── */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "540px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>The Walk</p>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "8px" }}>$0.14 and a hijrah.</h2>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", lineHeight: 1.6, marginBottom: "28px" }}>Real bank account. Every dollar. No hiding.</p>
          </Reveal>

          <Reveal delay={60}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "22px 18px", fontFamily: "'Outfit', monospace" }}>
              {[
                { date: "Feb 2026", desc: "Starting balance", amount: null, balance: 0.14, type: "start" },
                { date: "Mar 2026", desc: "Etsy shop sales", amount: 32.51, balance: 32.65, type: "in" },
                { date: "Mar 2026", desc: "Google One", amount: -3.99, balance: 28.66, type: "out" },
                { date: "Mar 2026", desc: "Namecheap domain", amount: -6.99, balance: 21.67, type: "out" },
              ].map((entry, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontWeight: 500, marginRight: "12px", minWidth: "60px", display: "inline-block" }}>{entry.date}</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{entry.desc}</span>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "70px" }}>
                    {entry.amount !== null && <span style={{ fontSize: "11px", color: entry.type === "in" ? "rgba(100,200,120,0.7)" : "rgba(255,100,100,0.5)", fontWeight: 500, display: "block" }}>{entry.type === "in" ? "+" : ""}{entry.amount < 0 ? "-" : ""}${Math.abs(entry.amount).toFixed(2)}</span>}
                    <span style={{ fontSize: "14px", fontWeight: 700, color: entry.type === "start" ? "rgba(255,255,255,0.35)" : "#D4A853" }}>${entry.balance.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(212,168,83,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(212,168,83,0.6)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Current Balance</span>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#D4A853" }}>$21.67</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ================================================================
          MRC — What the $19 Tier Actually Gives You
          ================================================================ */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>Inside the Growth tier</p>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "10px" }}>
              The Muslim Reader's Companion
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "24px" }}>
              We take the best secular self-development books. Filter out the shirk. Keep the wisdom. Ground every lesson in Qur'an and Sunnah. You get a complete study guide each month.
            </p>
          </Reveal>

          <Reveal delay={60}>
            <div style={{
              padding: "24px 22px", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "20px",
            }}>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  { color: "#e74c3c", text: "Author's core ideas, distilled to 5th-grade clarity" },
                  { color: "#27ae60", text: "Every concept reframed through Qur'an and Sunnah" },
                  { color: "#D4A853", text: "Tafsir from Ibn Kathir, Al-Qurtubi, and others" },
                  { color: "#3498db", text: "Authenticated hadith tied to every lesson" },
                  { color: "#d4880a", text: "Where Islam diverges from the author — no sugarcoating" },
                  { color: "#9b59b6", text: "Challenge tiers and real assignments" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mrc-book-grid">
              {[
                { num: 1, title: "The Game of Life", live: true },
                { num: 2, title: "Atomic Habits", live: false },
                { num: 3, title: "The 7 Habits", live: false },
              ].map((book, i) => (
                <div key={i} style={{
                  padding: "16px 12px", textAlign: "center",
                  background: book.live ? "rgba(212,168,83,0.06)" : "rgba(255,255,255,0.015)",
                  border: book.live ? "1px solid rgba(212,168,83,0.3)" : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: "10px",
                }}>
                  <span style={{ fontSize: "9px", color: "rgba(212,168,83,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>Book {book.num}</span>
                  <p style={{ fontSize: "13px", color: book.live ? "#fff" : "rgba(255,255,255,0.35)", fontWeight: 600, marginTop: "6px", lineHeight: 1.3 }}>{book.title}</p>
                  <span style={{ display: "inline-block", marginTop: "8px", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: book.live ? "#D4A853" : "rgba(255,255,255,0.2)" }}>
                    {book.live ? "Available" : "Coming Soon"}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              12 books total. One new guide every month. All included with Growth.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ================================================================
          6. PRICING
          ================================================================ */}
      <section id="pricing" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>Choose your level</p>
              <h2 style={{ fontSize: "clamp(24px, 4.5vw, 38px)", fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>
                Worship basics <span style={{ color: "#D4A853" }}>will never be paywalled.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="tier-grid">
              <TierCard name="Foundation" price="Free" tagline="Daily Prophetic habit tracker. This is dawah." features={["Five daily prayer tracking", "Quran log + adhkar", "Streak counter", "Foundation / Growth / Elite tiers", "No ads. Ever."]} cta="Start Free" ctaHref="/walk" badge="Start here" />
              <TierCard name="Companion" price="$5" period="month" tagline="Walk with one brother. Accountability that changes behavior." features={["Everything in Foundation", "1-on-1 companion pairing", "See streaks, not details", "Private dashboard", "$40/year annually"]} cta="Walk With A Brother" ctaHref="#join" highlighted badge="Most impact" />
              <TierCard name="Growth" price="$19" period="month" tagline="Full system. Prophetic deep-dives + MRC book guides." features={["Everything in Companion", "Muslim Reader's Companion guides", "Weekly challenges", "Advanced analytics", "$149/year annually"]} cta="Get The Full System" ctaHref="#join" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
              Brothers, here is the blueprint. Take it freely.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ================================================================
          7. JOIN
          ================================================================ */}
      <section id="join" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "420px", margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 800, color: "#D4A853", lineHeight: 1.1, marginBottom: "12px" }}>Walk With Me.</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
              Free tracker. Free Blueprint. Get notified when Companion launches.
            </p>
          </Reveal>

          <Reveal delay={60}>
            <a href="/walk" className="cta-main" style={{ fontSize: "17px", padding: "18px 48px", width: "100%", display: "block", textAlign: "center", marginBottom: "14px" }}>
              Start Tracking — Free
            </a>
          </Reveal>

          <Reveal delay={100}>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginBottom: "16px" }}>or get notified when Companion launches:</p>
            {status === "done" ? (
              <div style={{ padding: "18px", background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.25)", borderRadius: "10px", color: "#D4A853", fontWeight: 600, fontSize: "14px" }}>You are in. Welcome to the walk.</div>
            ) : (
              <div className="email-row">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => { if (e.key === "Enter") send(); }} style={{ flex: 1, padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "14px", fontFamily: "'Outfit',sans-serif", outline: "none" }} />
                <button onClick={send} disabled={status === "sending"} style={{ padding: "14px 18px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontWeight: 700, fontSize: "13px", fontFamily: "'Outfit',sans-serif", cursor: status === "sending" ? "wait" : "pointer", whiteSpace: "nowrap" }}>{status === "sending" ? "..." : "Notify Me"}</button>
              </div>
            )}
          </Reveal>
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1 }}>
        <a href={IG} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(212,168,83,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>@nurhabits</a>
        <p style={{ marginTop: "12px", color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 300 }}>Built with ihsan from Cairo, Egypt.</p>
        <p style={{ marginTop: "4px", color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>&copy; 2026 NurHabits</p>
      </footer>
    </div>
  );
}
