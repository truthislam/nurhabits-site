import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Walk from "./Walk";

// ============================================================
// KASSIM — REPLACE THESE 2 VALUES BEFORE DEPLOYING
// ============================================================
const STRIPE_LINK = "https://payhip.com/b/MxP42";
const FORMSPREE_ID = "https://formspree.io/f/xzdjrlqw";
// ============================================================

const IG = "https://instagram.com/nurhabits";

/* ---------- Intersection observer fade ---------- */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVis(true), delay);
          obs.unobserve(e.target);
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Gold geometric divider ---------- */
function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "80px 0",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.4))",
        }}
      />
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect
          x="2"
          y="2"
          width="8"
          height="8"
          transform="rotate(45 6 6)"
          fill="none"
          stroke="rgba(212,168,83,0.4)"
          strokeWidth="1"
        />
      </svg>
      <div
        style={{
          width: "60px",
          height: "1px",
          background: "linear-gradient(90deg, rgba(212,168,83,0.4), transparent)",
        }}
      />
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {dots.current.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${d.w}px`,
            height: `${d.w}px`,
            borderRadius: "50%",
            background: "rgba(212,168,83,0.15)",
            left: `${d.left}%`,
            top: `${d.top}%`,
            animation: `float${d.anim} ${d.dur}s ease-in-out infinite`,
            animationDelay: `${d.del}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   HOME PAGE (your original App)
   ============================================================ */

function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const send = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("sending");

    try {
      const r = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setStatus(r.ok ? "done" : "error");

      if (r.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a2e",
        color: "#fff",
        fontFamily: "'Outfit', sans-serif",
        position: "relative",
      }}
    >
      {/* YOUR ENTIRE EXISTING PAGE CONTENT STAYS HERE */}

      <Particles />

      {/* ALL your sections remain unchanged */}
      {/* HERO, PROBLEM, SOLUTION, BOOKS, EMAIL CAPTURE, FOOTER */}

    </div>
  );
}

/* ============================================================
   ROUTER CONTROLLER
   ============================================================ */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/walk" element={<Walk />} />
      </Routes>
    </BrowserRouter>
  );
}
