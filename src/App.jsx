
import { useState, useMemo, useEffect, useRef } from "react";
import { TrendingDown, TrendingUp, Minus, ChevronDown, Search, Tag, CreditCard, CheckCircle2, Clock, XCircle, X, Send } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const C = { bg:"#0D1117", surface:"#161B22", border:"#21262D", gold:"#F0A500", teal:"#39D0A8", text:"#E6EDF3", muted:"#8B949E", red:"#E05C5C" };

const MOCK_CATEGORIES = [
  { id:"phone", name:"Smartphones", example:"iPhone 16 tier", retailers:[{name:"Amazon",price:799,shipping:0},{name:"Best Buy",price:829,shipping:0},{name:"Walmart",price:789,shipping:5}], history:[849,839,829,805,799,789] },
  { id:"laptop", name:"Laptops", example:"14\" ultrabook", retailers:[{name:"Amazon",price:699,shipping:0},{name:"Best Buy",price:679,shipping:0},{name:"Walmart",price:709,shipping:0}], history:[749,740,720,700,685,679] },
  { id:"headphones", name:"Headphones", example:"Wireless ANC", retailers:[{name:"Amazon",price:249,shipping:0},{name:"Best Buy",price:279,shipping:0},{name:"Walmart",price:269,shipping:5}], history:[299,289,279,265,255,249] },
  { id:"sneakers", name:"Sneakers", example:"Running shoe", retailers:[{name:"Amazon",price:110,shipping:0},{name:"Nike.com",price:130,shipping:0},{name:"Walmart",price:115,shipping:0}], history:[130,128,122,118,112,110] },
  { id:"vacuum", name:"Robot Vacuums", example:"Self-empty", retailers:[{name:"Amazon",price:349,shipping:0},{name:"Best Buy",price:399,shipping:0},{name:"Walmart",price:359,shipping:0}], history:[449,429,399,379,365,349] },
  { id:"tv", name:"TVs", example:"55\" 4K QLED", retailers:[{name:"Amazon",price:799,shipping:0},{name:"Best Buy",price:749,shipping:0},{name:"Costco",price:729,shipping:0}], history:[899,870,820,780,750,729] },
  { id:"blender", name:"Blenders", example:"High-power", retailers:[{name:"Amazon",price:129,shipping:0},{name:"Target",price:139,shipping:0},{name:"Walmart",price:119,shipping:0}], history:[119,119,122,119,119,119] },
  { id:"mattress", name:"Mattresses", example:"Queen foam", retailers:[{name:"Amazon",price:449,shipping:0},{name:"Wayfair",price:499,shipping:0},{name:"Target",price:479,shipping:0}], history:[599,569,540,510,480,449] },
  { id:"backpack", name:"Backpacks", example:"Laptop bag", retailers:[{name:"Amazon",price:49,shipping:0},{name:"REI",price:65,shipping:0},{name:"Walmart",price:45,shipping:0}], history:[55,53,50,48,46,45] },
  { id:"coffee", name:"Coffee Makers", example:"Drip+grinder", retailers:[{name:"Amazon",price:89,shipping:0},{name:"Target",price:99,shipping:0},{name:"Walmart",price:84,shipping:0}], history:[79,82,85,84,84,84] },
];

function cheapestTotal(r){ return r.price+(r.shipping||0); }
function getVerdict(history,best){
  const recent=history.slice(-3), trend=recent.length>=2?recent[recent.length-1]-recent[0]:0, low=Math.min(...history);
  if(best<=low+1&&trend<=0) return {label:"Buy now",tone:"good",icon:"down",note:"Lowest tracked price — still falling."};
  if(best<=low+1) return {label:"Buy now",tone:"good",icon:"down",note:"At its lowest tracked price."};
  if(trend>10) return {label:"Buy soon",tone:"warn",icon:"up",note:"Trending up — could keep rising."};
  if(trend<-5) return {label:"Worth waiting",tone:"neutral",icon:"down",note:"Still trending down."};
  return {label:"Fair price",tone:"neutral",icon:"flat",note:"Roughly stable recently."};
}
const tones={ good:{bg:"rgba(57,208,168,.13)",border:"rgba(57,208,168,.4)",text:"#39D0A8"}, warn:{bg:"rgba(240,165,0,.13)",border:"rgba(240,165,0,.4)",text:"#F0A500"}, neutral:{bg:"rgba(139,148,158,.1)",border:"rgba(139,148,158,.3)",text:"#8B949E"} };
function TrendIcon({icon,size=13}){ if(icon==="down") return <TrendingDown size={size}/>; if(icon==="up") return <TrendingUp size={size}/>; return <Minus size={size}/>; }
function Sparkline({data}){
  const w=120,h=32,p=3,min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${p+(i/(data.length-1))*(w-p*2)},${h-p-((v-min)/range)*(h-p*2)}`);
  return <svg width={w} height={h}><polyline points={pts.join(" ")} fill="none" stroke="#F0A500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx={pts[pts.length-1].split(",")[0]} cy={pts[pts.length-1].split(",")[1]} r="2.5" fill="#F0A500"/></svg>;
}
function LowiOwl({size=80,wink=false,bounce=false}){
  const [blink,setBlink]=useState(false);
  useEffect(()=>{ const loop=()=>{ setBlink(true); setTimeout(()=>setBlink(false),180); setTimeout(loop,2800+Math.random()*2000); }; const t=setTimeout(loop,1200); return()=>clearTimeout(t); },[]);
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
