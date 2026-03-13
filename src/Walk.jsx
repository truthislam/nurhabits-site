// src/Walk.jsx — Updated to sync login state with the homepage
import { useState, useEffect, useCallback } from "react";

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
  { id: "fajr", label: "Fajr", time: "dawn" },
  { id: "dhuhr", label: "Dhuhr", time: "midday" },
  { id: "asr", label: "Asr", time: "afternoon" },
  { id: "maghrib", label: "Maghrib", time: "sunset" },
  { id: "isha", label: "Isha", time: "night" },
];
const QO = [
  { value: "1_page", label: "1 page", pts: 1 },
  { value: "half_juz", label: "½ juz", pts: 3 },
  { value: "1_juz", label: "1 juz", pts: 5 },
  { value: "more", label: "1+ juz", pts: 7 },
];

const tk = () => new Date().toISOString().split("T")[0];
const fri = () => new Date().getDay() === 5;
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
  bg:"#0d0d1a",bg2:"#1a1a2e",gold:"#D4A853",goldDim:"rgba(212,168,83,0.15)",
  green:"#34D399",greenDim:"rgba(52,211,153,0.1)",greenBdr:"rgba(52,211,153,0.25)",
  teal:"#4ECDC4",purple:"#A78BFA",text:"#e2e2e8",dim:"#6b6b85",muted:"#3a3a52",
  card:"rgba(255,255,255,0.025)",bdr:"rgba(255,255,255,0.06)",
};
const LC = {
  0:{bg:"rgba(255,255,255,0.05)",t:C.muted,b:C.bdr},
  1:{bg:C.goldDim,t:C.gold,b:"rgba(212,168,83,0.3)"},
  2:{bg:"rgba(78,205,196,0.1)",t:C.teal,b:"rgba(78,205,196,0.3)"},
  3:{bg:"rgba(167,139,250,0.1)",t:C.purple,b:"rgba(167,139,250,0.3)"},
};
const iS={width:"100%",padding:"14px 16px",borderRadius:10,border:`1px solid ${C.bdr}`,background:"rgba(0,0,0,0.3)",color:"#fff",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
const gB={border:"none",cursor:"pointer",fontFamily:"inherit",width:"100%",padding:14,borderRadius:10,background:C.gold,color:C.bg,fontSize:14,fontWeight:700};

function PB({prayer,value,onCycle,fri:f}) {
  const j=f&&prayer.id==="dhuhr", label=j?"Jumu'ah":prayer.label;
  let sl="—",icon="🕐",bg=C.card,bd=C.bdr,tc=C.text;
  if(value==="prayed"){sl="Prayed";icon="✓";bg=C.goldDim;bd="rgba(212,168,83,0.2)";tc=C.gold;}
  if(value==="masjid"){sl=j?"Jumu'ah ✓":"Masjid";icon="🕌";bg=C.greenDim;bd=C.greenBdr;tc=C.green;}
  return <button onClick={onCycle} style={{border:`1px solid ${bd}`,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"16px 18px",borderRadius:12,background:bg,marginBottom:8,boxSizing:"border-box"}}>
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:38,height:38,borderRadius:10,background:value?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
      <div style={{textAlign:"left"}}><div style={{fontSize:15,fontWeight:600,color:tc}}>{label}</div><div style={{fontSize:11,color:C.dim,marginTop:2}}>{prayer.time}</div></div>
    </div>
    <div style={{fontSize:12,fontWeight:700,color:tc,padding:"6px 12px",borderRadius:6,background:value?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.03)"}}>{sl}</div>
  </button>;
}

function CB({label,icon,checked,onToggle}) {
  return <button onClick={onToggle} style={{border:`1px solid ${checked?C.greenBdr:C.bdr}`,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 18px",borderRadius:12,background:checked?C.greenDim:C.card,marginBottom:8,boxSizing:"border-box"}}>
    <div style={{width:24,height:24,borderRadius:7,border:`2px solid ${checked?C.green:"rgba(255,255,255,0.12)"}`,background:checked?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{checked&&<span style={{color:C.bg,fontSize:13,fontWeight:800}}>✓</span>}</div>
    <span style={{fontSize:14}}>{icon}</span>
    <span style={{fontSize:14,fontWeight:500,color:checked?C.green:C.text,textDecoration:checked?"line-through":"none",opacity:checked?0.75:1}}>{label}</span>
  </button>;
}

function LB({l,n}) { const c=LC[l]||LC[0]; return <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,background:c.bg,border:`1.5px solid ${c.b}`}}><span style={{fontSize:12,fontWeight:800,color:c.t}}>L{l}</span><span style={{fontSize:11,color:c.t,fontWeight:600}}>{n}</span></div>; }

export default function Walk() {
  const [scr,setScr]=useState("auth");
  const [un,setUn]=useState("");
  const [pw,setPw]=useState("");
  const [aMode,setAMode]=useState("login");
  const [aErr,setAErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [uid,setUid]=useState("");
  const [user,setUser]=useState("");
  const [td,setTd]=useState({});
  const [teid,setTeid]=useState(null);
  const [wk,setWk]=useState({});
  const [streak,setStreak]=useState(0);
  const [partner,setPartner]=useState("");
  const [pPct,setPPct]=useState(0);
  const [pStr,setPStr]=useState(0);
  const [pLv,setPLv]=useState(0);
  const [pIn,setPIn]=useState(false);
  const [pInput,setPInput]=useState("");
  const [pErr,setPErr]=useState("");
  const [settings,setSettings]=useState(false);

  const today=tk(), isFri=fri(), hd=hijri();
  const score=sc(td), level=lv(td);

  const load=useCallback(async(id)=>{
    try{
      const start=new Date();start.setDate(start.getDate()-7);const sd=start.toISOString().split("T")[0];
      const ents=await sb(`daily_entries?user_id=eq.${id}&date=gte.${sd}&order=date.desc`)||[];
      const w={};let te=null;ents.forEach(e=>{w[e.date]=e;if(e.date===today)te=e;});setWk(w);
      if(te){setTd(e2d(te));setTeid(te.id);}
      const all=await sb(`daily_entries?user_id=eq.${id}&order=date.desc&limit=60`)||[];setStreak(stk(all));
      const ps=await sb(`partnerships?or=(user_a.eq.${id},user_b.eq.${id})`)||[];
      if(ps.length>0){
        const pid=ps[0].user_a===id?ps[0].user_b:ps[0].user_a;
        const pp=await sb(`profiles?id=eq.${pid}`)||[];
        if(pp.length>0){
          setPartner(pp[0].username);
          const pe=await sb(`daily_entries?user_id=eq.${pid}&date=eq.${today}`)||[];
          if(pe.length>0){const pd=e2d(pe[0]);setPPct(sc(pd).pct);setPLv(lv(pd).l);setPIn(true);}
          else{setPIn(false);setPPct(0);setPLv(0);}
          const pa=await sb(`daily_entries?user_id=eq.${pid}&order=date.desc&limit=30`)||[];setPStr(stk(pa));
        }
      }
    }catch(err){console.error(err);}
  },[today]);

  async function auth(){
    if(!un.trim()||!pw.trim()){setAErr("Fill in both fields.");return;}
    setBusy(true);setAErr("");const u=un.trim().toLowerCase();
    try{
      if(aMode==="signup"){
        const ex=await sb(`profiles?username=eq.${u}`)||[];
        if(ex.length>0){setAErr("Username taken.");setBusy(false);return;}
        const cr=await sb("profiles","POST",{username:u,password_hash:pw});
        if(cr&&cr.length>0){
          setUid(cr[0].id);setUser(u);setScr("pair");
          localStorage.setItem("nurUser", u); // SYNC FOR HOMEPAGE
        }
      }else{
        const pr=await sb(`profiles?username=eq.${u}`)||[];
        if(pr.length===0){setAErr("No account found.");setBusy(false);return;}
        if(pr[0].password_hash!==pw){setAErr("Wrong password.");setBusy(false);return;}
        setUid(pr[0].id);setUser(u);
        localStorage.setItem("nurUser", u); // SYNC FOR HOMEPAGE
        const ps=await sb(`partnerships?or=(user_a.eq.${pr[0].id},user_b.eq.${pr[0].id})`)||[];
        if(ps.length>0){await load(pr[0].id);setScr("dashboard");}else setScr("pair");
      }
    }catch{setAErr("Connection error. Try again.");}
    setBusy(false);
  }

  async function pair(){
    const p=pInput.trim().toLowerCase();
    if(!p){setPErr("Enter a username.");return;}if(p===user){setPErr("Can't pair with yourself akhi.");return;}
    setBusy(true);setPErr("");
    try{
      const pr=await sb(`profiles?username=eq.${p}`)||[];
      if(pr.length===0){setPErr("Brother not found. He needs to sign up first.");setBusy(false);return;}
      await sb("partnerships","POST",{user_a:uid,user_b:pr[0].id});
      setPartner(p);await load(uid);setScr("dashboard");
    }catch{setPErr("Error pairing. Try again.");}
    setBusy(false);
  }

  async function save(nd){
    const s=sc(nd),l=lv(nd);
    const p={user_id:uid,date:today,fajr:nd.fajr||null,dhuhr:nd.dhuhr||null,asr:nd.asr||null,maghrib:nd.maghrib||null,isha:nd.isha||null,adhkar_sabah:!!nd.adhkar_sabah,adhkar_masa:!!nd.adhkar_masa,quran:nd.quran||null,sunnah_rawatib:!!nd.sunnah_rawatib,score:s.s,level:l.l};
    try{if(teid){await sb(`daily_entries?id=eq.${teid}`,"PATCH",p);}else{const cr=await sb("daily_entries","POST",p);if(cr&&cr.length>0)setTeid(cr[0].id);}}catch(err){console.error(err);}
  }

  function upd(key,val){setTd(prev=>{const n={...prev};if(val===null||val===false||val===undefined)delete n[key];else n[key]=val;save(n);return n;});}
  function cyc(id){const v=td[id];if(!v)upd(id,"prayed");else if(v==="prayed")upd(id,"masjid");else upd(id,null);}

  useEffect(()=>{if(scr==="dashboard"&&uid)load(uid);},[scr,uid,load]);

  const pS={minHeight:"100vh",maxWidth:480,margin:"0 auto",fontFamily:"'Segoe UI','Helvetica Neue',sans-serif",color:C.text};

  // AUTH
  if(scr==="auth") return(
    <div style={{...pS,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg,${C.bg} 0%,${C.bg2} 100%)`,padding:24}}>
      <div style={{fontSize:11,letterSpacing:4,textTransform:"uppercase",color:C.gold,marginBottom:8,fontWeight:600}}>NurHabits</div>
      <h1 style={{fontSize:32,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Walk With Me.</h1>
      <p style={{fontSize:13,color:C.dim,marginBottom:32}}>Private accountability for Muslim men.</p>
      <div style={{width:"100%",maxWidth:320}}>
        <div style={{display:"flex",gap:4,marginBottom:20,background:"rgba(255,255,255,0.03)",borderRadius:8,padding:4}}>
          {["login","signup"].map(m=><button key={m} onClick={()=>{setAMode(m);setAErr("");}} style={{border:"none",cursor:"pointer",fontFamily:"inherit",flex:1,padding:10,borderRadius:6,fontSize:13,fontWeight:600,background:aMode===m?"rgba(212,168,83,0.12)":"transparent",color:aMode===m?C.gold:C.dim}}>{m==="login"?"Sign In":"Sign Up"}</button>)}
        </div>
        <input value={un} onChange={e=>setUn(e.target.value)} placeholder="Username" style={{...iS,marginBottom:10}} />
        <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="Password" onKeyDown={e=>{if(e.key==="Enter")auth();}} style={{...iS,marginBottom:16}} />
        {aErr&&<div style={{fontSize:12,color:"#f87171",marginBottom:12,textAlign:"center"}}>{aErr}</div>}
        <button onClick={auth} disabled={busy} style={{...gB,opacity:busy?0.6:1,cursor:busy?"wait":"pointer"}}>{busy?"...":aMode==="login"?"Sign In":"Create Account"}</button>
      </div>
      <div style={{marginTop:40,fontSize:11,color:C.muted,textAlign:"center",lineHeight:1.8}}>Track your salah. Read your Quran.<br/>Walk with one brother. Private. No showing off.</div>
    </div>
  );

  // PAIR
  if(scr==="pair") return(
    <div style={{...pS,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg,${C.bg} 0%,${C.bg2} 100%)`,padding:24}}>
      <div style={{fontSize:40,marginBottom:16}}>🤝</div>
      <h2 style={{fontSize:22,fontWeight:700,color:"#fff",margin:"0 0 8px"}}>Find Your Companion</h2>
      <p style={{fontSize:13,color:C.dim,marginBottom:28,textAlign:"center",maxWidth:280,lineHeight:1.6}}>Enter your brother's username. You'll see each other's score and streak. Never the details.</p>
      <div style={{width:"100%",maxWidth:300}}>
        <input value={pInput} onChange={e=>setPInput(e.target.value)} placeholder="Brother's username" onKeyDown={e=>{if(e.key==="Enter")pair();}} style={{...iS,marginBottom:12}} />
        {pErr&&<div style={{fontSize:12,color:"#f87171",marginBottom:10,textAlign:"center"}}>{pErr}</div>}
        <button onClick={pair} disabled={busy} style={{...gB,marginBottom:10,opacity:busy?0.6:1}}>{busy?"...":"Pair Up"}</button>
        <button onClick={async()=>{await load(uid);setScr("dashboard");}} style={{cursor:"pointer",fontFamily:"inherit",width:"100%",padding:12,borderRadius:10,background:"transparent",border:`1px solid ${C.bdr}`,color:C.dim,fontSize:13}}>Walk alone for now</button>
      </div>
    </div>
  );

  // DASHBOARD
  const lc=LC[level.l]||LC[0], d7=last7();
  return(
    <div style={{...pS,background:`linear-gradient(180deg,${C.bg} 0%,${C.bg2} 40%,#16213e 100%)`}}>
      <div style={{padding:"28px 24px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.gold,fontWeight:600,marginBottom:4}}>NurHabits</div>
          <div style={{fontSize:13,color:C.dim}}>{isFri&&<span style={{color:C.gold,fontWeight:600}}>Jumu'ah Mubarak · </span>}{today}</div>
          {hd&&<div style={{fontSize:11,color:"rgba(212,168,83,0.6)",marginTop:2}}>{hd}</div>}
        </div>
        <button onClick={()=>setSettings(!settings)} style={{border:`1px solid ${C.bdr}`,cursor:"pointer",fontFamily:"inherit",width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.04)",color:C.dim,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>⚙</button>
      </div>

      {settings&&<div style={{padding:"0 24px 16px"}}><div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:16,border:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:12,color:C.dim,marginBottom:12}}>Signed in as <strong style={{color:C.gold}}>{user}</strong>{partner&&<span> · paired with <strong style={{color:C.teal}}>{partner}</strong></span>}</div>
        {!partner&&<button onClick={()=>{setSettings(false);setScr("pair");}} style={{border:`1px solid rgba(212,168,83,0.2)`,cursor:"pointer",fontFamily:"inherit",width:"100%",padding:10,borderRadius:8,background:C.goldDim,color:C.gold,fontSize:12,fontWeight:600,marginBottom:8}}>Find a companion</button>}
        <button onClick={()=>{setUser("");setUid("");setScr("auth");setSettings(false);setTd({});setWk({});setPartner("");localStorage.removeItem("nurUser");}} style={{border:`1px solid ${C.bdr}`,cursor:"pointer",fontFamily:"inherit",width:"100%",padding:10,borderRadius:8,background:"rgba(255,255,255,0.03)",color:C.dim,fontSize:12}}>Sign out</button>
      </div></div>}

      <div style={{padding:"8px 24px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:48,fontWeight:800,lineHeight:1,color:score.pct===100?C.green:score.pct>0?"#fff":C.muted}}>{score.pct}<span style={{fontSize:20,fontWeight:600,color:C.dim}}>%</span></div>
          <div style={{marginTop:8}}><LB l={level.l} n={level.n}/></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:32,fontWeight:800,color:streak>0?C.gold:C.muted}}>{streak}</div>
          <div style={{fontSize:10,color:C.dim,letterSpacing:1,textTransform:"uppercase"}}>day streak</div>
        </div>
      </div>

      <div style={{padding:"0 24px 24px"}}><div style={{display:"flex",gap:6,justifyContent:"space-between",padding:16,background:C.card,borderRadius:12,border:`1px solid ${C.bdr}`}}>
        {d7.map(d=>{const k=d.toISOString().split("T")[0],e=wk[k],dd=k===today?td:e2d(e),s=sc(dd),l=lv(dd),it=k===today;let bg="rgba(255,255,255,0.03)";if(s.pct>0&&s.pct<40)bg="rgba(212,168,83,0.15)";if(s.pct>=40&&s.pct<75)bg="rgba(212,168,83,0.3)";if(s.pct>=75)bg="rgba(52,211,153,0.3)";if(l.l>=3)bg="rgba(167,139,250,0.35)";
        return <div key={k} style={{flex:1,textAlign:"center"}}><div style={{aspectRatio:"1",borderRadius:8,background:bg,border:it?`2px solid ${C.gold}`:"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:l.l>=1?C.green:s.pct>0?C.gold:C.muted}}>{l.l>=1?`L${l.l}`:s.pct>0?`${s.pct}%`:""}</div><div style={{fontSize:9,marginTop:4,fontWeight:it?700:400,color:it?C.gold:C.muted}}>{dayLbl(d)}</div></div>;})}
      </div></div>

      {partner&&<div style={{padding:"0 24px 24px"}}><div style={{padding:18,borderRadius:12,background:"rgba(212,168,83,0.04)",border:"1px solid rgba(212,168,83,0.1)"}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,marginBottom:14,fontWeight:700}}>Your Companion</div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:pIn?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:pIn?C.green:C.muted,border:`2px solid ${pIn?"rgba(52,211,153,0.3)":C.bdr}`}}>{partner.charAt(0).toUpperCase()}</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{partner}</div><div style={{fontSize:11,color:C.dim,marginTop:2}}>{pIn?"Checked in today":"Hasn't checked in yet"}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:800,color:pIn?C.green:C.muted}}>{pPct}%</div><div style={{fontSize:10,color:C.dim}}>{pStr}d streak</div></div>
        </div>
        {pIn&&<div style={{marginTop:12}}><LB l={pLv} n={["Starting","Foundation","Growth","Elite"][pLv]}/></div>}
      </div></div>}

      <div style={{padding:"0 24px"}}>
        <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.gold,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span>🕌</span> Today's Flow <span style={{marginLeft:"auto",fontSize:10,color:C.dim,fontWeight:400,letterSpacing:0,textTransform:"none"}}>tap: — → Prayed → Masjid</span>
        </div>
        <PB prayer={PRAYERS[0]} value={td.fajr} onCycle={()=>cyc("fajr")} fri={isFri}/>
        <CB label="Adhkar as-Sabah" icon="☀️" checked={!!td.adhkar_sabah} onToggle={()=>upd("adhkar_sabah",!td.adhkar_sabah)}/>
        <div style={{padding:"14px 18px",borderRadius:12,background:td.quran?C.greenDim:C.card,border:`1px solid ${td.quran?C.greenBdr:C.bdr}`,marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:14}}>📖</span><span style={{fontSize:14,fontWeight:600,color:td.quran?C.green:C.text}}>Quran</span></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{QO.map(o=><button key={o.value} onClick={()=>upd("quran",td.quran===o.value?null:o.value)} style={{border:`1.5px solid ${td.quran===o.value?C.green:"rgba(255,255,255,0.08)"}`,cursor:"pointer",fontFamily:"inherit",padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:td.quran===o.value?"rgba(52,211,153,0.2)":"rgba(255,255,255,0.04)",color:td.quran===o.value?C.green:C.dim}}>{o.label}</button>)}</div>
        </div>
        <PB prayer={PRAYERS[1]} value={td.dhuhr} onCycle={()=>cyc("dhuhr")} fri={isFri}/>
        <PB prayer={PRAYERS[2]} value={td.asr} onCycle={()=>cyc("asr")} fri={isFri}/>
        <CB label="Adhkar al-Masa" icon="🌙" checked={!!td.adhkar_masa} onToggle={()=>upd("adhkar_masa",!td.adhkar_masa)}/>
        <PB prayer={PRAYERS[3]} value={td.maghrib} onCycle={()=>cyc("maghrib")} fri={isFri}/>
        <PB prayer={PRAYERS[4]} value={td.isha} onCycle={()=>cyc("isha")} fri={isFri}/>
        <CB label="12 Rakaat Sunnah" icon="🤲" checked={!!td.sunnah_rawatib} onToggle={()=>upd("sunnah_rawatib",!td.sunnah_rawatib)}/>
      </div>

      {level.l>=1&&<div style={{textAlign:"center",padding:"32px 24px"}}>
        <div style={{fontSize:36,marginBottom:8}}>{level.l===3?"👑":level.l===2?"🔥":"✅"}</div>
        <div style={{fontSize:16,fontWeight:700,color:C.green}}>Level {level.l} — {level.n}</div>
        <div style={{fontSize:12,color:C.dim,marginTop:4}}>Consistency is worship.</div>
      </div>}

      <div style={{textAlign:"center",padding:"32px 24px 40px"}}><div style={{fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>NurHabits · Walk With Me</div></div>
    </div>
  );
}
