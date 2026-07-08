
import { useState, useMemo, useEffect, useRef } from "react";
import { TrendingDown, TrendingUp, Minus, ChevronDown, Search,
         Tag, CreditCard, CheckCircle2, Clock, XCircle,
         MessageCircle, X, Send } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const C = {
  bg:"#0D1117", surface:"#161B22", border:"#21262D",
  gold:"#F0A500", teal:"#39D0A8", text:"#E6EDF3",
  muted:"#8B949E", red:"#E05C5C",
};

const MOCK_CATEGORIES = [
  { id:"phone", name:"Smartphones", example:"iPhone 16 tier", retailers:[{name:"Amazon",price:799,shipping:0},{name:"Best Buy",price:829,shipping:0},{name:"Walmart",price:789,shipping:5},{name:"Target",price:819,shipping:0}], history:[849,839,829,805,799,789] },
  { id:"laptop", name:"Laptops", example:"14\" ultrabook", retailers:[{name:"Amazon",price:699,shipping:0},{name:"Best Buy",price:679,shipping:0},{name:"Newegg",price:689,shipping:8},{name:"Walmart",price:709,shipping:0}], history:[749,740,720,700,685,679] },
  { id:"headphones", name:"Headphones", example:"Wireless ANC", retailers:[{name:"Amazon",price:249,shipping:0},{name:"Best Buy",price:279,shipping:0},{name:"Target",price:259,shipping:0},{name:"Walmart",price:269,shipping:5}], history:[299,289,279,265,255,249] },
  { id:"sneakers", name:"Sneakers", example:"Running shoe", retailers:[{name:"Amazon",price:110,shipping:0},{name:"Nike.com",price:130,shipping:0},{name:"Foot Locker",price:120,shipping:6},{name:"Walmart",price:115,shipping:0}], history:[130,128,122,118,112,110] },
  { id:"vacuum", name:"Robot Vacuums", example:"Self-empty model", retailers:[{name:"Amazon",price:349,shipping:0},{name:"Best Buy",price:399,shipping:0},{name:"Target",price:379,shipping:0},{name:"Walmart",price:359,shipping:0}], history:[449,429,399,379,365,349] },
  { id:"tv", name:"TVs", example:"55\" 4K QLED", retailers:[{name:"Amazon",price:799,shipping:0},{name:"Best Buy",price:749,shipping:0},{name:"Walmart",price:769,shipping:0},{name:"Costco",price:729,shipping:0}], history:[899,870,820,780,750,729] },
  { id:"blender", name:"Blenders", example:"High-power countertop", retailers:[{name:"Amazon",price:129,shipping:0},{name:"Target",price:139,shipping:0},{name:"Walmart",price:119,shipping:0},{name:"Williams Sonoma",price:159,shipping:0}], history:[119,119,122,119,119,119] },
  { id:"mattress", name:"Mattresses", example:"Queen memory-foam", retailers:[{name:"Amazon",price:449,shipping:0},{name:"Wayfair",price:499,shipping:0},{name:"Target",price:479,shipping:0},{name:"Mattress Firm",price:549,shipping:0}], history:[599,569,540,510,480,449] },
  { id:"backpack", name:"Backpacks", example:"Everyday laptop bag", retailers:[{name:"Amazon",price:49,shipping:0},{name:"REI",price:65,shipping:0},{name:"Target",price:55,shipping:0},{name:"Walmart",price:45,shipping:0}], history:[55,53,50,48,46,45] },
  { id:"coffee", name:"Coffee Makers", example:"Drip w/ grinder", retailers:[{name:"Amazon",price:89,shipping:0},{name:"Target",price:99,shipping:0},{name:"Walmart",price:84,shipping:0},{name:"Best Buy",price:94,shipping:0}], history:[79,82,85,84,84,84] },
];

function cheapestTotal(r) { return r.price + (r.shipping || 0); }

function getVerdict(history, best) {
  const recent = history.slice(-3);
  const trend = recent.length >= 2 ? recent[recent.length-1] - recent[0] : 0;
  const low = Math.min(...history);
  if (best <= low + 1 && trend <= 0) return { label:"Buy now", tone:"good", icon:"down", note:"Lowest tracked price — and still falling." };
  if (best <= low + 1) return { label:"Buy now", tone:"good", icon:"down", note:"At its lowest tracked price." };
  if (trend > 10) return { label:"Buy soon", tone:"warn", icon:"up", note:"Trending up — could keep rising." };
  if (trend < -5) return { label:"Worth waiting", tone:"neutral", icon:"down", note:"Still trending down." };
  return { label:"Fair price", tone:"neutral", icon:"flat", note:"Roughly stable recently." };
}

const tones = {
  good:    { bg:"rgba(57,208,168,.13)", border:"rgba(57,208,168,.4)",  text:"#39D0A8" },
  warn:    { bg:"rgba(240,165,0,.13)",  border:"rgba(240,165,0,.4)",   text:"#F0A500" },
  neutral: { bg:"rgba(139,148,158,.1)", border:"rgba(139,148,158,.3)", text:"#8B949E" },
};

function TrendIcon({ icon, size=13 }) {
  if (icon==="down") return <TrendingDown size={size}/>;
  if (icon==="up") return <TrendingUp size={size}/>;
  return <Minus size={size}/>;
}

function Sparkline({ data }) {
  const w=120, h=32, p=3;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts = data.map((v,i)=>`${p+(i/(data.length-1))*(w-p*2)},${h-p-((v-min)/range)*(h-p*2)}`);
  return (
    <svg width={w} height={h}>
      <polyline points={pts.join(" ")} fill="none" stroke="#F0A500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]} r="2.5" fill="#F0A500"/>
    </svg>
  );
}

function LowiOwl({ size=80, wink=false, bounce=false }) {
  const [blink, setBlink] = useState(false);
  useEffect(()=>{
    const loop = ()=>{
      setBlink(true);
      setTimeout(()=>setBlink(false), 180);
      setTimeout(loop, 2800 + Math.random()*2000);
    };
    const t = setTimeout(loop, 1200);
    return ()=>clearTimeout(t);
  },[]);
  const eyeH = (blink||wink) ? 1 : 10;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{filter:"drop-shadow(0 4px 14px rgba(240,165,0,.35))",transition:"transform .3s",transform:bounce?"scale(1.08)":"scale(1)"}}>
      <ellipse cx="40" cy="50" rx="26" ry="24" fill="#F0A500"/>
      <ellipse cx="40" cy="56" rx="15" ry="14" fill="#FDD86A" opacity=".7"/>
      <ellipse cx="16" cy="54" rx="9" ry="16" fill="#C97F00" transform="rotate(-15 16 54)"/>
      <ellipse cx="64" cy="54" rx="9" ry="16" fill="#C97F00" transform="rotate(15 64 54)"/>
      <circle cx="40" cy="28" r="20" fill="#F0A500"/>
      <polygon points="28,12 22,2 34,9" fill="#C97F00"/>
      <polygon points="52,12 58,2 46,9" fill="#C97F00"/>
      <ellipse cx="40" cy="30" rx="14" ry="13" fill="#FDD86A" opacity=".6"/>
      <ellipse cx="33" cy="26" rx="6" ry="6" fill="white"/>
      <ellipse cx="33" cy="27" rx="4" ry={wink?1:eyeH/2} fill="#1a1a2e"/>
      <circle cx="34.5" cy="25.5" r="1.2" fill="white" opacity=".8"/>
      <ellipse cx="47" cy="26" rx="6" ry="6" fill="white"/>
      <ellipse cx="47" cy="27" rx="4" ry={blink?1:eyeH/2} fill="#1a1a2e"/>
      <circle cx="48.5" cy="25.5" r="1.2" fill="white" opacity=".8"/>
      <polygon points="40,31 36,36 44,36" fill="#E07800"/>
      <rect x="26" y="66" width="28" height="12" rx="3" fill="#161B22" stroke="#F0A500" strokeWidth="1.2"/>
      <text x="40" y="75.5" textAnchor="middle" fontSize="7" fontFamily="'JetBrains Mono',monospace" fill="#F0A500" fontWeight="bold">LOWI</text>
    </svg>
  );
}

function LowiChat({ categories }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role:"assistant", text:"Hey! I'm Lowi 🦉 Ask me anything — should you buy now, wait for a deal, or make an offer? I know every price on this page." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [wink, setWink] = useState(false);
  const bottom = useRef(null);
  useEffect(()=>{ bottom.current?.scrollIntoView({ behavior:"smooth" }); },[msgs]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const next = [...msgs, { role:"user", text:q }];
    setMsgs(next);
    setLoading(true);
    const ctx = categories.map(c=>{
      const sorted = [...c.retailers].sort((a,b)=>cheapestTotal(a)-cheapestTotal(b));
      const best = sorted[0];
      const v = getVerdict(c.history, cheapestTotal(best));
      return `${c.name}: best $${cheapestTotal(best)} at ${best.name} — verdict: ${v.label}`;
    }).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system:`You are Lowi, the price-savvy owl mascot of LowisPice.com. Help shoppers decide whether to buy now, wait, or make a guaranteed offer. Be warm, brief, and confident. Use this live price data:\n${ctx}\n\nKey features: Buyers can make offers below list price — card held not charged until seller accepts within 3 days. Auto-releases if no response.`,
          messages: next.map(m=>({ role:m.role==="assistant"?"assistant":"user", content:m.text })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Hmm, couldn't get an answer. Try again!";
      setMsgs(m=>[...m,{ role:"assistant", text:reply }]);
      setWink(true);
      setTimeout(()=>setWink(false), 900);
    } catch {
      setMsgs(m=>[...m,{ role:"assistant", text:"Sorry, couldn't reach my brain right now!" }]);
    }
    setLoading(false);
  }

  return (
    <>
      {!open && (
        <button onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-xl" style={{background:"#F0A500",color:"#0D1117",fontWeight:700,fontSize:14}}>
          <LowiOwl size={36} wink={wink}/> Ask Lowi
        </button>
      )}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex flex-col rounded-tl-2xl rounded-tr-2xl sm:rounded-2xl sm:bottom-6 sm:right-6" style={{width:"min(100vw,380px)",height:"min(100vh,520px)",background:"#161B22",border:"1px solid #21262D",boxShadow:"0 24px 64px rgba(0,0,0,.6)"}}>
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{borderColor:"#21262D"}}>
            <LowiOwl size={44} wink={wink} bounce={loading}/>
            <div className="flex-1">
              <div style={{fontWeight:700,color:"#F0A500",fontSize:15}}>Lowi</div>
              <div style={{fontSize:11,color:"#8B949E"}}>Your price-savvy AI owl</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{color:"#8B949E"}}><X size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((m,i)=>(
              <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                <div className="text-[13px] leading-relaxed rounded-2xl px-3 py-2 max-w-[85%]" style={{background:m.role==="user"?"#F0A500":"#0D1117",color:m.role==="user"?"#0D1117":"#E6EDF3"}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="text-[13px] px-3 py-2 rounded-2xl" style={{background:"#0D1117",color:"#8B949E"}}>Lowi is thinking…</div></div>}
            <div ref={bottom}/>
          </div>
          <div className="px-4 py-3 border-t flex gap-2" style={{borderColor:"#21262D"}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about a deal…" className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none" style={{background:"#0D1117",border:"1px solid #21262D",color:"#E6EDF3"}}/>
            <button onClick={send} disabled={!input.trim()||loading} className="rounded-xl px-3 py-2" style={{background:input.trim()&&!loading?"#F0A500":"rgba(240,165,0,.25)",color:"#0D1117"}}><Send size={15}/></button>
          </div>
        </div>
      )}
    </>
  );
}

function OfferFlow({ bestPrice, sellerName, categoryName, onClose }) {
  const [stage, setStage] = useState("offering");
  const [offer, setOffer] = useState(Math.max(1, Math.round(bestPrice * 0.9)));
  const [offerId, setOfferId] = useState(null);
  const [error, setError] = useState(null);
  const [buyerToken, setBuyerToken] = useState(null);

  async function ensureAuth() {
    if (buyerToken) return buyerToken;
    const id = `buyer-${Math.random().toString(36).slice(2,8)}`;
    const pw = "demo-password-123";
    let res = await fetch(`${API_BASE}/api/buyers/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyerId:id,password:pw})});
    if (res.status===401) res = await fetch(`${API_BASE}/api/buyers/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyerId:id,password:pw})});
    const d = await res.json();
    if (!res.ok) throw new Error(d.error||"Auth failed");
    setBuyerToken(d.token);
    return d.token;
  }

  async function submitOffer() {
    setError(null); setStage("creating");
    try {
      const token = await ensureAuth();
      const res = await fetch(`${API_BASE}/api/offers`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},body:JSON.stringify({sellerName,categoryName,amount:offer,listPrice:bestPrice})});
      const d = await res.json();
      if (!res.ok) throw new Error(d.error||"Failed");
      setOfferId(d.offer.id); setStage("awaiting_hold");
      window.open(`/checkout.html?offerId=${d.offer.id}&amount=${offer}&token=${encodeURIComponent(token)}`,"_blank","width=480,height=640");
    } catch(e) { setError(e.message); setStage("offering"); }
  }

  useEffect(()=>{
    if (!offerId) return;
    function handler(e) {
      if (e.data?.offerId===offerId && e.data?.type==="hold_placed") {
        setStage("pending_seller");
        setTimeout(async()=>{
          const accept = offer >= bestPrice * 0.85;
          const r = await fetch(`${API_BASE}/api/offers/${offerId}/respond`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${buyerToken}`},body:JSON.stringify({accept})});
          const rd = await r.json();
          setStage(rd.offer.status);
        },1600);
      }
    }
    window.addEventListener("message",handler);
    return ()=>window.removeEventListener("message",handler);
  },[offerId,offer,bestPrice,buyerToken]);

  const wrap = (children) => (
    <div className="rounded-xl p-4 mt-2" style={{background:"#0D1117",border:"1px solid #21262D"}}>
      {error && <div className="text-xs mb-2" style={{color:"#E05C5C"}}>{error}</div>}
      {children}
    </div>
  );

  if (stage==="offering") return wrap(<>
    <div className="flex items-center gap-2 text-sm mb-3" style={{color:"#F0A500"}}><Tag size={14}/>Make an offer to {sellerName}</div>
    <div className="flex items-center gap-3 mb-3">
      <span style={{color:"#8B949E"}}>$</span>
      <input type="number" value={offer} onChange={e=>setOffer(Number(e.target.value))} className="bg-transparent outline-none border-b text-xl w-24 tabular-nums" style={{borderColor:"#21262D",color:"#E6EDF3",fontFamily:"'JetBrains Mono',monospace"}}/>
      <span className="text-xs" style={{color:"#8B949E"}}>listed ${bestPrice}</span>
    </div>
    <div className="text-xs p-2 rounded-lg mb-3 flex items-start gap-2" style={{background:"rgba(240,165,0,.08)",color:"#8B949E"}}>
      <CreditCard size={13} className="mt-0.5 shrink-0" style={{color:"#F0A500"}}/>
      Card held, not charged. {sellerName} has 3 days to accept — hold auto-releases if no response.
    </div>
    <div className="flex gap-2">
      <button onClick={submitOffer} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg" style={{background:"#F0A500",color:"#0D1117"}}><CreditCard size={13}/> Authorize &amp; send</button>
      <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg" style={{color:"#8B949E"}}>Cancel</button>
    </div>
  </>);

  if (stage==="creating") return wrap(<div className="flex items-center gap-2 text-sm" style={{color:"#8B949E"}}><Clock size={13} className="animate-spin"/>Setting up offer…</div>);
  if (stage==="awaiting_hold") return wrap(<div className="flex items-center gap-2 text-sm" style={{color:"#8B949E"}}><CreditCard size={13} className="animate-pulse" style={{color:"#F0A500"}}/>Waiting for card auth in popup…</div>);
  if (stage==="pending_seller") return wrap(<div className="text-sm" style={{color:"#8B949E"}}>🦉 Lowi delivered your ${offer} offer to {sellerName} — 3-day countdown started.</div>);
  if (stage==="declined") return wrap(<div className="flex items-center gap-2 text-sm" style={{color:"#E05C5C"}}><XCircle size={13}/>{sellerName} declined. Hold released — no charge.</div>);
  if (stage==="accepted") return wrap(<>
    <div className="flex items-center gap-2 text-sm mb-1" style={{color:"#39D0A8"}}><CheckCircle2 size={13}/>Accepted! Card charged ${offer}.</div>
    <button onClick={onClose} className="text-xs mt-1" style={{color:"#8B949E"}}>Close</button>
  </>);
  return null;
}

function CategoryRow({ cat, isOpen, onToggle }) {
  const sorted = [...cat.retailers].sort((a,b)=>cheapestTotal(a)-cheapestTotal(b));
  const best = sorted[0], bestTotal = cheapestTotal(best);
  const verdict = getVerdict(cat.history, bestTotal);
  const tone = tones[verdict.tone];
  const [showOffer, setShowOffer] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{borderColor:"#21262D"}}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 py-4 px-1 text-left transition-colors hover:bg-[#1a1f28]">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[15px] tracking-tight" style={{fontWeight:600,color:"#E6EDF3"}}>{cat.name}</span>
            {cat.example && <span className="text-xs" style={{color:"#8B949E"}}>{cat.example}</span>}
          </div>
        </div>
        <div className="hidden sm:block"><Sparkline data={cat.history}/></div>
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border shrink-0" style={{background:tone.bg,borderColor:tone.border,color:tone.text}}>
          <TrendIcon icon={verdict.icon}/>{verdict.label}
        </div>
        <div className="text-right shrink-0 w-20">
          <div className="text-[15px] tabular-nums" style={{fontFamily:"'JetBrains Mono',monospace",color:"#E6EDF3"}}>${bestTotal}</div>
          <div className="text-[11px]" style={{color:"#8B949E"}}>{best.name}</div>
        </div>
        <ChevronDown size={16} style={{color:"#8B949E",transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}/>
      </button>
      {isOpen && (
        <div className="px-1 pb-4 pt-1">
          <div className="rounded-lg p-3 mb-3 flex items-start gap-2 text-[13px]" style={{background:tone.bg,border:`1px solid ${tone.border}`,color:tone.text}}>
            🦉 {verdict.note}
          </div>
          <div className="space-y-1.5">
            {sorted.map((r,i)=>{
              const t=cheapestTotal(r);
              return (
                <div key={r.name} className="flex items-center justify-between text-[13px] py-1.5 px-2.5 rounded" style={{background:i===0?"rgba(240,165,0,.07)":"transparent"}}>
                  <span style={{color:i===0?"#F0A500":"#8B949E"}}>
                    {r.name}{i===0&&<span className="ml-2 text-[10px] uppercase tracking-wide" style={{color:"#8B949E"}}>best</span>}
                  </span>function LowiChat({categories}){
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"assistant",text:"Hey! I'm Lowi 🦉 Ask me anything — should you buy now, wait, or make an offer?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [wink,setWink]=useState(false);
  const bottom=useRef(null);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function send(){
    const q=input.trim();
    if(!q||loading) return;
    setInput("");
    const next=[...msgs,{role:"user",text:q}];
    setMsgs(next);setLoading(true);
    const ctx=categories.map(c=>{
      const s=[...c.retailers].sort((a,b)=>cheapestTotal(a)-cheapestTotal(b));
      const v=getVerdict(c.history,cheapestTotal(s[0]));
      return `${c.name}: best $${cheapestTotal(s[0])} at ${s[0].name} — ${v.label}`;
    }).join("\n");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`You are Lowi, price-savvy owl of LowisPice.com. Be warm and brief.\n\n${ctx}`,messages:next.map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text}))})});
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.[0]?.text||"Try again!"}]);
      setWink(true);setTimeout(()=>setWink(false),900);
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Can't reach my brain!"}]);}
    setLoading(false);
  }

  return(
    <>
      {!open&&<button onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-xl"