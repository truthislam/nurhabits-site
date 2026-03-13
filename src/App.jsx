import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Walk from "./Walk";

/* ============================================================
CONFIG
============================================================ */

const STRIPE_LINK = "https://payhip.com/b/MxP42";
const FORMSPREE_ID = "https://formspree.io/f/xzdjrlqw";
const IG = "https://instagram.com/nurhabits";

/* ============================================================
FADE REVEAL
============================================================ */

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
DIVIDER
============================================================ */

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
          background:
            "linear-gradient(90deg, transparent, rgba(212,168,83,0.4))",
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
          background:
            "linear-gradient(90deg, rgba(212,168,83,0.4), transparent)",
        }}
      />
    </div>
  );
}

/* ============================================================
PARTICLES
============================================================ */

function Particles() {
  const dots = useRef(
    Array.from({ length: 20 }, () => ({
      size: 1 + Math.random() * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
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
            width: `${d.size}px`,
            height: `${d.size}px`,
            borderRadius: "50%",
            background: "rgba(212,168,83,0.15)",
            left: `${d.left}%`,
            top: `${d.top}%`,
            animation: `float ${d.duration}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
HOME PAGE
============================================================ */

function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const send = async () => {
    if (!email.includes("@")) return;

    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
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
      <Particles />

      <div style={{ padding: "120px 24px", textAlign: "center" }}>
        <Reveal>
          <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
            NurHabits
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p style={{ opacity: 0.8 }}>
            Small daily habits. Long-term barakah.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div style={{ marginTop: "32px" }}>
            <input
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                marginRight: "10px",
              }}
            />

            <button
              onClick={send}
              style={{
                padding: "12px 18px",
                background: "#d4a853",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Join
            </button>
          </div>
        </Reveal>

        {status === "done" && <p style={{ marginTop: 16 }}>You're in.</p>}
      </div>

      <Divider />

      <div style={{ textAlign: "center", paddingBottom: "80px" }}>
        <a
          href={STRIPE_LINK}
          style={{ color: "#d4a853", textDecoration: "none" }}
        >
          Support the project
        </a>
      </div>
    </div>
  );
}

/* ============================================================
ROUTER
============================================================ */

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/walk" element={<Walk />} />
      </Routes>
    </Router>
  );
}
