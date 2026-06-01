"use client";
import { useState } from "react";

export default function FootballCardApp() {
  const [images, setImages] = useState([]);
  const [sales, setSales] = useState("");
  const [copilotOutput, setCopilotOutput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [output, setOutput] = useState("");
  const [listing, setListing] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [soldCards, setSoldCards] = useState([]);

  // ===== CORE =====
  const parsePrices = (text) =>
    text.split("\\n").map(s => parseFloat(s.replace("£",""))).filter(n=>!isNaN(n));

  const avg = (a)=> a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;

  const clean = (arr)=>{
    const a = avg(arr);
    return arr.filter(p=>p>a*0.5 && p<a*1.5);
  };

  const trend = (arr)=>{
    if(arr.length<3) return "➡️ Stable";
    const first = avg(arr.slice(0,2));
    const last = avg(arr.slice(-2));
    if(last>first) return "📈 Rising";
    if(last<first) return "📉 Falling";
    return "➡️ Stable";
  };

  const flipScore = (a)=>{
    if(!purchasePrice) return 0;
    return Math.max(Math.min(((a-purchasePrice)/a)*10,10),0);
  };

  const exactPrice = (a,t,s)=>{
    let p=a;
    if(t.includes("Rising")) p*=1.05;
    if(t.includes("Falling")) p*=0.9;
    if(s>8) p*=1.05;
    if(s<4) p*=0.9;
    return p.toFixed(2);
  };

  // ===== NEW: CONFIDENCE =====
  const confidence = (score)=>{
    if(score>8) return "High";
    if(score>5) return "Medium";
    return "Low";
  };

  // ===== SMART PLAYER DETECTION (IMPROVED)
  const autoFillPlayer = ()=>{
    if(!copilotOutput) return;

    const match = copilotOutput.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
    if(match) setPlayerName(match[0]);
  };

  // ===== ANALYSIS =====
  const analyse = ()=>{
    const raw = parsePrices(sales);
    const filtered = clean(raw);
    const a = avg(filtered);

    const t = trend(raw);
    const s = flipScore(a);
    const price = exactPrice(a,t,s);

    setOutput(`📊 ${playerName||"(detect)"}\n\n💰 £${price}\nAVG: £${a.toFixed(2)}\n\n📈 ${t}\n🔥 ${s.toFixed(1)}/10\n📊 Confidence: ${confidence(s)}`);
  };

  // ===== NEW: QUICK SELL MODE =====
  const quickSell = ()=>{
    const raw = parsePrices(sales);
    const a = avg(clean(raw));

    const quickPrice = (a*0.9).toFixed(2);

    setOutput(`⚡ QUICK SELL MODE\n\nSell at: £${quickPrice}\nStrategy: Undercut market for fast sale`);
  };

  // ===== LISTING WITH PRICE =====
  const generateListing = ()=>{
    const raw = parsePrices(sales);
    const a = avg(clean(raw));

    const price = exactPrice(a,trend(raw),flipScore(a));

    const title = `${playerName} Football Card £${price}`;

    const desc = `${playerName} football card.\n\nCondition: Good.\n\nPriced at £${price} for quick sale.\n\nDispatched fast.`;

    setListing(`TITLE:\n${title}\n\nDESCRIPTION:\n${desc}`);
  };

  // ===== BATCH RANK =====
  const runBatch = ()=>{
    const blocks = sales.split("\\n\\n");

    const res = blocks.map((b,i)=>{
      const a = avg(clean(parsePrices(b)));
      const s = flipScore(a);
      return {i:i+1,a,s};
    }).sort((x,y)=>y.s-x.s);

    let out="BEST FLIPS:\n\n";
    res.forEach(r=> out+=`Card ${r.i}: £${r.a.toFixed(2)} (${r.s.toFixed(1)})\n`);

    setOutput(out);
  };

  // ===== UI =====
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">⚽ Pro Card Scanner</h1>

      <input type="file" accept="image/*" multiple onChange={(e)=>setImages([...e.target.files])} />

      <button className="bg-blue-600 text-white p-2 rounded w-full" onClick={()=>navigator.clipboard.writeText("Identify this football card")}>🔍 Detect</button>

      <textarea placeholder="Paste Copilot output" value={copilotOutput} onChange={e=>setCopilotOutput(e.target.value)} />

      <button onClick={autoFillPlayer}>Auto Fill Player</button>

      <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Player" />

      <textarea placeholder="£10\n£12\n£9" value={sales} onChange={e=>setSales(e.target.value)} />

      <input placeholder="Buy price" value={purchasePrice} onChange={e=>setPurchasePrice(parseFloat(e.target.value)||"")} />

      <button onClick={analyse}>Analyse</button>
      <button onClick={quickSell}>⚡ Quick Sell</button>
      <button onClick={runBatch}>Rank Batch</button>
      <button onClick={generateListing}>Generate Listing</button>

      <pre>{output}</pre>
      <pre>{listing}</pre>

      <button onClick={()=>navigator.clipboard.writeText(output)}>Copy</button>
    </div>
  );
}
