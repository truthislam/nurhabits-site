// src/App.jsx — Updated with "Walk" button + Profile icon
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
              background: "linear-gradient(135deg, #D4A853 0%, #b8923d 100%)",
              color: "#1a1a2e", padding: "14px 36px", borderRadius: "8px",
              fontWeight: 700, fontSize: "15px", textDecoration: "none", letterSpacing: "0.3px",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,168,83,0.35)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >Get It — $19</a>
          ) : (
            <span style={{
              display: "inline-block", border: "1px solid rgba(212,168,83,0.25)",
              color: "rgba(212,168,83,0.45)", padding: "10px 24px", borderRadius: "8px",
              fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
            }}>Coming Soon</span>
          )}
        </>
      )}
    </div>
  );
}

// Your existing homepage component
function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  // Check if someone is logged in on load
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
    <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#fff", fontFamily: "'Outfit', sans-serif", position: "relative" }}>

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

        .cta-main{
          display:inline-block;
          background:linear-gradient(135deg,#D4A853 0%,#b8923d 100%);
          color:#1a1a2e;padding:18px 44px;border-radius:8px;
          font-weight:700;font-size:17px;text-decoration:none;
          letter-spacing:0.3px;transition:all 0.3s ease;
          font-family:'Outfit',sans-serif;
        }
        .cta-main:hover{transform:scale(1.04);box-shadow:0 12px 48px rgba(212,168,83,0.3)}

        .story-line{
          font-size:clamp(17px,2.8vw,20px);
          color:rgba(255,255,255,0.7);
          line-height:1.75;
          margin-bottom:0;
          font-weight:400;
        }
      `}</style>

      <Particles />

      {/* ===== NAV ===== */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 28px",
        background: "rgba(26,26,46,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <span style={{
          fontSize: "14px", fontWeight: 700, color: "#D4A853", letterSpacing: "1px",
        }}>NURHABITS</span>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          
          {/* Main Links */}
          <a href="https://nurhabits.substack.com/" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>Blog</a>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/walk" style={{
              background: "linear-gradient(135deg, #D4A853 0%, #b8923d 100%)",
              color: "#1a1a2e", padding: "8px 16px", borderRadius: "6px",
              fontWeight: 700, fontSize: "12px", textDecoration: "none",
            }}>Walk</a>
            
            {/* PROFILE ICON - ONLY SHOWS IF LOGGED IN */}
            {isLogged && (
              <a href="/walk" style={{ 
                color: "#D4A853", fontSize: "18px", textDecoration: "none", 
                background: "rgba(212,168,83,0.1)", width: "32px", height: "32px", 
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
              }}>👤</a>
            )}
          </div>

          <a href="#journey" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>Books</a>
          <a href="#join" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>Join</a>
        </div>
      </nav>

      {/* ===== 1. HERO ===== */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px 40px", textAlign: "center", position: "relative", zIndex: 1,
      }}>
        <div style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ animation: "fadeUp 0.8s ease both", position: "relative" }}>
          <img src="/logo.png" alt="NurHabits" style={{ height: "220px", width: "auto", objectFit: "contain" }} />
        </div>

        <h1 style={{
          fontSize: "clamp(44px, 9vw, 80px)", fontWeight: 900,
          color: "#D4A853", marginTop: "8px", letterSpacing: "-2px", lineHeight: 1.05,
          animation: "fadeUp 0.8s ease 0.15s both",
        }}>
          Walk With Me.
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2.5vw, 18px)", color: "rgba(255,255,255,0.5)",
          maxWidth: "480px", lineHeight: 1.7, marginTop: "20px", fontWeight: 300,
          animation: "fadeUp 0.8s ease 0.3s both",
        }}>
          You read self-help books. You feel the power in them. But something in your gut tells you not everything lines up with your deen. You're right. It doesn't.
        </p>

        <a href="#the-problem" style={{
          marginTop: "36px", animation: "fadeUp 0.8s ease 0.45s both",
          fontSize: "15px", color: "#D4A853", textDecoration: "none",
          fontWeight: 600, letterSpacing: "0.3px",
          transition: "opacity 0.3s",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Keep reading ↓
        </a>

        <div style={{
          position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          animation: "breathe 2.5s ease infinite",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="rgba(212,168,83,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* ===== 2. THE PROBLEM ===== */}
      <section id="the-problem" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p className="story-line">
              You picked up Atomic Habits and it changed how you think. You read The 7 Habits and it made you sharper. You felt something shift. Then a quiet voice asked:
            </p>
          </Reveal>

          <Reveal delay={100}>
            <p style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "#D4A853",
              lineHeight: 1.4, marginTop: "32px", fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
            }}>
              "Is this even halal?"
            </p>
          </Reveal>

          <Reveal delay={200}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              You didn't stop reading. But the guilt crept in. The law of attraction is not tawakkul. Manifesting is not du'a. "The universe" is not Allah. And nobody was sorting it for you.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              You were left alone in a gap. The secular world gave you the tools. Your deen gave you the truth. But no one was bridging the two.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              The brothers online? Bismillah in the intro. A course to sell in the outro. Seventeen minutes of nothing in between.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <p style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "#D4A853",
              lineHeight: 1.4, marginTop: "40px", fontFamily: "'Playfair Display', serif",
            }}>
              Where is the ihsan?
            </p>
            <p className="story-line" style={{ marginTop: "12px" }}>
              Where is the excellence our deen demands? There is no bait here. No empty video. No upsell. The study guide is the work. You pay, you get it, you use it. That is ihsan.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== 3. THE SOLUTION ===== */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p style={{
              fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px",
              textTransform: "uppercase", fontWeight: 700, marginBottom: "32px",
            }}>This is why NurHabits exists</p>
          </Reveal>

          <Reveal delay={80}>
            <p className="story-line">
              Twelve months. Twelve of the best self-development books ever written. Every lesson filtered through Qur'an and Sunnah.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              The wisdom stays. The shirk goes. What is left is yours to keep with a clean heart.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              No courses. No gurus. No fluff. Just study guides written so clear a fifth grader could follow them. Every concept. Every ayah. Every hadith. Every place the author got it wrong, flagged in plain language so you never have to wonder again.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== 4. WHAT YOU GET ===== */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p style={{
              fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px",
              textTransform: "uppercase", fontWeight: 700, marginBottom: "32px",
            }}>What you walk away with</p>
          </Reveal>

          <Reveal delay={80}>
            <p style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff",
              lineHeight: 1.3, marginBottom: "12px",
            }}>Clarity.</p>
            <p className="story-line">
              You will know exactly what the author said, where Islam agrees, and where Islam corrects. No guessing. No guilt. No "is this even halal to think about?" That question dies here.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff",
              lineHeight: 1.3, marginTop: "40px", marginBottom: "12px",
            }}>Your perfect self-expression.</p>
            <p className="story-line">
              Allah created you for something no one else can do. Book 1 is built around finding it. A 4-week workshop with du'as, istikhara assignments, and honest questions most brothers never sit with. Not motivation. Excavation.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff",
              lineHeight: 1.3, marginTop: "40px", marginBottom: "12px",
            }}>Permission to be unequivocally you.</p>
            <p className="story-line">
              You don't have to choose between secular wisdom and your deen. You don't have to feel guilty for wanting to grow. You just needed someone to sort the gold from the poison. That is what this is.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <div style={{
              marginTop: "48px", padding: "28px 24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "12px",
            }}>
              <p style={{
                fontSize: "12px", color: "rgba(212,168,83,0.5)", letterSpacing: "2px",
                textTransform: "uppercase", fontWeight: 700, marginBottom: "20px",
              }}>Inside every guide</p>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  { color: "#e74c3c", text: "Author's core ideas, distilled" },
                  { color: "#27ae60", text: "Every concept reframed through Qur'an and Sunnah" },
                  { color: "#D4A853", text: "Qur'anic ayat with tafsir from Ibn Kathir, Al-Qurtubi, and others" },
                  { color: "#3498db", text: "Hadith and Prophetic examples" },
                  { color: "#d4880a", text: "Where Islam diverges. No sugarcoating." },
                  { color: "#9b59b6", text: "Challenge tiers and real assignments" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div style={{
              marginTop: "48px", padding: "36px 28px",
              background: "linear-gradient(160deg, rgba(212,168,83,0.06) 0%, rgba(26,26,46,0.98) 60%)",
              border: "1.5px solid rgba(212,168,83,0.3)",
              borderRadius: "16px",
            }}>
              <p style={{
                fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 800, color: "#fff",
                lineHeight: 1.3, textAlign: "center", marginBottom: "8px",
              }}>Read any self-help book with a clean heart.</p>
              <p style={{
                fontSize: "14px", color: "rgba(255,255,255,0.4)", textAlign: "center",
                lineHeight: 1.6, marginBottom: "36px", maxWidth: "440px", margin: "0 auto 36px",
              }}>
                Know exactly what aligns with your deen. Know exactly what doesn't. No guilt. No guessing. No compromise.
              </p>

              <p style={{
                fontSize: "12px", color: "rgba(212,168,83,0.5)", letterSpacing: "2px",
                textTransform: "uppercase", fontWeight: 700, marginBottom: "20px",
              }}>The work is already done for you</p>
              <div style={{ display: "grid", gap: "14px" }}>
                {[
                  "You do not need to read the original book first",
                  "You do not need to cross-reference scholars yourself",
                  "You do not need to check hadith authenticity",
                  "You do not need to figure out what is shirk and what is wisdom",
                  "It is sorted. You open it and start.",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <span style={{ color: "#D4A853", fontSize: "16px", lineHeight: 1.6, flexShrink: 0 }}>&#10003;</span>
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, fontWeight: 400 }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "32px", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "12px", color: "rgba(212,168,83,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: "20px" }}>What is inside Book 1</p>
                <div style={{ display: "grid", gap: "12px" }}>
                  {[
                    "5 full chapters reframed through Qur'an and Sunnah",
                    "Tafsir from Ibn Kathir, Al-Qurtubi, and Ibn Taymiyyah",
                    "Authenticated hadith tied to every core lesson",
                    "Every theological problem flagged and corrected in plain language",
                    "A 4-week guided workshop to find your perfect self-expression",
                    "Du'as written out for you. Istikhara assignments. Weekly trackers.",
                    "Written at a 5th grade reading level so nothing is vague",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ color: "#D4A853", fontSize: "14px", lineHeight: 1.6, flexShrink: 0 }}>&#10003;</span>
                      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, fontWeight: 400 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "28px", padding: "20px 24px", background: "rgba(212,168,83,0.04)", border: "1px solid rgba(212,168,83,0.12)", borderRadius: "10px", textAlign: "center" }}>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Instant download. You can start reading before your next salah.</p>
              </div>

              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer" className="cta-main" style={{ fontSize: "18px", padding: "20px 52px" }}>Get Book 1 — $19</a>
                <p style={{ marginTop: "10px", fontSize: "12px", color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>The Game of Life and How to Play It — Muslim Reader's Companion</p>
              </div>

              <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "rgba(212,168,83,0.45)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>Full money-back guarantee</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 400, maxWidth: "440px", margin: "0 auto" }}>
                  If this guide does not change how you read secular books as a Muslim, email me. Full refund. No questions. No hard feelings. I would rather return your money than take a single dollar without delivering value. That is my covenant with you and with Allah.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 5. WHO IS BEHIND THIS ===== */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "32px" }}>Your brother on the walk</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="story-line">I'm Kassim. Somali-American. I landed in Egypt January 1, 2020.</p>
          </Reveal>
          <Reveal delay={160}>
            <p className="story-line" style={{ marginTop: "24px" }}>I left three times. Spent most of the year chasing dollars in the US. Came back with $6,000. Then $2,000. Then $1,800. Less money every time. Further from Allah every time.</p>
          </Reveal>
          <Reveal delay={240}>
            <p className="story-line" style={{ marginTop: "24px" }}>Then Allah called me back. I discovered what it means to pray five times a day at the masjid. To stand in the first row. To do things in private for the sake of Allah alone.</p>
          </Reveal>
          <Reveal delay={320}>
            <div style={{ marginTop: "36px", padding: "28px 0 28px 28px", borderLeft: "3px solid rgba(212,168,83,0.35)" }}>
              <p style={{ fontSize: "clamp(19px, 3vw, 24px)", fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                Then a brother my age died in a car crash. We are not promised tomorrow.
              </p>
              <p className="story-line" style={{ marginTop: "20px" }}>
                So I made istikhara with my wife and we committed. We are staying in Egypt. I had $0.14 to my name. I would rather perish here broke than crush my iman for mere human gain.
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <p className="story-line" style={{ marginTop: "32px" }}>I'm not your teacher. I'm not your guru. I'm the brother who felt the same gap you feel and decided to do something about it. I read these books. I filter them through Qur'an and Sunnah. I hand you what is left. That is it.</p>
          </Reveal>
        </div>
      </section>

      {/* ===== 6. THE WALK — PUBLIC LEDGER ===== */}
      <section id="walk" style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>The Walk</p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "12px" }}>$0.14 and a hijrah.</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", lineHeight: 1.6, marginBottom: "40px", maxWidth: "520px" }}>This is my real bank account. Every dollar in and every dollar out. No hiding. We grow together or not at all.</p>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "28px 24px", fontFamily: "'Outfit', monospace" }}>
              {[
                { date: "Feb 2026", desc: "Starting balance", amount: null, balance: 0.14, type: "start" },
                { date: "Mar 2026", desc: "Etsy shop sales", amount: 32.51, balance: 32.65, type: "in" },
                { date: "Mar 2026", desc: "Google One (business)", amount: -3.99, balance: 28.66, type: "out" },
                { date: "Mar 2026", desc: "Namecheap domain", amount: -6.99, balance: 21.67, type: "out" },
              ].map((entry, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 500, marginRight: "16px", minWidth: "70px", display: "inline-block" }}>{entry.date}</span>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{entry.desc}</span>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    {entry.amount !== null && <span style={{ fontSize: "12px", color: entry.type === "in" ? "rgba(100,200,120,0.7)" : "rgba(255,100,100,0.5)", fontWeight: 500, display: "block" }}>{entry.type === "in" ? "+" : ""}{entry.amount < 0 ? "-" : ""}${Math.abs(entry.amount).toFixed(2)}</span>}
                    <span style={{ fontSize: "15px", fontWeight: 700, color: entry.type === "start" ? "rgba(255,255,255,0.4)" : "#D4A853" }}>${entry.balance.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(212,168,83,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "rgba(212,168,83,0.6)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Current Balance</span>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#D4A853" }}>$21.67</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 7. THE JOURNEY / BOOKS ===== */}
      <section id="journey" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, marginBottom: "16px" }}>The Journey</p>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>One Year. Twelve Books.<br/><span style={{ color: "#D4A853" }}>One Deen.</span></h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "48px" }}>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} style={{ width: i === 0 ? "28px" : "12px", height: "4px", borderRadius: "2px", background: i === 0 ? "#D4A853" : i < 3 ? "rgba(212,168,83,0.25)" : "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={180}>
            <Book num={1} title="The Game of Life and How to Play It" status="live" featured />
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginTop: "14px" }}>
            <Reveal delay={260}><Book num={2} title="Atomic Habits" status="soon" /></Reveal>
            <Reveal delay={340}><Book num={3} title="The 7 Habits of Highly Effective People" status="soon" /></Reveal>
          </div>
          <Reveal delay={420}>
            <div style={{ marginTop: "14px" }}>
              <Book num="4 – 12" status="locked" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 8. EMAIL CAPTURE ===== */}
      <section id="join" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "460px", margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800, color: "#D4A853", lineHeight: 1.1, marginBottom: "16px" }}>Join The Walk</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", lineHeight: 1.6, marginBottom: "36px" }}>A new book drops every month. Get it in your inbox the day it goes live. No spam. No courses. Just the next step.</p>
          </Reveal>

          <Reveal delay={150}>
            {status === "done" ? (
              <div style={{ padding: "24px", background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.25)", borderRadius: "12px", color: "#D4A853", fontWeight: 600, fontSize: "16px" }}>You're in. Welcome to the walk.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e => { if (e.key === "Enter") send(); }} style={{ width: "100%", padding: "16px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "16px", fontFamily: "'Outfit',sans-serif", outline: "none" }} />
                <button onClick={send} disabled={status === "sending"} style={{ width: "100%", padding: "16px", background: status === "sending" ? "rgba(212,168,83,0.4)" : "linear-gradient(135deg,#D4A853,#b8923d)", color: "#1a1a2e", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "15px", fontFamily: "'Outfit',sans-serif", cursor: status === "sending" ? "wait" : "pointer" }}>{status === "sending" ? "..." : "Join"}</button>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: "48px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1 }}>
        <a href={IG} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(212,168,83,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>@nurhabits</a>
        <p style={{ marginTop: "14px", color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 300 }}>Built with ihsan from Cairo, Egypt.</p>
        <p style={{ marginTop: "6px", color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>&copy; 2026 NurHabits</p>
      </footer>
    </div>
  );
}

// MAIN APP WITH ROUTING
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
