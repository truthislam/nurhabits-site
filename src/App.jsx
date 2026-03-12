import { useState, useEffect, useRef } from "react";

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

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

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
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {[
            { label: "Blog", href: "https://nurhabits.substack.com/", external: true },
            { label: "Books", href: "#journey" },
            { label: "Join", href: "#join" },
          ].map(link => (
            <a key={link.label} href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined} style={{
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
              fontSize: "13px", fontWeight: 500, letterSpacing: "0.5px", transition: "color 0.3s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#D4A853"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >{link.label}</a>
          ))}
        </div>
      </nav>

      {/* ===== HERO ===== */}
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
          fontSize: "clamp(15px, 2.5vw, 18px)", color: "rgba(255,255,255,0.45)",
          maxWidth: "440px", lineHeight: 1.7, marginTop: "20px", fontWeight: 300,
          animation: "fadeUp 0.8s ease 0.3s both",
        }}>
          One brother. Twelve books. No fluff. No courses. Just the walk.
        </p>

        <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
          className="cta-main" style={{ marginTop: "36px", animation: "fadeUp 0.8s ease 0.45s both" }}>
          Start With Book 1 — $19
        </a>

        <p style={{
          marginTop: "14px", fontSize: "12px", color: "rgba(255,255,255,0.25)",
          fontWeight: 400, animation: "fadeUp 0.8s ease 0.55s both",
        }}>
          The Game of Life and How to Play It — Muslim Reader's Companion
        </p>

        <div style={{
          position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          animation: "breathe 2.5s ease infinite",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="rgba(212,168,83,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </section>

      {/* ===== WHO I AM ===== */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px 0" }}>

          <Reveal>
            <p style={{
              fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px",
              textTransform: "uppercase", fontWeight: 700, marginBottom: "32px",
            }}>Who I Am</p>
          </Reveal>

          <Reveal delay={80}>
            <p className="story-line">I'm Kassim. Somali-American.</p>
          </Reveal>
          <Reveal delay={140}>
            <p className="story-line" style={{ marginTop: "20px" }}>
              I landed in Egypt on January 1, 2020 expecting to stay a few weeks.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              I didn't come seeking knowledge. Allah called me to it. The whole year before, my heart was yearning for Africa like something was pulling me toward my awakening. I discovered what it means to pray five times a day at the masjid. To stand in the first row. To make night prayers. To do things in private for the sake of Allah alone.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              I got my wife through those nightly prayers. A woman who pushes me to the masjid. Who values what Allah gave us as man and wife. My rock.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              I went back to the US three times. Every time I left, I lost what mattered most. My connection with Allah. Every time I came back with less money. $6,000. Then $2,000. Then $1,800. Leaving my deen to chase dollars. Then crawling back broke but alive again.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div style={{
              marginTop: "40px", padding: "28px 0 28px 28px",
              borderLeft: "3px solid rgba(212,168,83,0.35)",
            }}>
              <p style={{
                fontSize: "clamp(19px, 3vw, 24px)", fontWeight: 600,
                color: "rgba(255,255,255,0.85)", lineHeight: 1.6,
                fontFamily: "'Playfair Display', serif", fontStyle: "italic",
              }}>
                Then a brother my age died in a car crash. We are not promised tomorrow.
              </p>
              <p className="story-line" style={{ marginTop: "20px" }}>
                So I made istikhara with my wife and we committed. We are staying in Egypt. I had $0.14 to my name. I would rather perish here broke than crush my iman for mere human gain.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== WHY THIS EXISTS ===== */}
      <section style={{ position: "relative", zIndex: 1 }}>
        <Divider />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <p style={{
              fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px",
              textTransform: "uppercase", fontWeight: 700, marginBottom: "32px",
            }}>Why This Exists</p>
          </Reveal>

          <Reveal delay={80}>
            <p className="story-line">
              I watched a brother on YouTube promise to show Muslims how to make $100 a day. Seventeen minutes later I had nothing. No real steps. Just a course to buy.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p style={{
              fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 700, color: "#D4A853",
              lineHeight: 1.5, marginTop: "36px", fontFamily: "'Playfair Display', serif",
            }}>
              Where is the ihsan?
            </p>
            <p className="story-line" style={{ marginTop: "16px" }}>
              Where is the excellence our deen demands? Why does Alex Hormozi, a non-Muslim, give more substance in one video than brothers who open with bismillah?
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              That question keeps me up at night. That question is why NurHabits exists.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              Twelve books. Twelve months. The best self-development books on earth filtered through Qur'an and Sunnah. Not vague motivation. Real lessons. Crystal clear.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <p className="story-line" style={{ marginTop: "28px" }}>
              I'm not your teacher. I'm not your guru. I'm your brother doing this alongside you. From $0.14 to freedom. Full transparency. The rizq of Allah is vast. There is enough for us all. That is not hope. That is aqeedah.
            </p>
          </Reveal>

          <Reveal delay={480}>
            <div style={{
              marginTop: "48px", padding: "32px",
              background: "rgba(212,168,83,0.04)",
              border: "1px solid rgba(212,168,83,0.12)",
              borderRadius: "12px", textAlign: "center",
            }}>
              <p style={{
                fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 600,
                color: "#D4A853", lineHeight: 1.5,
                fontFamily: "'Playfair Display', serif", fontStyle: "italic",
              }}>
                No man is your enemy. No man is your friend. Every man is your teacher.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== THE JOURNEY / BOOKS ===== */}
      <section id="journey" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px" }}>

          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{
                fontSize: "11px", color: "rgba(212,168,83,0.5)", letterSpacing: "4px",
                textTransform: "uppercase", fontWeight: 700, marginBottom: "16px",
              }}>The Journey</p>
              <h2 style={{
                fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#fff", lineHeight: 1.1,
              }}>
                One Year. Twelve Books.<br/>
                <span style={{ color: "#D4A853" }}>One Deen.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "48px" }}>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} style={{
                  width: i === 0 ? "28px" : "12px", height: "4px", borderRadius: "2px",
                  background: i === 0 ? "#D4A853" : i < 3 ? "rgba(212,168,83,0.25)" : "rgba(255,255,255,0.06)",
                }} />
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

      {/* ===== EMAIL CAPTURE ===== */}
      <section id="join" style={{ position: "relative", zIndex: 1, scrollMarginTop: "70px" }}>
        <Divider />
        <div style={{ maxWidth: "460px", margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>

          <Reveal>
            <h2 style={{
              fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800, color: "#D4A853",
              lineHeight: 1.1, marginBottom: "16px",
            }}>Join The Walk</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", lineHeight: 1.6, marginBottom: "36px" }}>
              New book drops monthly. No spam. Just the next step.
            </p>
          </Reveal>

          <Reveal delay={150}>
            {status === "done" ? (
              <div style={{
                padding: "24px", background: "rgba(212,168,83,0.08)",
                border: "1px solid rgba(212,168,83,0.25)", borderRadius: "12px",
                color: "#D4A853", fontWeight: 600, fontSize: "16px",
              }}>You're in. Welcome to the walk.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={e => { if (e.key === "Enter") send(); }}
                  style={{
                    width: "100%", padding: "16px 20px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px", color: "#fff", fontSize: "16px",
                    fontFamily: "'Outfit',sans-serif", outline: "none", transition: "border-color 0.3s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(212,168,83,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <button onClick={send} disabled={status === "sending"} style={{
                  width: "100%", padding: "16px",
                  background: status === "sending" ? "rgba(212,168,83,0.4)" : "linear-gradient(135deg,#D4A853,#b8923d)",
                  color: "#1a1a2e", border: "none", borderRadius: "8px",
                  fontWeight: 700, fontSize: "15px", fontFamily: "'Outfit',sans-serif",
                  cursor: status === "sending" ? "wait" : "pointer", transition: "transform 0.2s",
                }}
                onMouseEnter={e => { if (status !== "sending") e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {status === "sending" ? "..." : "Join"}
                </button>
                {status === "error" && <p style={{ color: "#c0392b", fontSize: "13px" }}>Something went wrong. Try again.</p>}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        padding: "48px 24px", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1,
      }}>
        <a href={IG} target="_blank" rel="noopener noreferrer" style={{
          color: "rgba(212,168,83,0.6)", textDecoration: "none", fontSize: "14px",
          fontWeight: 500, transition: "color 0.3s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#D4A853"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(212,168,83,0.6)"}
        >@nurhabits</a>
        <p style={{ marginTop: "14px", color: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 300 }}>
          Built with ihsan from Cairo, Egypt.
        </p>
        <p style={{ marginTop: "6px", color: "rgba(255,255,255,0.1)", fontSize: "11px" }}>
          &copy; 2026 NurHabits
        </p>
      </footer>
    </div>
  );
}
