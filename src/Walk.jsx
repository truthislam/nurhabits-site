// src/Walk.jsx — v5: Production-grade ihsan dashboard
// Auto-login, retroactive editing, companion discovery (Brother/Spouse/Sister/Parent-Child), confirm password, visual overhaul
import { useState, useEffect, useCallback, useRef } from "react";

const SUPA = "https://opqddbhxbagayyfossua.supabase.co";
const KEY = "sb_publishable_fNgabOqHwpHckwa29rq2Xg_AxGLbN-G";

async function sb(path, method, body) {
  const m = method || "GET";
  const h = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
  if (m === "POST" || m === "PATCH") h["Prefer"] = "return=representation";
  const opts = { method: m, headers: h };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(SUPA + "/rest/v1/" + path, opts);
  if (!res.ok) throw new Error(await res.text());
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

const PRAYERS = [
  { id: "fajr", label: "Fajr", time: "dawn", icon: "🌅" },
  { id: "dhuhr", label: "Dhuhr", time: "midday", icon: "☀️" },
  { id: "asr", label: "Asr", time: "afternoon", icon: "🌤" },
  { id: "maghrib", label: "Maghrib", time: "sunset", icon: "🌇" },
  { id: "isha", label: "Isha", time: "night", icon: "🌙" },
];
const QO = [
  { value: "1_page", label: "1 page", pts: 1 },
  { value: "half_juz", label: "½ juz", pts: 3 },
  { value: "1_juz", label: "1 juz", pts: 5 },
  { value: "more", label: "1+ juz", pts: 7 },
];

const COMPANION_TYPES = [
  { id: "brother", label: "Brother", icon: "👤", desc: "A fellow Muslim brother" },
  { id: "spouse", label: "Spouse", icon: "💍", desc: "Husband or wife" },
  { id: "sister", label: "Sister", icon: "👤", desc: "A fellow Muslim sister" },
  { id: "parent_child", label: "Parent & Child", icon: "👨‍👧", desc: "Parent walking with their child" },
];

const tk = () => new Date().toISOString().split("T")[0];
const isFriday = () => new Date().getDay() === 5;
function hijri() { try { return new Intl.DateTimeFormat("en-US-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch { return ""; } }
function dayLbl(d) { return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]; }
function last7() { const a = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); a.push(d); } return a; }
function dateKey(d) { return d.toISOString().split("T")[0]; }
function dateFromKey(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function formatDateLabel(k) {
  const d = dateFromKey(k), today = tk();
  if (k === today) return "Today";
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (k === dateKey(y)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function getNavigableDates() {
  const dates = [];
  for (let i = 0; i <= 3; i++) { const d = new Date(); d.setDate(d.getDate() - i); dates.push(dateKey(d)); }
  return dates;
}

function sc(d) {
  if (!d) return { pct: 0, s: 0, mc: 0 };
  let s = 0;
  PRAYERS.forEach(p => { if (d[p.id] === "prayed") s += 2; if (d[p.id] === "masjid") s += 4; });
  if (d.adhkar_sabah) s += 2; if (d.adhkar_masa) s += 2;
  const q = QO.find(o => o.value === d.quran); if (q) s += Math.min(q.pts, 5);
  if (d.sunnah_rawatib) s += 3;
  return { pct: Math.round((s / 32) * 100), s, mc: PRAYERS.filter(p => d[p.id] === "masjid").length };
}

function lv(d) {
  if (!d) return { l: 0, n: "Starting" };
  const mc = PRAYERS.filter(p => d[p.id] === "masjid").length, q = d.quran || "", sn = !!d.sunnah_rawatib;
  const ap = PRAYERS.every(p => d[p.id] === "prayed" || d[p.id] === "masjid"), aS = !!d.adhkar_sabah, aM = !!d.adhkar_masa;
  if (mc >= 5 && (q === "1_juz" || q === "more") && sn && aS && aM) return { l: 3, n: "Elite" };
  if (mc >= 3 && ["half_juz", "1_juz", "more"].includes(q) && sn && aS && aM) return { l: 2, n: "Growth" };
  if (ap && mc >= 1 && aS && q) return { l: 1, n: "Foundation" };
  return { l: 0, n: "Starting" };
}

function e2d(e) { return e ? { fajr: e.fajr, dhuhr: e.dhuhr, asr: e.asr, maghrib: e.maghrib, isha: e.isha, adhkar_sabah: e.adhkar_sabah, adhkar_masa: e.adhkar_masa, quran: e.quran, sunnah_rawatib: e.sunnah_rawatib } : null; }
function stk(entries) { let s = 0; if (!entries) return 0; for (const e of entries) { if (lv(e2d(e)).l >= 1) s++; else break; } return s; }

function companionLabel(type) {
  const found = COMPANION_TYPES.find(c => c.id === type);
  return found ? found.label : "Companion";
}

const C = {
  bg: "#0a0a16", bg2: "#1a1a2e", gold: "#D4A853", goldMid: "rgba(212,168,83,0.35)", goldDim: "rgba(212,168,83,0.10)",
  green: "#34D399", greenDim: "rgba(52,211,153,0.08)", greenBdr: "rgba(52,211,153,0.2)",
  teal: "#4ECDC4", purple: "#A78BFA", text: "#e2e2e8", sub: "#9a9ab0", dim: "#6b6b85", muted: "#3a3a52",
  card: "rgba(255,255,255,0.02)", bdr: "rgba(255,255,255,0.06)",
};
const LC = {
  0: { bg: "rgba(255,255,255,0.04)", t: C.muted, b: C.bdr },
  1: { bg: C.goldDim, t: C.gold, b: "rgba(212,168,83,0.25)" },
  2: { bg: "rgba(78,205,196,0.07)", t: C.teal, b: "rgba(78,205,196,0.25)" },
  3: { bg: "rgba(167,139,250,0.07)", t: C.purple, b: "rgba(167,139,250,0.25)" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.bg};overflow-x:hidden}
::selection{background:rgba(212,168,83,0.2);color:#fff}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes float1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-12px) translateX(8px)}}
@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px) translateX(-6px)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes progressPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,168,83,0.15)}50%{box-shadow:0 0 24px 6px rgba(212,168,83,0.08)}}
@keyframes breathe{0%,100%{opacity:0.3}50%{opacity:0.7}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 30px rgba(52,211,153,0.05),0 0 60px rgba(52,211,153,0.02)}50%{box-shadow:0 0 40px rgba(52,211,153,0.1),0 0 80px rgba(52,211,153,0.04)}}
@keyframes celebrateIn{from{opacity:0;transform:scale(0.8) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes tapPop{0%{transform:scale(1)}50%{transform:scale(0.94)}100%{transform:scale(1)}}
@keyframes streakGlow{0%,100%{text-shadow:0 0 20px rgba(212,168,83,0.1)}50%{text-shadow:0 0 30px rgba(212,168,83,0.25)}}

.wi{width:100%;padding:16px 20px;border-radius:14px;border:1.5px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);color:#fff;font-size:15px;font-family:'Outfit',sans-serif;outline:none;transition:border-color 0.3s,box-shadow 0.3s,background 0.3s}
.wi:focus{border-color:rgba(212,168,83,0.4);box-shadow:0 0 0 4px rgba(212,168,83,0.06),0 4px 20px rgba(0,0,0,0.2);background:rgba(255,255,255,0.05)}
.wi::placeholder{color:rgba(255,255,255,0.18)}

.btn-gold{width:100%;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,#D4A853 0%,#c49a3d 50%,#b8923d 100%);color:#0a0a16;font-size:16px;font-weight:700;letter-spacing:0.3px;font-family:'Outfit',sans-serif;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden;box-shadow:0 4px 20px rgba(212,168,83,0.2),inset 0 1px 0 rgba(255,255,255,0.2)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(212,168,83,0.3),inset 0 1px 0 rgba(255,255,255,0.2)}
.btn-gold:active{transform:scale(0.97);box-shadow:0 2px 12px rgba(212,168,83,0.2)}
.btn-gold:disabled{opacity:0.5;cursor:wait;transform:none;box-shadow:none}

.btn-ghost{width:100%;padding:14px;border-radius:14px;border:1.5px solid rgba(255,255,255,0.06);background:transparent;color:rgba(255,255,255,0.35);font-size:14px;font-weight:500;font-family:'Outfit',sans-serif;cursor:pointer;transition:all 0.25s}
.btn-ghost:hover{border-color:rgba(212,168,83,0.25);color:rgba(212,168,83,0.6);background:rgba(212,168,83,0.03)}

.btn-outline{width:100%;padding:14px;border-radius:14px;border:1.5px solid rgba(212,168,83,0.2);background:rgba(212,168,83,0.04);color:${C.gold};font-size:14px;font-weight:600;font-family:'Outfit',sans-serif;cursor:pointer;transition:all 0.25s}
.btn-outline:hover{background:rgba(212,168,83,0.08);border-color:rgba(212,168,83,0.35)}
.btn-outline:active{transform:scale(0.97)}

.auth-wrap{min-height:100vh;display:flex;font-family:'Outfit',sans-serif;color:${C.text};position:relative;overflow:hidden}
.auth-left{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;position:relative;z-index:1}
.auth-right{width:420px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);backdrop-filter:blur(24px);border-left:1px solid rgba(255,255,255,0.04);padding:48px 40px;position:relative;z-index:1}
@media(max-width:860px){.auth-wrap{flex-direction:column}.auth-left{min-height:auto;padding:60px 24px 40px}.auth-right{width:100%;padding:32px 24px 48px;border-left:none;border-top:1px solid rgba(255,255,255,0.04)}}
@media(max-width:480px){.auth-left{padding:48px 20px 32px}.auth-right{padding:28px 20px 40px}.wi{padding:14px 16px;font-size:14px}.btn-gold{padding:14px;font-size:15px}}

.dash-wrap{min-height:100vh;max-width:500px;margin:0 auto;font-family:'Outfit',sans-serif;color:${C.text};position:relative;overflow:hidden}

.glass-card{background:rgba(255,255,255,0.025);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06);border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.15),0 1px 0 rgba(255,255,255,0.03) inset}
.glass-card-glow{background:linear-gradient(135deg,rgba(212,168,83,0.04) 0%,rgba(255,255,255,0.02) 50%,rgba(78,205,196,0.03) 100%);backdrop-filter:blur(16px);border:1px solid rgba(212,168,83,0.08);border-radius:20px;box-shadow:0 4px 30px rgba(0,0,0,0.2),0 1px 0 rgba(212,168,83,0.05) inset}

.p-btn{border:1.5px solid rgba(255,255,255,0.05);cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px 18px;border-radius:16px;background:rgba(255,255,255,0.02);backdrop-filter:blur(8px);margin-bottom:8px;transition:all 0.25s;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.p-btn:active{animation:tapPop 0.2s ease}
.p-btn-masjid{border-color:rgba(52,211,153,0.2) !important;background:linear-gradient(135deg,rgba(52,211,153,0.08) 0%,rgba(52,211,153,0.03) 100%) !important;box-shadow:0 2px 12px rgba(52,211,153,0.06),0 0 0 1px rgba(52,211,153,0.05) inset !important}
.p-btn-prayed{border-color:rgba(212,168,83,0.18) !important;background:linear-gradient(135deg,rgba(212,168,83,0.08) 0%,rgba(212,168,83,0.03) 100%) !important;box-shadow:0 2px 12px rgba(212,168,83,0.06),0 0 0 1px rgba(212,168,83,0.05) inset !important}

.c-btn{border:1.5px solid rgba(255,255,255,0.05);cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:12px;width:100%;padding:15px 18px;border-radius:16px;background:rgba(255,255,255,0.02);backdrop-filter:blur(8px);margin-bottom:8px;transition:all 0.25s;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.c-btn:active{animation:tapPop 0.2s ease}
.c-btn-on{border-color:rgba(52,211,153,0.2) !important;background:linear-gradient(135deg,rgba(52,211,153,0.07) 0%,rgba(52,211,153,0.02) 100%) !important;box-shadow:0 2px 12px rgba(52,211,153,0.06) !important}

.date-nav-btn{border:1px solid rgba(255,255,255,0.05);cursor:pointer;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.03);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;color:${C.dim};font-size:18px;font-family:'Outfit',sans-serif;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
.date-nav-btn:hover{background:rgba(212,168,83,0.08);color:${C.gold};border-color:rgba(212,168,83,0.15)}
.date-nav-btn:active{transform:scale(0.92)}
.date-nav-btn:disabled{opacity:0.15;cursor:default;transform:none}

.settings-menu{position:absolute;top:60px;right:20px;width:230px;background:rgba(12,12,28,0.92);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:6px;z-index:50;animation:slideDown 0.2s ease;box-shadow:0 12px 48px rgba(0,0,0,0.4)}
.settings-item{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border-radius:12px;border:none;background:transparent;color:${C.sub};font-size:13px;font-weight:500;font-family:'Outfit',sans-serif;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent;text-align:left}
.settings-item:hover{background:rgba(255,255,255,0.04);color:#fff}

.score-hero{position:relative;overflow:hidden;padding:30px 28px 26px}
.score-hero-100{animation:glowPulse 3s ease infinite}
`;

function Particles() {
  const dots = useRef(Array.from({ length: 22 }, () => ({
    w: 1 + Math.random() * 3,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: 10 + Math.random() * 16,
    del: Math.random() * 8,
    a: Math.floor(Math.random() * 3),
    o: 0.06 + Math.random() * 0.1,
  })));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {dots.current.map((p, i) => (
        <div key={i} style={{
          position: "absolute", width: p.w, height: p.w, borderRadius: "50%",
          background: `rgba(212,168,83,${p.o})`,
          left: `${p.left}%`, top: `${p.top}%`,
          animation: `float${p.a} ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.del}s`,
        }} />
      ))}
    </div>
  );
}

function PrayerRow({ prayer, value, onCycle, jumu }) {
  const label = jumu && prayer.id === "dhuhr" ? "Jumu'ah" : prayer.label;
  const m = value === "masjid", p = value === "prayed";
  const cls = `p-btn ${m ? "p-btn-masjid" : p ? "p-btn-prayed" : ""}`;
  return (
    <button onClick={onCycle} className={cls}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13,
          background: m ? "rgba(52,211,153,0.12)" : p ? "rgba(212,168,83,0.12)" : "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          border: `1.5px solid ${m ? "rgba(52,211,153,0.2)" : p ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.04)"}`,
          transition: "all 0.25s",
          boxShadow: m ? "0 0 12px rgba(52,211,153,0.08)" : p ? "0 0 12px rgba(212,168,83,0.06)" : "none",
        }}>
          {m ? "🕌" : p ? <span style={{ color: C.gold, fontWeight: 800, fontSize: 16 }}>✓</span> : prayer.icon}
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: m ? C.green : p ? C.gold : C.text, transition: "color 0.2s" }}>{label}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{prayer.time}</div>
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
        color: m ? C.green : p ? C.gold : C.muted,
        padding: "6px 14px", borderRadius: 8,
        background: m ? "rgba(52,211,153,0.1)" : p ? "rgba(212,168,83,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${m ? "rgba(52,211,153,0.15)" : p ? "rgba(212,168,83,0.1)" : "transparent"}`,
        transition: "all 0.2s",
      }}>{m ? (jumu && prayer.id === "dhuhr" ? "Jumu'ah" : "Masjid") : p ? "Prayed" : "—"}</span>
    </button>
  );
}

function CheckRow({ label, icon, checked, onToggle }) {
  return (
    <button onClick={onToggle} className={`c-btn ${checked ? "c-btn-on" : ""}`}>
      <div style={{
        width: 24, height: 24, borderRadius: 8,
        border: `2px solid ${checked ? C.green : "rgba(255,255,255,0.1)"}`,
        background: checked ? `linear-gradient(135deg, ${C.green}, #2bb87a)` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        transition: "all 0.2s",
        boxShadow: checked ? "0 0 8px rgba(52,211,153,0.15)" : "none",
      }}>{checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>✓</span>}</div>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: checked ? C.green : C.text, transition: "color 0.2s" }}>{label}</span>
    </button>
  );
}

function Badge({ l, n }) {
  const c = LC[l] || LC[0];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 20,
      background: c.bg, border: `1.5px solid ${c.b}`,
      backdropFilter: "blur(8px)",
    }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: c.t }}>L{l}</span>
      <span style={{ fontSize: 10, color: c.t, fontWeight: 600 }}>{n}</span>
    </div>
  );
}

export default function Walk() {
  const [scr, setScr] = useState("loading");
  const [un, setUn] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [aMode, setAMode] = useState("login");
  const [aErr, setAErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [uid, setUid] = useState("");
  const [user, setUser] = useState("");
  const [td, setTd] = useState({});
  const [teid, setTeid] = useState(null);
  const [wk, setWk] = useState({});
  const [streak, setStreak] = useState(0);
  const [partner, setPartner] = useState("");
  const [partnerLabel, setPartnerLabel] = useState("Companion");
  const [pPct, setPPct] = useState(0);
  const [pStr, setPStr] = useState(0);
  const [pLv, setPLv] = useState(0);
  const [pIn, setPIn] = useState(false);
  const [pInput, setPInput] = useState("");
  const [pErr, setPErr] = useState("");
  const [settings, setSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState(tk());
  const [pairStep, setPairStep] = useState("intro");
  const [companionType, setCompanionType] = useState("brother");
  const settingsRef = useRef(null);

  const today = tk();
  const isFri = isFriday();
  const hd = hijri();
  const isToday = selectedDate === today;
  const navigableDates = getNavigableDates();

  const currentData = isToday ? td : (wk[selectedDate] ? e2d(wk[selectedDate]) : {});
  const score = sc(currentData);
  const level = lv(currentData);

  useEffect(() => {
    function handleClick(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettings(false);
    }
    if (settings) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settings]);

  const load = useCallback(async (id) => {
    try {
      const start = new Date(); start.setDate(start.getDate() - 7);
      const sd = start.toISOString().split("T")[0];
      const ents = await sb(`daily_entries?user_id=eq.${id}&date=gte.${sd}&order=date.desc`) || [];
      const w = {}; let te = null;
      ents.forEach(e => { w[e.date] = e; if (e.date === today) te = e; });
      setWk(w);
      if (te) { setTd(e2d(te)); setTeid(te.id); } else { setTd({}); setTeid(null); }
      const all = await sb(`daily_entries?user_id=eq.${id}&order=date.desc&limit=60`) || [];
      setStreak(stk(all));
      const ps = await sb(`partnerships?or=(user_a.eq.${id},user_b.eq.${id})`) || [];
      if (ps.length > 0) {
        const pid = ps[0].user_a === id ? ps[0].user_b : ps[0].user_a;
        if (ps[0].companion_type) setPartnerLabel(companionLabel(ps[0].companion_type));
        const pp = await sb(`profiles?id=eq.${pid}`) || [];
        if (pp.length > 0) {
          setPartner(pp[0].username);
          const pe = await sb(`daily_entries?user_id=eq.${pid}&date=eq.${today}`) || [];
          if (pe.length > 0) { const pd = e2d(pe[0]); setPPct(sc(pd).pct); setPLv(lv(pd).l); setPIn(true); }
          else { setPIn(false); setPPct(0); setPLv(0); }
          const pa = await sb(`daily_entries?user_id=eq.${pid}&order=date.desc&limit=30`) || [];
          setPStr(stk(pa));
        }
      }
    } catch (err) { console.error(err); }
  }, [today]);

  // Auto-login
  useEffect(() => {
    async function autoLogin() {
      const stored = localStorage.getItem("nurUser");
      if (!stored) { setScr("auth"); return; }
      try {
        const pr = await sb(`profiles?username=eq.${stored.toLowerCase()}`) || [];
        if (pr.length === 0) { localStorage.removeItem("nurUser"); setScr("auth"); return; }
        setUid(pr[0].id); setUser(pr[0].username);
        await load(pr[0].id);
        setScr("dashboard");
      } catch (err) {
        console.error("Auto-login failed:", err);
        localStorage.removeItem("nurUser"); setScr("auth");
      }
    }
    autoLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function auth() {
    if (!un.trim() || !pw.trim()) { setAErr("Fill in both fields."); return; }
    if (aMode === "signup" && pw !== pwConfirm) { setAErr("Passwords don't match."); return; }
    if (aMode === "signup" && pw.length < 4) { setAErr("Password must be at least 4 characters."); return; }
    setBusy(true); setAErr("");
    const u = un.trim().toLowerCase();
    try {
      if (aMode === "signup") {
        const ex = await sb(`profiles?username=eq.${u}`) || [];
        if (ex.length > 0) { setAErr("Username taken."); setBusy(false); return; }
        const cr = await sb("profiles", "POST", { username: u, password_hash: pw });
        if (cr && cr.length > 0) { setUid(cr[0].id); setUser(u); setScr("pair"); localStorage.setItem("nurUser", u); }
      } else {
        const pr = await sb(`profiles?username=eq.${u}`) || [];
        if (pr.length === 0) { setAErr("No account found."); setBusy(false); return; }
        if (pr[0].password_hash !== pw) { setAErr("Wrong password."); setBusy(false); return; }
        setUid(pr[0].id); setUser(u); localStorage.setItem("nurUser", u);
        const ps = await sb(`partnerships?or=(user_a.eq.${pr[0].id},user_b.eq.${pr[0].id})`) || [];
        if (ps.length > 0) { await load(pr[0].id); setScr("dashboard"); } else setScr("pair");
      }
    } catch { setAErr("Connection error. Try again."); }
    setBusy(false);
  }

  async function pair() {
    const p = pInput.trim().toLowerCase();
    if (!p) { setPErr("Enter a username."); return; }
    if (p === user) { setPErr("Can't pair with yourself akhi."); return; }
    setBusy(true); setPErr("");
    try {
      const pr = await sb(`profiles?username=eq.${p}`) || [];
      if (pr.length === 0) { setPErr("Not found. They need to sign up first."); setBusy(false); return; }
      await sb("partnerships", "POST", { user_a: uid, user_b: pr[0].id, companion_type: companionType });
      setPartner(p); setPartnerLabel(companionLabel(companionType));
      await load(uid); setScr("dashboard");
    } catch { setPErr("Error pairing. Try again."); }
    setBusy(false);
  }

  async function save(nd, forDate) {
    const dateToSave = forDate || today;
    const s = sc(nd), l = lv(nd);
    const p = {
      user_id: uid, date: dateToSave,
      fajr: nd.fajr || null, dhuhr: nd.dhuhr || null, asr: nd.asr || null,
      maghrib: nd.maghrib || null, isha: nd.isha || null,
      adhkar_sabah: !!nd.adhkar_sabah, adhkar_masa: !!nd.adhkar_masa,
      quran: nd.quran || null, sunnah_rawatib: !!nd.sunnah_rawatib,
      score: s.s, level: l.l,
    };
    try {
      if (dateToSave === today && teid) {
        await sb(`daily_entries?id=eq.${teid}`, "PATCH", p);
      } else if (wk[dateToSave]?.id) {
        await sb(`daily_entries?id=eq.${wk[dateToSave].id}`, "PATCH", p);
        setWk(prev => ({ ...prev, [dateToSave]: { ...prev[dateToSave], ...p } }));
      } else {
        const cr = await sb("daily_entries", "POST", p);
        if (cr && cr.length > 0) {
          if (dateToSave === today) setTeid(cr[0].id);
          setWk(prev => ({ ...prev, [dateToSave]: cr[0] }));
        }
      }
    } catch (err) { console.error(err); }
  }

  function upd(key, val) {
    if (isToday) {
      setTd(prev => {
        const n = { ...prev };
        if (val === null || val === false || val === undefined) delete n[key]; else n[key] = val;
        save(n, today); return n;
      });
    } else {
      const existing = wk[selectedDate] ? e2d(wk[selectedDate]) : {};
      const n = { ...existing };
      if (val === null || val === false || val === undefined) delete n[key]; else n[key] = val;
      save(n, selectedDate);
      setWk(prev => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] || {}), ...n, date: selectedDate, user_id: uid } }));
    }
  }

  function cyc(id) {
    const data = isToday ? td : (wk[selectedDate] ? e2d(wk[selectedDate]) : {});
    const v = data[id];
    if (!v) upd(id, "prayed"); else if (v === "prayed") upd(id, "masjid"); else upd(id, null);
  }

  useEffect(() => { if (scr === "dashboard" && uid) load(uid); }, [scr, uid, load]);

  function navDate(dir) {
    const idx = navigableDates.indexOf(selectedDate);
    const newIdx = idx + (dir === "prev" ? 1 : -1);
    if (newIdx >= 0 && newIdx < navigableDates.length) setSelectedDate(navigableDates[newIdx]);
  }

  // ── LOADING ──
  if (scr === "loading") return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.04) 0%, ${C.bg} 70%)`,
      fontFamily: "'Outfit', sans-serif",
    }}>
      <style>{CSS}</style>
      <Particles />
      <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: C.gold, fontWeight: 700, animation: "breathe 2s ease infinite" }}>NurHabits</div>
      </div>
    </div>
  );

  // ── AUTH ──
  if (scr === "auth") return (
    <div className="auth-wrap" style={{ background: `radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.03) 0%, ${C.bg} 50%, ${C.bg2} 80%, #0f172a 100%)` }}>
      <style>{CSS}</style><Particles />
      <div className="auth-left">
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <img src="/logo.png" alt="NurHabits" style={{ height: 120, width: "auto", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1.1, marginTop: 12, animation: "fadeUp 0.6s ease 0.1s both" }}>
            Walk With Me<span style={{ color: C.gold }}>.</span>
          </h1>
          <p style={{ fontSize: 15, color: C.sub, marginTop: 14, lineHeight: 1.65, animation: "fadeUp 0.6s ease 0.2s both" }}>
            Track the Prophetic daily system. One person holds you accountable. Private. No showing off.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, animation: "fadeUp 0.6s ease 0.3s both" }}>
            {["5 Daily Prayers", "Quran Log", "Adhkar", "Sunnah Tracker", "1-on-1 Companion", "Streak System"].map((t, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: C.dim, padding: "7px 15px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.bdr}`, backdropFilter: "blur(8px)" }}>{t}</span>
            ))}
          </div>
          <div style={{ marginTop: 36, padding: "0 20px", animation: "fadeUp 0.6s ease 0.4s both" }}>
            <p style={{ fontSize: 14, color: "rgba(212,168,83,0.5)", fontFamily: "'Playfair Display', serif", fontStyle: "italic", lineHeight: 1.7 }}>
              "The most beloved deeds to Allah are those done consistently, even if they are small."
            </p>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Sahih al-Bukhari 6464</p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 20, textAlign: "center", animation: "fadeUp 0.5s ease 0.15s both" }}>
            {aMode === "login" ? "Welcome back" : "Join the walk"}
          </div>
          <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 3, border: `1px solid ${C.bdr}`, animation: "fadeUp 0.5s ease 0.2s both" }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setAMode(m); setAErr(""); setPwConfirm(""); }} style={{
                border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                flex: 1, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 600,
                background: aMode === m ? C.goldDim : "transparent",
                color: aMode === m ? C.gold : C.dim, transition: "all 0.2s",
              }}>{m === "login" ? "Sign In" : "Sign Up"}</button>
            ))}
          </div>
          <div style={{ animation: "fadeUp 0.5s ease 0.25s both" }}>
            <input value={un} onChange={e => setUn(e.target.value)} placeholder="Username" className="wi" style={{ marginBottom: 10 }} />
            <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Password" className="wi" onKeyDown={e => { if (e.key === "Enter" && aMode === "login") auth(); }} style={{ marginBottom: aMode === "signup" ? 10 : 18 }} />
            {aMode === "signup" && (
              <input value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} type="password" placeholder="Confirm password" className="wi" onKeyDown={e => { if (e.key === "Enter") auth(); }} style={{ marginBottom: 18 }} />
            )}
          </div>
          {aErr && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 14, textAlign: "center", padding: "10px 14px", background: "rgba(248,113,113,0.06)", borderRadius: 12, border: "1px solid rgba(248,113,113,0.12)", animation: "slideDown 0.2s ease" }}>{aErr}</div>}
          <div style={{ animation: "fadeUp 0.5s ease 0.3s both" }}>
            <button onClick={auth} disabled={busy} className="btn-gold">{busy ? "..." : aMode === "login" ? "Sign In" : "Create Account"}</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 24, animation: "fadeUp 0.5s ease 0.35s both" }}>
            <a href="/" style={{ fontSize: 12, color: C.dim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = C.gold} onMouseLeave={e => e.currentTarget.style.color = C.dim}>← nurhabits.com</a>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PAIR ──
  if (scr === "pair") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.03) 0%, ${C.bg} 60%, ${C.bg2} 100%)`,
      fontFamily: "'Outfit', sans-serif", color: C.text, padding: "48px 24px", position: "relative", overflow: "hidden",
    }}>
      <style>{CSS}</style><Particles />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400 }}>

        {pairStep === "intro" && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🤝</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 12 }}>Find Your Companion</h2>
            <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 8 }}>One person who walks this path with you. Private accountability, nothing more.</p>

            <div className="glass-card" style={{ padding: "22px 20px", marginTop: 20, marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 14 }}>How it works</div>
              {[
                "They see your daily score and streak only",
                "They never see which prayers you prayed or missed",
                "You both check in. That's the accountability",
                "This is between you, them, and Allah",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 10 : 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, marginTop: 6, flexShrink: 0, opacity: 0.5 }} />
                  <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.dim, fontWeight: 700, marginBottom: 12 }}>Who will you walk with?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {COMPANION_TYPES.map(opt => (
                  <button key={opt.id} onClick={() => setCompanionType(opt.id)} style={{
                    padding: "14px 10px", borderRadius: 14,
                    border: `1.5px solid ${companionType === opt.id ? "rgba(212,168,83,0.35)" : "rgba(255,255,255,0.05)"}`,
                    background: companionType === opt.id ? "rgba(212,168,83,0.08)" : "rgba(255,255,255,0.02)",
                    color: companionType === opt.id ? C.gold : C.dim,
                    cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                    fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    boxShadow: companionType === opt.id ? "0 0 20px rgba(212,168,83,0.06)" : "none",
                    backdropFilter: "blur(8px)",
                  }}>
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setPairStep("manual")} className="btn-gold" style={{ marginBottom: 10 }}>I know their username</button>
            <button onClick={() => setPairStep("invite")} className="btn-outline" style={{ marginBottom: 10 }}>Send them an invite link</button>
            <button onClick={async () => { await load(uid); setScr("dashboard"); }} className="btn-ghost">Walk alone for now</button>
          </div>
        )}

        {pairStep === "manual" && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
            <button onClick={() => setPairStep("intro")} style={{ border: "none", background: "none", color: C.dim, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Enter Their Username</h2>
            <p style={{ fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 1.6 }}>Your {companionLabel(companionType).toLowerCase()} needs to have signed up already.</p>
            <input value={pInput} onChange={e => setPInput(e.target.value)} placeholder="Their username" className="wi" onKeyDown={e => { if (e.key === "Enter") pair(); }} style={{ marginBottom: 14, textAlign: "center" }} />
            {pErr && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 12, textAlign: "center", padding: "10px 14px", background: "rgba(248,113,113,0.06)", borderRadius: 12, border: "1px solid rgba(248,113,113,0.12)" }}>{pErr}</div>}
            <button onClick={pair} disabled={busy} className="btn-gold" style={{ marginBottom: 10 }}>{busy ? "..." : "Pair Up"}</button>
          </div>
        )}

        {pairStep === "invite" && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
            <button onClick={() => setPairStep("intro")} style={{ border: "none", background: "none", color: C.dim, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Invite Your {companionLabel(companionType)}</h2>
            <p style={{ fontSize: 13, color: C.sub, marginBottom: 24, lineHeight: 1.6 }}>Send them this message. Once they sign up, come back and enter their username.</p>
            <div className="glass-card" style={{ padding: "20px 18px", marginBottom: 20, textAlign: "left" }}>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
                Assalamu alaikum — I'm using NurHabits to track my daily prayers, Quran, and adhkar. It has a companion feature where we can see each other's streak (never the details). Want to walk with me? Sign up here: <strong style={{ color: C.gold }}>nurhabits.com/walk</strong>
              </p>
              <p style={{ fontSize: 12, color: C.dim, marginTop: 10 }}>My username: <strong style={{ color: C.gold }}>{user}</strong></p>
            </div>
            <button onClick={() => {
              const msg = `Assalamu alaikum — I'm using NurHabits to track my daily prayers, Quran, and adhkar. It has a companion feature where we can see each other's streak (never the details). Want to walk with me? Sign up at nurhabits.com/walk — my username is ${user}`;
              navigator.clipboard?.writeText(msg).then(() => {
                const btn = document.getElementById("copy-invite");
                if (btn) { btn.textContent = "Copied!"; setTimeout(() => btn.textContent = "Copy Message", 1500); }
              }).catch(() => {});
            }} id="copy-invite" className="btn-gold" style={{ marginBottom: 10 }}>Copy Message</button>
            <button onClick={() => setPairStep("manual")} className="btn-outline" style={{ marginBottom: 10 }}>I have their username now</button>
            <button onClick={async () => { await load(uid); setScr("dashboard"); }} className="btn-ghost">Skip for now</button>
          </div>
        )}
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const d7 = last7();
  const is100 = score.pct === 100;
  const pctColor = is100 ? C.green : score.pct >= 50 ? "#fff" : score.pct > 0 ? C.gold : C.muted;
  const canGoBack = navigableDates.indexOf(selectedDate) < navigableDates.length - 1;
  const canGoForward = navigableDates.indexOf(selectedDate) > 0 && selectedDate !== today;
  const selectedFriday = dateFromKey(selectedDate).getDay() === 5;

  return (
    <div className="dash-wrap" style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.03) 0%, ${C.bg} 40%, ${C.bg2} 70%, #0f172a 100%)` }}>
      <style>{CSS}</style>
      <Particles />

      {/* Header */}
      <div style={{ padding: "24px 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 10 }}>
        <div>
          <a href="/" style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.gold, fontWeight: 700, textDecoration: "none" }}>NurHabits</a>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 5 }}>
            {isFri && <span style={{ color: C.gold, fontWeight: 600 }}>Jumu'ah Mubarak · </span>}{today}
          </div>
          {hd && <div style={{ fontSize: 10, color: "rgba(212,168,83,0.35)", marginTop: 3, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>{hd}</div>}
        </div>
        <div ref={settingsRef} style={{ position: "relative" }}>
          <button onClick={() => setSettings(!settings)} style={{
            border: `1.5px solid ${settings ? "rgba(212,168,83,0.2)" : "rgba(255,255,255,0.05)"}`,
            cursor: "pointer", fontFamily: "'Outfit',sans-serif", width: 40, height: 40, borderRadius: 13,
            background: settings ? "rgba(212,168,83,0.06)" : "rgba(255,255,255,0.02)",
            backdropFilter: "blur(8px)",
            color: settings ? C.gold : C.dim, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
          }}>⚙</button>
          {settings && (
            <div className="settings-menu">
              <div style={{ padding: "10px 14px 6px", fontSize: 11, color: C.dim, fontWeight: 600 }}>
                Signed in as <span style={{ color: C.gold }}>{user}</span>
              </div>
              {partner && <div style={{ padding: "0 14px 8px", fontSize: 11, color: C.dim }}>Paired with <span style={{ color: C.teal }}>{partner}</span></div>}
              <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "2px 8px" }} />
              {!partner && (
                <button onClick={() => { setSettings(false); setScr("pair"); setPairStep("intro"); }} className="settings-item">
                  <span>🤝</span> Find a companion
                </button>
              )}
              <button onClick={() => {
                setUser(""); setUid(""); setScr("auth"); setSettings(false); setTd({}); setWk({});
                setPartner(""); setSelectedDate(tk()); localStorage.removeItem("nurUser");
              }} className="settings-item" style={{ color: "rgba(248,113,113,0.6)" }}>
                <span>↩</span> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Navigator */}
      <div style={{ padding: "0 22px 18px", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px",
          background: !isToday ? "rgba(212,168,83,0.04)" : "transparent",
          borderRadius: 16, border: !isToday ? "1px solid rgba(212,168,83,0.1)" : "1px solid transparent",
          transition: "all 0.3s",
        }}>
          <button className="date-nav-btn" onClick={() => navDate("prev")} disabled={!canGoBack}>‹</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: isToday ? C.text : C.gold }}>{formatDateLabel(selectedDate)}</div>
            {!isToday && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>editing past entry</div>}
          </div>
          <button className="date-nav-btn" onClick={() => navDate("next")} disabled={!canGoForward || isToday}>›</button>
        </div>
      </div>

      {/* Score Hero */}
      <div style={{ padding: "0 22px 26px", position: "relative", zIndex: 1 }}>
        <div className={`glass-card-glow score-hero ${is100 ? "score-hero-100" : ""}`}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "140%",
            background: is100
              ? "radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)"
              : score.pct > 0
                ? "radial-gradient(ellipse, rgba(212,168,83,0.04) 0%, transparent 70%)"
                : "none",
            pointerEvents: "none",
          }} />
          {/* Progress bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, height: 5,
            width: `${score.pct}%`,
            background: is100
              ? "linear-gradient(90deg, #34D399, #4ECDC4, #34D399)"
              : `linear-gradient(90deg, ${C.gold}, rgba(212,168,83,0.6))`,
            borderRadius: "0 4px 0 0", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: is100 ? "0 0 16px rgba(52,211,153,0.2)" : score.pct > 0 ? "0 0 12px rgba(212,168,83,0.15)" : "none",
            ...(score.pct > 0 && !is100 ? { animation: "progressPulse 2.5s ease infinite" } : {}),
          }} />
          <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{
                fontSize: 64, fontWeight: 900, lineHeight: 1, color: pctColor, letterSpacing: "-3px",
                textShadow: is100 ? "0 0 30px rgba(52,211,153,0.15)" : "none",
              }}>
                {score.pct}<span style={{ fontSize: 26, fontWeight: 600, color: C.dim, letterSpacing: 0 }}>%</span>
              </div>
              <div style={{ marginTop: 14 }}><Badge l={level.l} n={level.n} /></div>
            </div>
            <div style={{ textAlign: "right", paddingBottom: 6 }}>
              <div style={{
                fontSize: 42, fontWeight: 900, color: streak > 0 ? C.gold : C.muted, lineHeight: 1, letterSpacing: "-2px",
                animation: streak >= 7 ? "streakGlow 3s ease infinite" : "none",
              }}>{streak}</div>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginTop: 6 }}>day streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div style={{ padding: "0 22px 26px", position: "relative", zIndex: 1 }}>
        <div className="glass-card" style={{ padding: "18px 16px", display: "flex", gap: 6, justifyContent: "space-between" }}>
          {d7.map(d => {
            const k = dateKey(d), e = wk[k];
            const dd = k === today ? td : e2d(e);
            const s = sc(dd), l = lv(dd), it = k === today, isSelected = k === selectedDate && !isToday;
            let bg = "rgba(255,255,255,0.03)";
            let glow = "none";
            if (s.pct > 0 && s.pct < 40) bg = "linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.06))";
            if (s.pct >= 40 && s.pct < 75) { bg = "linear-gradient(135deg, rgba(212,168,83,0.25), rgba(212,168,83,0.12))"; glow = "0 0 8px rgba(212,168,83,0.06)"; }
            if (s.pct >= 75) { bg = "linear-gradient(135deg, rgba(52,211,153,0.22), rgba(52,211,153,0.1))"; glow = "0 0 10px rgba(52,211,153,0.06)"; }
            if (l.l >= 3) { bg = "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.1))"; glow = "0 0 10px rgba(167,139,250,0.06)"; }
            return (
              <div key={k} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  aspectRatio: "1", borderRadius: 12, background: bg,
                  border: isSelected ? `2px solid ${C.teal}` : it ? `2px solid rgba(212,168,83,0.4)` : "2px solid rgba(255,255,255,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  color: l.l >= 1 ? C.green : s.pct > 0 ? C.gold : C.muted,
                  boxShadow: it ? `0 0 12px rgba(212,168,83,0.08), ${glow}` : glow,
                  transition: "all 0.25s",
                }}>
                  {l.l >= 1 ? `L${l.l}` : s.pct > 0 ? `${s.pct}%` : ""}
                </div>
                <div style={{ fontSize: 9, marginTop: 5, fontWeight: it ? 700 : 400, color: isSelected ? C.teal : it ? C.gold : C.muted }}>{dayLbl(d)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Companion */}
      {partner && (
        <div style={{ padding: "0 22px 26px", position: "relative", zIndex: 1 }}>
          <div className="glass-card-glow" style={{ padding: "20px 22px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 14, fontWeight: 700 }}>
              Your {partnerLabel}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: pIn ? "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04))" : "rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: pIn ? C.green : C.muted,
                border: `2px solid ${pIn ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.05)"}`,
                boxShadow: pIn ? "0 0 12px rgba(52,211,153,0.06)" : "none",
              }}>{partner.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{partner}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{pIn ? "Checked in today" : "Not yet today"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: pIn ? C.green : C.muted }}>{pPct}%</div>
                <div style={{ fontSize: 10, color: C.dim }}>{pStr}d streak</div>
              </div>
            </div>
            {pIn && <div style={{ marginTop: 14 }}><Badge l={pLv} n={["Starting", "Foundation", "Growth", "Elite"][pLv]} /></div>}
          </div>
        </div>
      )}

      {/* Today's Flow */}
      <div style={{ padding: "0 22px 30px", position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: 700,
          marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>{isToday ? "Today's Flow" : formatDateLabel(selectedDate)}</span>
          <span style={{ color: C.muted, fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: 10 }}>tap to cycle</span>
        </div>

        <PrayerRow prayer={PRAYERS[0]} value={currentData.fajr} onCycle={() => cyc("fajr")} jumu={selectedFriday} />
        <CheckRow label="Adhkar as-Sabah" icon="☀️" checked={!!currentData.adhkar_sabah} onToggle={() => upd("adhkar_sabah", !currentData.adhkar_sabah)} />

        {/* Quran */}
        <div style={{
          padding: "18px 20px", borderRadius: 18,
          background: currentData.quran
            ? "linear-gradient(135deg, rgba(52,211,153,0.07) 0%, rgba(52,211,153,0.02) 100%)"
            : "rgba(255,255,255,0.02)",
          border: `1.5px solid ${currentData.quran ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.05)"}`,
          backdropFilter: "blur(8px)",
          marginBottom: 8, transition: "all 0.25s",
          boxShadow: currentData.quran ? "0 2px 12px rgba(52,211,153,0.04)" : "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>📖</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: currentData.quran ? C.green : C.text }}>Quran</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QO.map(o => (
              <button key={o.value} onClick={() => upd("quran", currentData.quran === o.value ? null : o.value)} style={{
                border: `1.5px solid ${currentData.quran === o.value ? C.green : "rgba(255,255,255,0.06)"}`,
                cursor: "pointer", fontFamily: "'Outfit',sans-serif",
                padding: "10px 18px", borderRadius: 11, fontSize: 12, fontWeight: 600,
                background: currentData.quran === o.value
                  ? "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.06))"
                  : "rgba(255,255,255,0.02)",
                color: currentData.quran === o.value ? C.green : C.dim,
                transition: "all 0.2s", WebkitTapHighlightColor: "transparent",
                boxShadow: currentData.quran === o.value ? "0 0 8px rgba(52,211,153,0.08)" : "none",
              }}>{o.label}</button>
            ))}
          </div>
        </div>

        <PrayerRow prayer={PRAYERS[1]} value={currentData.dhuhr} onCycle={() => cyc("dhuhr")} jumu={selectedFriday} />
        <PrayerRow prayer={PRAYERS[2]} value={currentData.asr} onCycle={() => cyc("asr")} jumu={selectedFriday} />
        <CheckRow label="Adhkar al-Masa" icon="🌙" checked={!!currentData.adhkar_masa} onToggle={() => upd("adhkar_masa", !currentData.adhkar_masa)} />
        <PrayerRow prayer={PRAYERS[3]} value={currentData.maghrib} onCycle={() => cyc("maghrib")} jumu={selectedFriday} />
        <PrayerRow prayer={PRAYERS[4]} value={currentData.isha} onCycle={() => cyc("isha")} jumu={selectedFriday} />
        <CheckRow label="12 Rakaat Sunnah" icon="🤲" checked={!!currentData.sunnah_rawatib} onToggle={() => upd("sunnah_rawatib", !currentData.sunnah_rawatib)} />
      </div>

      {/* Level Achievement */}
      {level.l >= 1 && (
        <div style={{ textAlign: "center", padding: "24px 22px 12px", position: "relative", zIndex: 1, animation: "celebrateIn 0.4s ease" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{level.l === 3 ? "👑" : level.l === 2 ? "🔥" : "✅"}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: level.l === 3 ? C.purple : level.l === 2 ? C.teal : C.green }}>
            Level {level.l} — {level.n}
          </div>
          <div style={{ fontSize: 13, color: "rgba(212,168,83,0.45)", marginTop: 6, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            Consistency is worship.
          </div>
        </div>
      )}

      {/* 100% Celebration */}
      {is100 && (
        <div style={{ textAlign: "center", padding: "12px 22px 0", position: "relative", zIndex: 1, animation: "celebrateIn 0.5s ease 0.2s both" }}>
          <div style={{
            padding: "14px 20px", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(78,205,196,0.04))",
            border: "1px solid rgba(52,211,153,0.12)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>
              Alhamdulillah. A complete day.
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "36px 22px 44px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.15))" }} />
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="2" y="2" width="6" height="6" transform="rotate(45 5 5)" fill="none" stroke="rgba(212,168,83,0.2)" strokeWidth="1" /></svg>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, rgba(212,168,83,0.15), transparent)" }} />
        </div>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>NurHabits · Walk With Me</div>
      </div>
    </div>
  );
}
