// src/Walk.jsx — v3: Immersive branded experience
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

const tk = () => new Date().toISOString().split("T")[0];
const isFriday = () => new Date().getDay() === 5;
function hijri() { try { return new Intl.DateTimeFormat("en-US-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).format(new Date()); } catch{return "";} }
function dayLbl(d) { return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]; }
function last7() { const a=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);a.push(d);} return a; }

function sc(d) {
  if(!d) return {pct:0,s:0,mc:0};
  let s=0; PRAYERS.forEach(p=>{if(d[p.id]==="prayed")s+=2;if(d[p.id]==="masjid")s+=4;});
  if(d.adhkar_sabah)s+=2; if(d.adhkar_masa)s+=2;
  const q=QO.find(o=>o.value===d.quran); if(q)s+=Math.min(q.pts,5);
  if(d.sunnah_rawatib)s+=3;
  return {pct:Math.round((s/32)*100),s,mc:PRAYERS.filter(p=>d[p.id]==="masjid").length};
}

function lv(d) {
  if(!d) return {l:0,n:"Starting"};
  const mc=PRAYERS.filter(p=>d[p.id]==="masjid").length, q=d.quran||"", sn=!!d.sunnah_rawatib;
  const ap=PRAYERS.every(p=>d[p.id]==="prayed"||d[p.id]==="masjid"), aS=!!d.adhkar_sabah, aM=!!d.adhkar_masa;
  if(mc>=5&&(q==="1_juz"||q==="more")&&sn&&aS&&aM) return {l:3,n:"Elite"};
  if(mc>=3&&["half_juz","1_juz","more"].includes(q)&&sn&&aS&&aM) return {l:2,n:"Growth"};
  if(ap&&mc>=1&&aS&&q) return {l:1,n:"Foundation"};
  return {l:0,n:"Starting"};
}

function e2d(e) { return e?{fajr:e.fajr,dhuhr:e.dhuhr,asr:e.asr,maghrib:e.maghrib,isha:e.isha,adhkar_sabah:e.adhkar_sabah,adhkar_masa:e.adhkar_masa,quran:e.quran,sunnah_rawatib:e.sunnah_rawatib}:null; }
function stk(entries) { let s=0; if(!entries)return 0; for(const e of entries){if(lv(e2d(e)).l>=1)s++;else break;} return s; }

const C = {
  bg:"#0a0a16", bg2:"#1a1a2e", gold:"#D4A853", goldMid:"rgba(212,168,83,0.35)", goldDim:"rgba(212,168,83,0.10)",
  green:"#34D399", greenDim:"rgba(52,211,153,0.08)", greenBdr:"rgba(52,211,153,0.2)",
  teal:"#4ECDC4", purple:"#A78BFA", text:"#e2e2e8", sub:"#9a9ab0", dim:"#6b6b85", muted:"#3a3a52",
  card:"rgba(255,255,255,0.02)", bdr:"rgba(255,255,255,0.06)",
};
const LC = {
  0:{bg:"rgba(255,255,255,0.04)",t:C.muted,b:C.bdr},
  1:{bg:C.goldDim,t:C.gold,b:"rgba(212,168,83,0.25)"},
  2:{bg:"rgba(78,205,196,0.07)",t:C.teal,b:"rgba(78,205,196,0.25)"},
  3:{bg:"rgba(167,139,250,0.07)",t:C.purple,b:"rgba(167,139,250,0.25)"},
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:${C.bg};overflow-x:hidden}
::selection{background:rgba(212,168,83,0.2);color:#fff}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes float1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-12px) translateX(8px)}}
@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px) translateX(-6px)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes progressPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,168,83,0.2)}50%{box-shadow:0 0 20px 4px rgba(212,168,83,0.1)}}
.wi{width:100%;padding:16px 20px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.05);background:rgba(255,255,255,0.03);color:#fff;font-size:15px;font-family:'Outfit',sans-serif;outline:none;transition:border-color 0.25s,box-shadow 0.25s,background 0.25s}
.wi:focus{border-color:rgba(212,168,83,0.35);box-shadow:0 0 0 4px rgba(212,168,83,0.06);background:rgba(255,255,255,0.04)}
.wi::placeholder{color:rgba(255,255,255,0.18)}
.btn-gold{width:100%;padding:16px;border-radius:12px;border:none;background:linear-gradient(135deg,#D4A853 0%,#b8923d 100%);color:#0a0a16;font-size:16px;font-weight:700;letter-spacing:0.3px;font-family:'Outfit',sans-serif;cursor:pointer;transition:all 0.25s}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(212,168,83,0.25)}
.btn-gold:active{transform:translateY(0)}.btn-gold:disabled{opacity:0.5;cursor:wait;transform:none;box-shadow:none}
.btn-ghost{width:100%;padding:14px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.06);background:transparent;color:rgba(255,255,255,0.35);font-size:14px;font-weight:500;font-family:'Outfit',sans-serif;cursor:pointer;transition:all 0.25s}
.btn-ghost:hover{border-color:rgba(212,168,83,0.25);color:rgba(212,168,83,0.6);background:rgba(212,168,83,0.03)}
.auth-wrap{min-height:100vh;display:flex;font-family:'Outfit',sans-serif;color:${C.text};position:relative;overflow:hidden}
.auth-left{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;position:relative;z-index:1}
.auth-right{width:420px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);border-left:1px solid rgba(255,255,255,0.04);padding:48px 40px;position:relative;z-index:1}
@media(max-width:860px){.auth-wrap{flex-direction:column}.auth-left{min-height:auto;padding:60px 24px 40px}.auth-right{width:100%;padding:32px 24px 48px;border-left:none;border-top:1px solid rgba(255,255,255,0.04)}}
@media(max-width:480px){.auth-left{padding:48px 20px 32px}.auth-right{padding:28px 20px 40px}.wi{padding:14px 16px;font-size:14px}.btn-gold{padding:14px;font-size:15px}}
.dash-wrap{min-height:100vh;max-width:500px;margin:0 auto;font-family:'Outfit',sans-serif;color:${C.text};background:linear-gradient(180deg,${C.bg} 0%,${C.bg2} 30%,#0f172a 100%)}
.p-btn{border:1.5px solid ${C.bdr};cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,0.015);margin-bottom:6px;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
.p-btn:active{transform:scale(0.985)}
.c-btn{border:1.5px solid ${C.bdr};cursor:pointer;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:12px;width:100%;padding:13px 16px;border-radius:14px;background:rgba(255,255,255,0.015);margin-bottom:6px;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
.c-btn:active{transform:scale(0.985)}
`;

function Dots() {
  const d = useRef(Array.from({ length: 14 }, () => ({ w: 1 + Math.random() * 2, left: Math.random() * 100, top: Math.random() * 100, dur: 10 + Math.random() * 14, del: Math.random() * 6, a: Math.floor(Math.random() * 3) })));
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>{d.current.map((p, i) => <div key={i} style={{ position: "absolute", width: p.w, height: p.w, borderRadius: "50%", background: "rgba(212,168,83,0.12)", left: `${p.left}%`, top: `${p.top}%`, animation: `float${p.a} ${p.dur}s ease-in-out infinite`, animationDelay: `${p.del}s` }} />)}</div>;
}

function PrayerRow({ prayer, value, onCycle, jumu }) {
  const label = jumu && prayer.id === "dhuhr" ? "Jumu'ah" : prayer.label;
  const m = value === "masjid", p = value === "prayed", active = m || p;
  return <button onClick={onCycle} className="p-btn" style={{ borderColor: m ? C.greenBdr : p ? "rgba(212,168,83,0.15)" : undefined, background: m ? C.greenDim : p ? C.goldDim : undefined }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{m ? "🕌" : p ? "✓" : prayer.icon}</div>
      <div style={{ textAlign: "left" }}><div style={{ fontSize: 14, fontWeight: 600, color: m ? C.green : p ? C.gold : C.text }}>{label}</div><div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>{prayer.time}</div></div>
    </div>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: m ? C.green : p ? C.gold : C.muted, padding: "5px 10px", borderRadius: 6, background: active ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.02)" }}>{m ? (jumu && prayer.id === "dhuhr" ? "Jumu'ah" : "Masjid") : p ? "Prayed" : "—"}</span>
  </button>;
}

function CheckRow({ label, icon, checked, onToggle }) {
  return <button onClick={onToggle} className="c-btn" style={{ borderColor: checked ? C.greenBdr : undefined, background: checked ? C.greenDim : undefined }}>
    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked ? C.green : "rgba(255,255,255,0.08)"}`, background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>{checked && <span style={{ color: C.bg, fontSize: 11, fontWeight: 800 }}>✓</span>}</div>
    <span style={{ fontSize: 14 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: checked ? C.green : C.text, opacity: checked ? 0.7 : 1 }}>{label}</span>
  </button>;
}

function Badge({ l, n }) { const c = LC[l] || LC[0]; return <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: c.bg, border: `1.5px solid ${c.b}` }}><span style={{ fontSize: 11, fontWeight: 800, color: c.t }}>L{l}</span><span style={{ fontSize: 10, color: c.t, fontWeight: 600 }}>{n}</span></div>; }

export default function Walk() {
  const [scr,setScr]=useState("auth");
  const [un,setUn]=useState(""); const [pw,setPw]=useState("");
  const [aMode,setAMode]=useState("login"); const [aErr,setAErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [uid,setUid]=useState(""); const [user,setUser]=useState("");
  const [td,setTd]=useState({}); const [teid,setTeid]=useState(null);
  const [wk,setWk]=useState({}); const [streak,setStreak]=useState(0);
  const [partner,setPartner]=useState("");
  const [pPct,setPPct]=useState(0); const [pStr,setPStr]=useState(0);
  const [pLv,setPLv]=useState(0); const [pIn,setPIn]=useState(false);
  const [pInput,setPInput]=useState(""); const [pErr,setPErr]=useState("");
  const [settings,setSettings]=useState(false);

  const today = tk(), isFri = isFriday(), hd = hijri();
  const score = sc(td), level = lv(td);

  const load = useCallback(async (id) => {
    try {
      const start = new Date(); start.setDate(start.getDate() - 7); const sd = start.toISOString().split("T")[0];
      const ents = await sb(`daily_entries?user_id=eq.${id}&date=gte.${sd}&order=date.desc`) || [];
      const w = {}; let te = null; ents.forEach(e => { w[e.date] = e; if (e.date === today) te = e; }); setWk(w);
      if (te) { setTd(e2d(te)); setTeid(te.id); }
      const all = await sb(`daily_entries?user_id=eq.${id}&order=date.desc&limit=60`) || []; setStreak(stk(all));
      const ps = await sb(`partnerships?or=(user_a.eq.${id},user_b.eq.${id})`) || [];
      if (ps.length > 0) {
        const pid = ps[0].user_a === id ? ps[0].user_b : ps[0].user_a;
        const pp = await sb(`profiles?id=eq.${pid}`) || [];
        if (pp.length > 0) {
          setPartner(pp[0].username);
          const pe = await sb(`daily_entries?user_id=eq.${pid}&date=eq.${today}`) || [];
          if (pe.length > 0) { const pd = e2d(pe[0]); setPPct(sc(pd).pct); setPLv(lv(pd).l); setPIn(true); }
          else { setPIn(false); setPPct(0); setPLv(0); }
          const pa = await sb(`daily_entries?user_id=eq.${pid}&order=date.desc&limit=30`) || []; setPStr(stk(pa));
        }
      }
    } catch (err) { console.error(err); }
  }, [today]);

  async function auth() {
    if (!un.trim() || !pw.trim()) { setAErr("Fill in both fields."); return; }
    setBusy(true); setAErr(""); const u = un.trim().toLowerCase();
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
    if (!p) { setPErr("Enter a username."); return; } if (p === user) { setPErr("Can't pair with yourself akhi."); return; }
    setBusy(true); setPErr("");
    try {
      const pr = await sb(`profiles?username=eq.${p}`) || [];
      if (pr.length === 0) { setPErr("Brother not found. He needs to sign up first."); setBusy(false); return; }
      await sb("partnerships", "POST", { user_a: uid, user_b: pr[0].id });
      setPartner(p); await load(uid); setScr("dashboard");
    } catch { setPErr("Error pairing. Try again."); }
    setBusy(false);
  }

  async function save(nd) {
    const s = sc(nd), l = lv(nd);
    const p = { user_id: uid, date: today, fajr: nd.fajr || null, dhuhr: nd.dhuhr || null, asr: nd.asr || null, maghrib: nd.maghrib || null, isha: nd.isha || null, adhkar_sabah: !!nd.adhkar_sabah, adhkar_masa: !!nd.adhkar_masa, quran: nd.quran || null, sunnah_rawatib: !!nd.sunnah_rawatib, score: s.s, level: l.l };
    try { if (teid) { await sb(`daily_entries?id=eq.${teid}`, "PATCH", p); } else { const cr = await sb("daily_entries", "POST", p); if (cr && cr.length > 0) setTeid(cr[0].id); } } catch (err) { console.error(err); }
  }

  function upd(key, val) { setTd(prev => { const n = { ...prev }; if (val === null || val === false || val === undefined) delete n[key]; else n[key] = val; save(n); return n; }); }
  function cyc(id) { const v = td[id]; if (!v) upd(id, "prayed"); else if (v === "prayed") upd(id, "masjid"); else upd(id, null); }
  useEffect(() => { if (scr === "dashboard" && uid) load(uid); }, [scr, uid, load]);

  // ── AUTH ──
  if (scr === "auth") return (
    <div className="auth-wrap" style={{ background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bg2} 50%, #0f172a 100%)` }}>
      <style>{CSS}</style><Dots />
      <div className="auth-left">
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <div style={{ animation: "fadeUp 0.6s ease both" }}><img src="/logo.png" alt="NurHabits" style={{ height: 120, width: "auto", objectFit: "contain" }} /></div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1.1, marginTop: 12, animation: "fadeUp 0.6s ease 0.1s both" }}>Walk With Me<span style={{ color: C.gold }}>.</span></h1>
          <p style={{ fontSize: 15, color: C.sub, marginTop: 14, lineHeight: 1.65, animation: "fadeUp 0.6s ease 0.2s both" }}>Track the Prophetic daily system. One brother holds you accountable. Private. No showing off.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 28, animation: "fadeUp 0.6s ease 0.3s both" }}>
            {["5 Daily Prayers", "Quran Log", "Adhkar", "Sunnah Tracker", "1-on-1 Companion", "Streak System"].map((t, i) => <span key={i} style={{ fontSize: 11, fontWeight: 600, color: C.dim, padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.bdr}` }}>{t}</span>)}
          </div>
          <div style={{ marginTop: 36, padding: "0 20px", animation: "fadeUp 0.6s ease 0.4s both" }}>
            <p style={{ fontSize: 13, color: "rgba(212,168,83,0.5)", fontFamily: "'Playfair Display', serif", fontStyle: "italic", lineHeight: 1.7 }}>"The most beloved deeds to Allah are those done consistently, even if they are small."</p>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Sahih al-Bukhari 6464</p>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 20, textAlign: "center", animation: "fadeUp 0.5s ease 0.15s both" }}>{aMode === "login" ? "Welcome back" : "Join the walk"}</div>
          <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 3, border: `1px solid ${C.bdr}`, animation: "fadeUp 0.5s ease 0.2s both" }}>
            {["login", "signup"].map(m => <button key={m} onClick={() => { setAMode(m); setAErr(""); }} style={{ border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, background: aMode === m ? C.goldDim : "transparent", color: aMode === m ? C.gold : C.dim, transition: "all 0.2s" }}>{m === "login" ? "Sign In" : "Sign Up"}</button>)}
          </div>
          <div style={{ animation: "fadeUp 0.5s ease 0.25s both" }}>
            <input value={un} onChange={e => setUn(e.target.value)} placeholder="Username" className="wi" style={{ marginBottom: 10 }} />
            <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="Password" className="wi" onKeyDown={e => { if (e.key === "Enter") auth(); }} style={{ marginBottom: 18 }} />
          </div>
          {aErr && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 14, textAlign: "center", padding: "10px 14px", background: "rgba(248,113,113,0.05)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.1)", animation: "slideDown 0.2s ease" }}>{aErr}</div>}
          <div style={{ animation: "fadeUp 0.5s ease 0.3s both" }}><button onClick={auth} disabled={busy} className="btn-gold">{busy ? "..." : aMode === "login" ? "Sign In" : "Create Account"}</button></div>
          <div style={{ textAlign: "center", marginTop: 24, animation: "fadeUp 0.5s ease 0.35s both" }}><a href="/" style={{ fontSize: 12, color: C.dim, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = C.gold} onMouseLeave={e => e.currentTarget.style.color = C.dim}>← nurhabits.com</a></div>
        </div>
      </div>
    </div>
  );

  // ── PAIR ──
  if (scr === "pair") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`, fontFamily: "'Outfit', sans-serif", color: C.text, padding: "48px 24px", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style><Dots />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20, animation: "fadeUp 0.6s ease both" }}>🤝</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", animation: "fadeUp 0.6s ease 0.1s both" }}>Find Your Companion</h2>
        <p style={{ fontSize: 14, color: C.sub, marginTop: 10, marginBottom: 32, lineHeight: 1.6, animation: "fadeUp 0.6s ease 0.15s both" }}>Enter your brother's username. You see each other's score and streak. Never the details.</p>
        <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
          <input value={pInput} onChange={e => setPInput(e.target.value)} placeholder="Brother's username" className="wi" onKeyDown={e => { if (e.key === "Enter") pair(); }} style={{ marginBottom: 14 }} />
          {pErr && <div style={{ fontSize: 13, color: "#f87171", marginBottom: 12, textAlign: "center", padding: "10px 14px", background: "rgba(248,113,113,0.05)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.1)" }}>{pErr}</div>}
          <button onClick={pair} disabled={busy} className="btn-gold" style={{ marginBottom: 10 }}>{busy ? "..." : "Pair Up"}</button>
          <button onClick={async () => { await load(uid); setScr("dashboard"); }} className="btn-ghost">Walk alone for now</button>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const d7 = last7();
  const pctColor = score.pct === 100 ? C.green : score.pct >= 50 ? "#fff" : score.pct > 0 ? C.gold : C.muted;

  return (
    <div className="dash-wrap"><style>{CSS}</style>
      <div style={{ padding: "22px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <a href="/" style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.gold, fontWeight: 700, textDecoration: "none" }}>NurHabits</a>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>{isFri && <span style={{ color: C.gold, fontWeight: 600 }}>Jumu'ah Mubarak · </span>}{today}</div>
          {hd && <div style={{ fontSize: 10, color: "rgba(212,168,83,0.4)", marginTop: 2 }}>{hd}</div>}
        </div>
        <button onClick={() => setSettings(!settings)} style={{ border: `1.5px solid ${settings ? "rgba(212,168,83,0.2)" : C.bdr}`, cursor: "pointer", fontFamily: "'Outfit',sans-serif", width: 34, height: 34, borderRadius: "50%", background: settings ? "rgba(212,168,83,0.06)" : "rgba(255,255,255,0.02)", color: settings ? C.gold : C.dim, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>⚙</button>
      </div>

      {settings && <div style={{ padding: "0 20px 14px", animation: "slideDown 0.2s ease" }}><div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 14, padding: 16, border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>Signed in as <strong style={{ color: C.gold }}>{user}</strong>{partner && <span> · paired with <strong style={{ color: C.teal }}>{partner}</strong></span>}</div>
        {!partner && <button onClick={() => { setSettings(false); setScr("pair"); }} style={{ border: `1px solid rgba(212,168,83,0.15)`, cursor: "pointer", fontFamily: "'Outfit',sans-serif", width: "100%", padding: 11, borderRadius: 10, background: C.goldDim, color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Find a companion</button>}
        <button onClick={() => { setUser(""); setUid(""); setScr("auth"); setSettings(false); setTd({}); setWk({}); setPartner(""); localStorage.removeItem("nurUser"); }} style={{ border: `1px solid ${C.bdr}`, cursor: "pointer", fontFamily: "'Outfit',sans-serif", width: "100%", padding: 11, borderRadius: 10, background: "rgba(255,255,255,0.02)", color: C.dim, fontSize: 12 }}>Sign out</button>
      </div></div>}

      {/* Score Hero */}
      <div style={{ padding: "12px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "24px 24px 20px", background: "rgba(255,255,255,0.015)", borderRadius: 18, border: `1px solid ${C.bdr}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${score.pct}%`, background: score.pct === 100 ? C.green : `linear-gradient(90deg, ${C.gold}, ${C.goldMid})`, borderRadius: "0 2px 0 0", transition: "width 0.5s ease", ...(score.pct > 0 && score.pct < 100 ? { animation: "progressPulse 2s ease infinite" } : {}) }} />
          <div>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: pctColor, letterSpacing: "-2px" }}>{score.pct}<span style={{ fontSize: 22, fontWeight: 600, color: C.dim, letterSpacing: 0 }}>%</span></div>
            <div style={{ marginTop: 10 }}><Badge l={level.l} n={level.n} /></div>
          </div>
          <div style={{ textAlign: "right", paddingBottom: 4 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: streak > 0 ? C.gold : C.muted, lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>day streak</div>
          </div>
        </div>
      </div>

      {/* 7-Day */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", gap: 5, justifyContent: "space-between", padding: "14px 12px", background: C.card, borderRadius: 14, border: `1px solid ${C.bdr}` }}>
          {d7.map(d => { const k = d.toISOString().split("T")[0], e = wk[k], dd = k === today ? td : e2d(e), s = sc(dd), l = lv(dd), it = k === today; let bg = "rgba(255,255,255,0.03)"; if (s.pct > 0 && s.pct < 40) bg = "rgba(212,168,83,0.1)"; if (s.pct >= 40 && s.pct < 75) bg = "rgba(212,168,83,0.22)"; if (s.pct >= 75) bg = "rgba(52,211,153,0.22)"; if (l.l >= 3) bg = "rgba(167,139,250,0.25)"; return <div key={k} style={{ flex: 1, textAlign: "center" }}><div style={{ aspectRatio: "1", borderRadius: 8, background: bg, border: it ? `2px solid ${C.gold}` : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: l.l >= 1 ? C.green : s.pct > 0 ? C.gold : C.muted }}>{l.l >= 1 ? `L${l.l}` : s.pct > 0 ? `${s.pct}%` : ""}</div><div style={{ fontSize: 8, marginTop: 3, fontWeight: it ? 700 : 400, color: it ? C.gold : C.muted }}>{dayLbl(d)}</div></div>; })}
        </div>
      </div>

      {/* Companion */}
      {partner && <div style={{ padding: "0 20px 20px" }}><div style={{ padding: 16, borderRadius: 14, background: "rgba(212,168,83,0.025)", border: "1px solid rgba(212,168,83,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 12, fontWeight: 700 }}>Companion</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: pIn ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: pIn ? C.green : C.muted, border: `2px solid ${pIn ? "rgba(52,211,153,0.2)" : C.bdr}` }}>{partner.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{partner}</div><div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>{pIn ? "Checked in" : "Not yet today"}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 20, fontWeight: 800, color: pIn ? C.green : C.muted }}>{pPct}%</div><div style={{ fontSize: 9, color: C.dim }}>{pStr}d</div></div>
        </div>
        {pIn && <div style={{ marginTop: 10 }}><Badge l={pLv} n={["Starting", "Foundation", "Growth", "Elite"][pLv]} /></div>}
      </div></div>}

      {/* Today's Flow */}
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Today's Flow</span><span style={{ color: C.muted, fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: 10 }}>tap to cycle</span>
        </div>
        <PrayerRow prayer={PRAYERS[0]} value={td.fajr} onCycle={() => cyc("fajr")} jumu={isFri} />
        <CheckRow label="Adhkar as-Sabah" icon="☀️" checked={!!td.adhkar_sabah} onToggle={() => upd("adhkar_sabah", !td.adhkar_sabah)} />
        <div style={{ padding: "13px 16px", borderRadius: 14, background: td.quran ? C.greenDim : "rgba(255,255,255,0.015)", border: `1.5px solid ${td.quran ? C.greenBdr : C.bdr}`, marginBottom: 6, transition: "all 0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><span style={{ fontSize: 14 }}>📖</span><span style={{ fontSize: 14, fontWeight: 600, color: td.quran ? C.green : C.text }}>Quran</span></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QO.map(o => <button key={o.value} onClick={() => upd("quran", td.quran === o.value ? null : o.value)} style={{ border: `1.5px solid ${td.quran === o.value ? C.green : "rgba(255,255,255,0.05)"}`, cursor: "pointer", fontFamily: "'Outfit',sans-serif", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: td.quran === o.value ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.02)", color: td.quran === o.value ? C.green : C.dim, transition: "all 0.15s", WebkitTapHighlightColor: "transparent" }}>{o.label}</button>)}
          </div>
        </div>
        <PrayerRow prayer={PRAYERS[1]} value={td.dhuhr} onCycle={() => cyc("dhuhr")} jumu={isFri} />
        <PrayerRow prayer={PRAYERS[2]} value={td.asr} onCycle={() => cyc("asr")} jumu={isFri} />
        <CheckRow label="Adhkar al-Masa" icon="🌙" checked={!!td.adhkar_masa} onToggle={() => upd("adhkar_masa", !td.adhkar_masa)} />
        <PrayerRow prayer={PRAYERS[3]} value={td.maghrib} onCycle={() => cyc("maghrib")} jumu={isFri} />
        <PrayerRow prayer={PRAYERS[4]} value={td.isha} onCycle={() => cyc("isha")} jumu={isFri} />
        <CheckRow label="12 Rakaat Sunnah" icon="🤲" checked={!!td.sunnah_rawatib} onToggle={() => upd("sunnah_rawatib", !td.sunnah_rawatib)} />
      </div>

      {level.l >= 1 && <div style={{ textAlign: "center", padding: "20px 20px 8px" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>{level.l === 3 ? "👑" : level.l === 2 ? "🔥" : "✅"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: level.l === 3 ? C.purple : level.l === 2 ? C.teal : C.green }}>Level {level.l} — {level.n}</div>
        <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>Consistency is worship.</div>
      </div>}

      <div style={{ textAlign: "center", padding: "28px 20px 36px" }}>
        <div style={{ width: 40, height: 1, background: "rgba(212,168,83,0.15)", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>NurHabits · Walk With Me</div>
      </div>
    </div>
  );
}
