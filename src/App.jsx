// src/App.jsx — Updated with "Walk" in the navigation
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Walk from "./Walk";

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
const STRIPE_LINK = "https://payhip.com/b/MxP42";
const FORMSPREE_ID = "https://formspree.io/f/xzdjrlqw";
const IG = "https://instagram.com/nurhabits";

/* ---------- Intersection observer fade ---------- */
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
      transform: vis ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ---------- Gold geometric divider ---------- */
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 0" }}>
      <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.4))" }} />
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" fill="none" stroke="rgba(212,168,83,0.4)" strokeWidth="1" />
      </svg>
      <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, rgba(212,168,83,0.4), transparent)" }} />
    </div>
  );
}

/* ---------- Floating particles ---------- */
function Particles() {
  const dots = useRef(
    Array.from({ length: 20 }, () => ({
      w: 1 + Math.random() * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: 8 + Math.random() * 12,
      del: Math.random() * 5,
      anim: Math.floor(Math.random() * 3),
    }))
  );
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

/* ---------- Book Card ---------- */
function Book({ num, title, status, featured }) {
  const locked = status === "locked";
  const live = status === "live";

  return (
    <div style={{
      background: featured
        ? "linear-gradient(160deg, rgba(212,168,83,0.10) 0%, rgba(26,26,46,0.98) 60%)"
        : locked ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.03)",
      border: featured ? "1.5px solid rgba(212,168,83,0.45)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px",
      padding: featured ? "40px 28px" : "28px 20px",
      textAlign: "center", position: "relative",
      transition: "transform 0.3s ease, border-color 0.3s ease",
      cursor: live ? "pointer" : "default",
      ...(featured && { boxShadow: "0 0 80px rgba(212,168,83,0.06)" }),
    }}
    onMouseEnter={e => { if (live) { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "rgba(212,168,83,0.7)"; }}}
    onMouseLeave={e => { if (live) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(212,168,83,0.45)"; }}}
    >
      {featured && (
        <span style={{
          position: "absolute", top: "14px", right: "14px",
          background: "#D4A853", color: "#1a1a2e",
          fontSize: "9px", fontWeight: 800, padding: "5px 12px",
          borderRadius: "20px", letterSpacing: "1.5px", textTransform: "uppercase",
        }}>Now</span>
      )}

      <div style={{
        fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase",
        color: locked ? "rgba(255,255,255,0.15)" : "rgba(212,168,83,0.55)", marginBottom: "14px",
      }}>
        {locked ? `Books ${num}` : `Book ${num}`}
      </div>

      {locked ? (
        <div style={{ color: "rgba(255,255,255,0.18)", fontSize: "13px", fontStyle: "italic" }}>Coming monthly</div>
      ) : (
        <>
          <div style={{
            fontSize: featured ? "20px" : "16px", fontWeight: 600,
            color: featured ? "#fff" : "rgba(255,255,255,0.6)",
            lineHeight: 1.35, marginBottom: "20px",
          }}>{title}</div>

          {live ? (
            <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-block",
              background: "linear-
