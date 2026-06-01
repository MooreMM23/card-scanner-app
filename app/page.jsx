"use client";
import { useState } from "react";

export default function FootballCardApp() {
  const [images, setImages] = useState([]);
  const [sales, setSales] = useState("");
  const [copilotOutput, setCopilotOutput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [output, setOutput] = useState("");
  const [listing, setListing] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [soldCards, setSoldCards] = useState([]);

  // ===== CORE ENGINE =====
  const parsePrices = (text) =>
    text
      .split("\\n")
      .map((s) => parseFloat(s.replace("£", "")))
      .filter((n) => !isNaN(n));

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const cleanPrices = (arr) => {
    const a = avg(arr);
    return arr.filter((p) => p > a * 0.5 && p < a * 1.5);
  };

  const trend = (arr) => {
    if (arr.length < 3) return "➡️ Stable";
    const first = avg(arr.slice(0, 2));
    const last = avg(arr.slice(-2));
    if (last > first * 1.05) return "📈 Rising";
    if (last < first * 0.95) return "📉 Falling";
    return "➡️ Stable";
  };

  const flipScore = (a) => {
    if (!purchasePrice) return 0;
    return Math.max(Math.min(((a - purchasePrice) / a) * 10, 10), 0);
  };

  const exactPrice = (a, trendDir, score) => {
    let base = a;
    if (trendDir.includes("Rising")) base *= 1.05;
    if (trendDir.includes("Falling")) base *= 0.9;
    if (score > 8) base *= 1.05;
    if (score < 4) base *= 0.9;
    return base.toFixed(2);
  };

  const decision = (score, t) => {
    if (score > 8 && t.includes("Rising")) return "🔥 STRONG BUY";
    if (score > 6) return "✅ BUY";
    if (t.includes("Falling")) return "⚠️ SELL FAST";
    return "❌ SKIP";
  };

  // ===== AI DETECTION =====
  const generateDetectionPrompt = () => {
    const prompt = `Identify this football card. Return player, year, set, variant.`;
    navigator.clipboard.writeText(prompt);
    setOutput("✅ Prompt copied → open Copilot & upload images.");
  };

  const autoFillPlayer = () => {
    if (!copilotOutput) return;
    const words = copilotOutput.split(" ");
    setPlayerName(words.slice(0, 2).join(" "));
  };

  // ===== ANALYSIS =====
  const analyse = () => {
    setLoading(true);

    const raw = parsePrices(sales);
    const filtered = cleanPrices(raw);
    const a = avg(filtered);

    const t = trend(raw);
    const score = flipScore(a);
    const price = exactPrice(a, t, score);
    const finalDecision = decision(score, t);

    const profit = purchasePrice ? (price - purchasePrice).toFixed(2) : "-";

    setTimeout(() => {
      setOutput(`📊 ${playerName || "(detect)"}\n\n💰 LIST: £${price}\nAVG: £${a.toFixed(2)}\nPROFIT: £${profit}\n\n📈 ${t}\n🔥 SCORE: ${score.toFixed(1)}\n\n🤖 ${finalDecision}`);
      setLoading(false);
    }, 300);
  };

  // ===== LISTING GENERATOR (NEW) =====
  const generateListing = () => {
    const raw = parsePrices(sales);
    const a = avg(cleanPrices(raw));

    const title = `${playerName} Football Card | Great Condition`;

    const desc = `${playerName} football card.\n\nCondition: Good condition (see photos).\n\nMarket value approx £${a.toFixed(2)}.\n\nFast shipping available. Open to offers.`;

    const tags = "football card, soccer card, trading card, rare card, collector";

    setListing(`TITLE:\n${title}\n\nDESCRIPTION:\n${desc}\n\nTAGS:\n${tags}`);
  };

  // ===== BATCH RANKING =====
  const runBatch = () => {
    const blocks = sales.split("\\n\\n");

    const results = blocks.map((block, i) => {
      const prices = cleanPrices(parsePrices(block));
      const a = avg(prices);
      const score = flipScore(a);
      return { index: i + 1, avg: a, score };
    });

    results.sort((a, b) => b.score - a.score);

    let out = "BEST FLIPS:\n\n";
    results.forEach((r) => {
      out += `Card ${r.index}: £${r.avg.toFixed(2)} (Score: ${r.score.toFixed(1)})\n`;
    });

    setOutput(out);
  };

  // ===== TRACKING =====
  const addSale = () => {
    if (!purchasePrice || !playerName) return;
    const raw = parsePrices(sales);
    const a = avg(cleanPrices(raw));
    const profit = a - purchasePrice;
    setSoldCards([...soldCards, { player: playerName, profit }]);
  };

  const stats = soldCards.reduce((acc, c) => {
    acc[c.player] = (acc[c.player] || 0) + c.profit;
    return acc;
  }, {});

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">⚽ Pro Card Scanner</h1>

      {/* FILE INPUT (FIXED FOR MOBILE) */}
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        onChange={(e)=>setImages([...e.target.files])}
        className="w-full"
      />

      <div className="flex gap-2 overflow-x-auto">
        {images.map((img,i)=> (
          <img key={i} src={URL.createObjectURL(img)} className="w-16 h-16 object-cover rounded" />
        ))}
      </div>

      <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={generateDetectionPrompt}>🔍 Detect Card</button>

      <textarea className="w-full p-2 border rounded" placeholder="Paste Copilot output..." value={copilotOutput} onChange={(e)=>setCopilotOutput(e.target.value)} />

      <button className="w-full bg-gray-200 p-2 rounded" onClick={autoFillPlayer}>Auto Fill Player</button>

      <input className="w-full p-2 border rounded" value={playerName} onChange={(e)=>setPlayerName(e.target.value)} placeholder="Player" />

      <textarea className="w-full p-2 border rounded" placeholder={"£10\n£12\n£9"} value={sales} onChange={(e)=>setSales(e.target.value)} />

      <input className="w-full p-2 border rounded" placeholder="Buy Price" value={purchasePrice} onChange={(e)=>setPurchasePrice(parseFloat(e.target.value)||"")} />

      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white p-2 rounded" onClick={analyse}>{loading ? "..." : "Analyse"}</button>
        <button className="flex-1 bg-purple-600 text-white p-2 rounded" onClick={runBatch}>Batch</button>
      </div>

      <button className="w-full bg-green-600 text-white p-2 rounded" onClick={generateListing}>Generate Listing</button>

      <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">{output}</pre>

      <pre className="bg-gray-50 p-2 rounded text-sm whitespace-pre-wrap">{listing}</pre>

      <div className="flex gap-2">
        <button className="flex-1 bg-gray-300 p-2 rounded" onClick={()=>navigator.clipboard.writeText(output)}>Copy Result</button>
        <button className="flex-1 bg-gray-300 p-2 rounded" onClick={addSale}>Save Sale</button>
      </div>

      <h3 className="font-semibold">Total: £{soldCards.reduce((a,c)=>a+c.profit,0).toFixed(2)}</h3>

      {Object.entries(stats).map(([p,v])=> (
        <div key={p}>{p}: £{v.toFixed(2)}</div>
      ))}
    </div>
  );
}
