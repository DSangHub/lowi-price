import { useState, useMemo, useEffect, useRef } from "react";.
import { TrendingDown, TrendingUp, Minus, ChevronDown, Search, Tag, CreditCard, CheckCircle2, Clock, XCircle, X, Send } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const C = { bg:"#0D1117", surface:"#161B22", border:"#21262D", gold:"#F0A500", teal:"#39D0A8", text:"#E6EDF3", muted:"#8B949E", red:"#E05C5C" };

const CATS = [
  { id:"phone", name:"Smartphones", example:"iPhone 16 tier", retailers:[{name:"Amazon",price:799,shipping:0},{name:"Best Buy",price:829,shipping:0},{name:"Walmart",price:789,shipping:5}], history:[849,839,829,805,799,789] },
  { id:"laptop", name:"Laptops", example:"14in ultrabook", retailers:[{name:"Amazon",price:699,shipping:0},{name:"Best Buy",price:679,shipping:0},{name:"Walmart",price:709,shipping:0}], history:[749,740,720,700,685,679] },
  { id:"headphones", name:"Headphones", example:"Wireless ANC", retailers:[{name:"Amazon",price:249,shipping:0},{name:"Best Buy",price:279,shipping:0},{name:"Walmart",price:269,shipping:5}], history:[299,289,279,265,255,249] },
  { id:"sneakers", name:"Sneakers", example:"Running shoe", retailers:[{name:"Amazon",price:110,shipping:0},{name:"Nike.com",price:130,shipping:0},{name:"Walmart",price:115,shipping:0}], history:[130,128,122,118,112,110] },
  { id:"vacuum", name:"Robot Vacuums", example:"Self-empty", retailers:[{name:"Amazon",price:349,shipping:0},{name:"Best Buy",price:399,shipping:0},{name:"Walmart",price:359,shipping:0}], history:[449,429,399,379,365,349] },
  { id:"tv", name:"TVs", example:"55in 4K QLED", retailers:[{name:"Amazon",price:799,shipping:0},{name:"Best Buy",price:749,shipping:0},{name:"Costco",price:729,shipping:0}], history:[899,870,820,780,750,729] },
  { id:"blender", name:"Blenders", example:"High-power", retailers:[{name:"Amazon",price:129,shipping:0},{name:"Target",price:139,shipping:0},{name:"Walmart",price:119,shipping:0}], history:[119,119,122,119,119,119] },
  { id:"mattress", name:"Mattresses", example:"Queen foam", retailers:[{name:"Amazon",price:449,shipping:0},{name:"Wayfair",price:499,shipping:0},{name:"Target",price:479,shipping:0}], history:[599,569,540,510,480,449] },
  { id:"backpack", name:"Backpacks", example:"Laptop bag", retailers:[{name:"Amazon",price:49,shipping:0},{name:"REI",price:65,shipping:0},{name:"Walmart",price:45,shipping:0}], history:[55,53,50,48,46,45] },
  { id:"coffee", name:"Coffee Makers", example:"Drip+grinder", retailers:[{name:"Amazon",price:89,shipping:0},{name:"Target",price:99,shipping:0},{name:"Walmart",price:84,shipping:0}], history:[79,82,85,84,84,84] },
];

function cheapestTotal(r){ return r.price+(r.shipping||0); }

function getVerdict(history,best){
  const recent=history.slice(-3);
  const trend=recent.length>=2?recent[recent.length-1]-recent[0]:0;
  const low=Math.min(...history);
  if(best<=low+1&&trend<=0) return {label:"Buy now",tone:"good",icon:"down",note:"Lowest tracked price, still falling."};
  if(best<=low+1) return {label:"Buy now",tone:"good",icon:"down",note:"At its lowest tracked price."};
  if(trend>10) return {label:"Buy soon",tone:"warn",icon:"up",note:"Trending up, could keep rising."};
  if(trend<-5) return {label:"Worth waiting",tone:"neutral",icon:"down",note:"Still trending down."};
  return {label:"Fair price",tone:"neutral",icon:"flat",note:"Roughly stable recently."};
}

const tones={
  good:{bg:"rgba(57,208,168,.13)",border:"rgba(57,208,168,.4)",text:"#39D0A8"},
  warn:{bg:"rgba(240,165,0,.13)",border:"rgba(240,165,0,.4)",text:"#F0A500"},
  neutral:{bg:"rgba(139,148,158,.1)",border:"rgba(139,148,158,.3)",text:"#8B949E"},
};

function TrendIcon({icon,size=13}){
  if(icon==="down") return <TrendingDown size={size}/>;
  if(icon==="up") return <TrendingUp size={size}/>;
  return <Minus size={size}/>;
}

function Sparkline({data}){
  const w=120,h=32,p=3,min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${p+(i/(data.length-1))*(w-p*2)},${h-p-((v-min)/range)*(h-p*2)}`);
  return(
    <svg width={w} height={h}>
      <polyline points={pts.join(" ")} fill="none" stroke="#F0A500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]} r="2.5" fill="#F0A500"/>
    </svg>
  );
}

function LowiOwl({size=80,wink=false,bounce=false}){
  const [blink,setBlink]=useState(false);
  useEffect(()=>{
    const loop=()=>{ setBlink(true); setTimeout(()=>setBlink(false),180); setTimeout(loop,2800+Math.random()*2000); };
    const t=setTimeout(loop,1200);
    return ()=>clearTimeout(t);
  },[]);
  return(
    <svg width={size} height={size} viewBox="0 0 80 80" style={{filter:"drop-shadow(0 4px 14px rgba(240,165,0,.35))",transform:bounce?"scale(1.08)":"scale(1)"}}>
      <ellipse cx="40" cy="50" rx="26" ry="24" fill="#F0A500"/>
      <ellipse cx="40" cy="56" rx="15" ry="14" fill="#FDD86A" opacity=".7"/>
      <ellipse cx="16" cy="54" rx="9" ry="16" fill="#C97F00" transform="rotate(-15 16 54)"/>
      <ellipse cx="64" cy="54" rx="9" ry="16" fill="#C97F00" transform="rotate(15 64 54)"/>
      <circle cx="40" cy="28" r="20" fill="#F0A500"/>
      <polygon points="28,12 22,2 34,9" fill="#C97F00"/>
      <polygon points="52,12 58,2 46,9" fill="#C97F00"/>
      <ellipse cx="40" cy="30" rx="14" ry="13" fill="#FDD86A" opacity=".6"/>
      <ellipse cx="33" cy="26" rx="6" ry="6" fill="white"/>
      <ellipse cx="33" cy="27" rx="4" ry={wink?1:(blink?1:5)} fill="#1a1a2e"/>
      <circle cx="34.5" cy="25.5" r="1.2" fill="white" opacity=".8"/>
      <ellipse cx="47" cy="26" rx="6" ry="6" fill="white"/>
      <ellipse cx="47" cy="27" rx="4" ry={blink?1:5} fill="#1a1a2e"/>
      <circle cx="48.5" cy="25.5" r="1.2" fill="white" opacity=".8"/>
      <polygon points="40,31 36,36 44,36" fill="#E07800"/>
      <rect x="26" y="66" width="28" height="12" rx="3" fill="#161B22" stroke="#F0A500" strokeWidth="1.2"/>
      <text x="40" y="75.5" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#F0A500" fontWeight="bold">LOWI</text>
    </svg>
  );
}

function LowiChat({categories}){
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([{role:"assistant",text:"Hey! I am Lowi the price owl! Ask me anything - should you buy now, wait, or make an offer?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottom=useRef(null);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function send(){
    const q=input.trim();
    if(!q||loading) return;
    setInput("");
    const next=[...msgs,{role:"user",text:q}];
    setMsgs(next);
    setLoading(true);
    const ctx=categories.map(c=>{
      const s=[...c.retailers].sort((a,b)=>cheapestTotal(a)-cheapestTotal(b));
      const v=getVerdict(c.history,cheapestTotal(s[0]));
      return c.name+": $"+cheapestTotal(s[0])+" at "+s[0].name+" - "+v.label;
    }).join("\n");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system:"You are Lowi, price-savvy owl of LowisPice.com. Be warm, brief, confident.\n\n"+ctx,
          messages:next.map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text})),
        }),
      });
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.[0]?.text||"Try again!"}]);
    }catch(e){
      setMsgs(m=>[...m,{role:"assistant",text:"Cannot reach server right now!"}]);
    }
    setLoading(false);
  }

  return(
    <div>
      {!open&&(
        <button onClick={()=>setOpen(true)} style={{position:"fixed",bottom:24,right:24,zIndex:50,display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:999,background:C.gold,color:"#0D1117",fontWeight:700,fontSize:14,border:"none",cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
          <LowiOwl size={36}/>Ask Lowi
        </button>
      )}
      {open&&(
        <div style={{position:"fixed",bottom:0,right:0,zIndex:50,display:"flex",flexDirection:"column",width:"min(100vw,380px)",height:"min(100vh,520px)",background:C.surface,border:"1px solid "+C.border,borderRadius:"16px 16px 0 0",boxShadow:"0 24px 64px rgba(0,0,0,.6)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid "+C.border}}>
            <LowiOwl size={44} bounce={loading}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:C.gold,fontSize:15}}>Lowi</div>
              <div style={{fontSize:11,color:C.muted}}>Your price-savvy AI owl</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer"}}><X size={18}/></button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{background:m.role==="user"?C.gold:C.bg,color:m.role==="user"?"#0D1117":C.text,padding:"8px 12px",borderRadius:16,maxWidth:"85%",fontSize:13,lineHeight:1.5}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:C.bg,color:C.muted,padding:"8px 12px",borderRadius:16,fontSize:13}}>Lowi is thinking...</div></div>}
            <div ref={bottom}/>
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid "+C.border,display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about a deal..." style={{flex:1,background:C.bg,border:"1px solid "+C.border,borderRadius:12,padding:"8px 12px",color:C.text,fontSize:13,outline:"none"}}/>
            <button onClick={send} disabled={!input.trim()||loading} style={{background:input.trim()&&!loading?C.gold:"rgba(240,165,0,.25)",color:"#0D1117",border:"none",borderRadius:12,padding:"8px 12px",cursor:"pointer"}}><Send size={15}/></button>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferFlow({bestPrice,sellerName,categoryName,onClose}){
  const [stage,setStage]=useState("offering");
  const [offer,setOffer]=useState(Math.max(1,Math.round(bestPrice*0.9)));
  const [offerId,setOfferId]=useState(null);
  const [error,setError]=useState(null);
  const [buyerToken,setBuyerToken]=useState(null);

  async function ensureAuth(){
    if(buyerToken) return buyerToken;
    const id="buyer-"+Math.random().toString(36).slice(2,8);
    const pw="demo-password-123";
    let res=await fetch(API_BASE+"/api/buyers/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyerId:id,password:pw})});
    if(res.status===401) res=await fetch(API_BASE+"/api/buyers/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyerId:id,password:pw})});
    const d=await res.json();
    if(!res.ok) throw new Error(d.error||"Auth failed");
    setBuyerToken(d.token);
    return d.token;
  }

  async function submitOffer(){
    setError(null); setStage("creating");
    try{
      const token=await ensureAuth();
      const res=await fetch(API_BASE+"/api/offers",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({sellerName,categoryName,amount:offer,listPrice:bestPrice})});
      const d=await res.json();
      if(!res.ok) throw new Error(d.error||"Failed");
      setOfferId(d.offer.id); setStage("awaiting_hold");
      window.open("/checkout.html?offerId="+d.offer.id+"&amount="+offer+"&token="+encodeURIComponent(token),"_blank","width=480,height=640");
    }catch(e){ setError(e.message); setStage("offering"); }
  }

  useEffect(()=>{
    if(!offerId) return;
    function handler(e){
      if(e.data&&e.data.offerId===offerId&&e.data.type==="hold_placed"){
        setStage("pending_seller");
        setTimeout(async()=>{
          const accept=offer>=bestPrice*0.85;
          const r=await fetch(API_BASE+"/api/offers/"+offerId+"/respond",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+buyerToken},body:JSON.stringify({accept})});
          const rd=await r.json();
          setStage(rd.offer.status);
        },1600);
      }
    }
    window.addEventListener("message",handler);
    return ()=>window.removeEventListener("message",handler);
  },[offerId,offer,bestPrice,buyerToken]);

  return(
    <div style={{background:C.bg,border:"1px solid "+C.border,borderRadius:12,padding:16,marginTop:8}}>
      {error&&<div style={{color:C.red,fontSize:12,marginBottom:8}}>{error}</div>}
      {stage==="offering"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.gold,marginBottom:12}}><Tag size={14}/>Make an offer to {sellerName}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <span style={{color:C.muted}}>$</span>
            <input type="number" value={offer} onChange={e=>setOffer(Number(e.target.value))} style={{background:"transparent",border:"none",borderBottom:"1px solid "+C.border,fontSize:20,width:96,color:C.text,fontFamily:"monospace",outline:"none"}}/>
            <span style={{fontSize:12,color:C.muted}}>listed ${bestPrice}</span>
          </div>
          <div style={{background:"rgba(240,165,0,.08)",borderRadius:8,padding:8,marginBottom:12,fontSize:12,color:C.muted,display:"flex",gap:8}}>
            <CreditCard size={13} style={{color:C.gold,flexShrink:0,marginTop:1}}/>
            Card held, not charged. Seller has 3 days to accept.
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={submitOffer} style={{background:C.gold,color:"#0D1117",border:"none",borderRadius:8,padding:"6px 12px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><CreditCard size={13}/>Authorize and send</button>
            <button onClick={onClose} style={{background:"transparent",color:C.muted,border:"none",borderRadius:8,padding:"6px 12px",fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}
      {stage==="creating"&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.muted}}><Clock size={13}/>Setting up...</div>}
      {stage==="awaiting_hold"&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.muted}}><CreditCard size={13} style={{color:C.gold}}/>Waiting for card auth...</div>}
      {stage==="pending_seller"&&<div style={{fontSize:14,color:C.muted}}>Offer sent! Seller has 3 days to respond.</div>}
      {stage==="declined"&&<div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.red}}><XCircle size={13}/>Declined. Hold released, no charge.</div>}
      {stage==="accepted"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:C.teal,marginBottom:4}}><CheckCircle2 size={13}/>Accepted! Card charged ${offer}.</div>
          <button onClick={onClose} style={{fontSize:12,color:C.muted,background:"none",border:"none",cursor:"pointer",marginTop:4}}>Close</button>
        </div>
      )}
    </div>
  );
}

function CategoryRow({cat,isOpen,onToggle}){
  const sorted=[...cat.retailers].sort((a,b)=>cheapestTotal(a)-cheapestTotal(b));
  const best=sorted[0],bestTotal=cheapestTotal(best);
  const verdict=getVerdict(cat.history,bestTotal);
  const tone=tones[verdict.tone];
  const [showOffer,setShowOffer]=useState(false);
  return(
    <div style={{borderBottom:"1px solid "+C.border}}>
      <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",gap:16,padding:"16px 4px",textAlign:"left",background:"none",border:"none",color:C.text,cursor:"pointer"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:15,fontWeight:600,color:C.text}}>{cat.name}</span>
            {cat.example&&<span style={{fontSize:12,color:C.muted}}>{cat.example}</span>}
          </div>
        </div>
        <div style={{display:"none"}}><Sparkline data={cat.history}/></div>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,padding:"4px 10px",borderRadius:999,border:"1px solid "+tone.border,background:tone.bg,color:tone.text,flexShrink:0}}>
          <TrendIcon icon={verdict.icon}/>{verdict.label}
        </div>
        <div style={{textAlign:"right",flexShrink:0,width:80}}>
          <div style={{fontSize:15,fontFamily:"monospace",color:C.text}}>${bestTotal}</div>
          <div style={{fontSize:11,color:C.muted}}>{best.name}</div>
        </div>
        <ChevronDown size={16} style={{color:C.muted,transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}/>
      </button>
      {isOpen&&(
        <div style={{padding:"4px 4px 16px"}}>
          <div style={{background:tone.bg,border:"1px solid "+tone.border,borderRadius:8,padding:12,marginBottom:12,fontSize:13,color:tone.text,display:"flex",gap:8}}>
            Lowi says: {verdict.note}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {sorted.map((r,i)=>(
              <div key={r.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,padding:"6px 10px",borderRadius:6,background:i===0?"rgba(240,165,0,.07)":"transparent"}}>
                <span style={{color:i===0?C.gold:C.muted}}>{r.name}{i===0&&<span style={{marginLeft:8,fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.muted}}>best</span>}</span>
                <span style={{fontFamily:"monospace",color:C.text}}>${r.price}{r.shipping>0?" +$"+r.shipping+" ship":""}</span>
              </div>
            ))}
          </div>
          {!showOffer
            ?<button onClick={()=>setShowOffer(true)} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,marginTop:12,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(240,165,0,.4)",background:"transparent",color:C.gold,cursor:"pointer"}}><Tag size={12}/>Make an offer</button>
            :<OfferFlow bestPrice={bestTotal} sellerName={best.name} categoryName={cat.name} onClose={()=>setShowOffer(false)}/>
          }
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [query,setQuery]=useState("");
  const [openId,setOpenId]=useState("phone");
  const [categories,setCategories]=useState(CATS);
  const [liveStatus,setLiveStatus]=useState("loading");

  useEffect(()=>{
    fetch(API_BASE+"/api/categories")
      .then(r=>r.json())
      .then(d=>{
        if(d.categories&&d.categories.length){
          setCategories(d.categories.map(c=>({id:c.categoryId,name:c.name,example:"",retailers:c.retailers,history:c.history.length?c.history:[c.retailers[0]?.price||0]})));
          setLiveStatus("live");
        } else { setLiveStatus("demo"); }
      })
      .catch(()=>setLiveStatus("demo"));
  },[]);

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return q?categories.filter(c=>c.name.toLowerCase().includes(q)):categories;
  },[query,categories]);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"sans-serif"}}>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <LowiOwl size={44}/>
          <div>
            <div style={{fontWeight:700,fontSize:18,color:C.gold}}>LowisPice</div>
            <div style={{fontSize:11,color:C.muted}}>Price smarter. Always.</div>
          </div>
        </div>
        <div style={{fontSize:11,padding:"4px 8px",borderRadius:999,background:liveStatus==="live"?"rgba(57,208,168,.13)":"rgba(139,148,158,.1)",color:liveStatus==="live"?C.teal:C.muted,border:"1px solid "+(liveStatus==="live"?"rgba(57,208,168,.3)":"rgba(139,148,158,.2)")}}>
          {liveStatus==="loading"?"Connecting...":liveStatus==="live"?"Live prices":"Demo data"}
        </div>
      </nav>
      <div style={{maxWidth:640,margin:"0 auto",padding:"32px 24px 16px"}}>
        <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:3,color:C.gold,marginBottom:8}}>Top 10 e-commerce categories</div>
        <h1 style={{fontSize:28,fontWeight:700,letterSpacing:-0.5,margin:"0 0 8px"}}>Every price tracked. Lowi tells you when to buy.</h1>
        <p style={{fontSize:14,color:C.muted,margin:0}}>Real-time prices plus a 3-day guaranteed-offer system. Make an offer below list price, only charged if accepted.</p>
      </div>
      <div style={{maxWidth:640,margin:"0 auto",padding:"0 24px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:12,background:C.surface,border:"1px solid "+C.border}}>
          <Search size={14} style={{color:C.muted}}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search categories..." style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:14,color:C.text}}/>
        </div>
      </div>
      <div style={{maxWidth:640,margin:"0 auto",padding:"0 24px 96px"}}>
        <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>
          {filtered.length===0
            ?<div style={{padding:48,textAlign:"center",fontSize:14,color:C.muted}}>No categories match your search.</div>
            :filtered.map(cat=><CategoryRow key={cat.id} cat={cat} isOpen={openId===cat.id} onToggle={()=>setOpenId(openId===cat.id?null:cat.id)}/>)
          }
        </div>
        <p style={{fontSize:11,marginTop:16,textAlign:"center",color:"rgba(139,148,158,.5)"}}>LowisPice.com - Prices updated every 30 min - Offers guaranteed by Stripe</p>
      </div>
      <LowiChat categories={categories}/>
    </div>
  );


