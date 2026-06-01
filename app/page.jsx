"use client";
import { useState } from "react";

export default function FootballCardApp() {
  const [images, setImages] = useState([]);
  const [sales, setSales] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [soldCards, setSoldCards] = useState([]);

  // ===== PRICE ENGINE =====
  const parsePrices = (text) =>
    text
      .split("\\n")
      .map((s) => parseFloat(s.replace("£", "")))
      .filter((n) => !isNaN(n));

  const avg = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const cleanPrices = (arr) => {
    const a = avg(arr);
    return arr.filter((p) => p > a * 0.5 && p < a * 1.5);
  };

  const trend = (arr) => {
    if (arr.length < 3) return "Unknown";
    const first = avg(arr.slice(0, 2));
    const last = avg(arr.slice(-2));
    if (last > first) return "📈 Rising";
    if (last < first) return "📉 Falling";
    return "➡️ Stable";
  };

  const flipScore = (a) => {
    if (!purchasePrice) return 0;
    return Math.max(
      Math.min(((a - purchasePrice) / a) * 10, 10),
      0
    ).toFixed(1);
  };

  const exactPrice = (avgPrice, trendDir, score) => {
    let base = avgPrice;

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
    if (images.length === 0) return;

    const prompt = `Identify this football trading card.

Return:
- Player name
- Year
- Set/Brand
- Parallel
- Card number

Be accurate.`;

    navigator.clipboard.writeText(prompt);
    setOutput("✅ Prompt copied. Upload images in Copilot and paste it.");
  };

  // ===== ANALYSIS =====
  const analyse = () => {
    setLoading(true);

    const raw = parsePrices(sales);
    const filtered = cleanPrices(raw);
    const a = avg(filtered);

    const t = trend(raw);
    const score = parseFloat(flipScore(a));
    const price = exactPrice(a, t, score);
    const finalDecision = decision(score, t);

    setTimeout(() => {
      setOutput(`📊 PLAYER: ${playerName || "(detect first)"}

💰 LIST AT: £${price}
Market Avg: £${a.toFixed(2)}

📈 TREND: ${t}
🔥 SCORE: ${score}/10

🤖 DECISION: ${finalDecision}`);
      setLoading(false);
    }, 300);
  };

  // ===== IMAGE HANDLING =====
  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  // ===== DEMO EBAY DATA =====
  const fetchEbay = () => {
    setSales("£10\\n£12\\n£9");
  };

  // ===== TRACKING =====
  const addSale = () => {
    if (!purchasePrice || !playerName) return;

    const profit = parseFloat(purchasePrice);

    setSoldCards([
      ...soldCards,
      { player: playerName, profit }
    ]);
  };

  const playerStats = () => {
    const map = {};
    soldCards.forEach((c) => {
      map[c.player] = (map[c.player] || 0) + c.profit;
    });
    return map;
  };

  // ===== UI STYLES =====
  const card = {
    background: "#f5f5f5",
    padding: 12,
    borderRadius: 12,
    marginTop: 12
  };

  const input = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  };

  const primary = {
    flex: 1,
    padding: 12,
    background: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold"
  };

  const secondary = {
    flex: 1,
    padding: 12,
    background: "#ddd",
    border: "none",
    borderRadius: 10
  };

  // ===== UI =====
  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>⚽ Card Scanner</h2>

      {/* CAMERA */}
      <div style={card}>
        <input type="file" accept="image/*" capture="environment" multiple onChange={handleImages} />
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {images.map((img, i) => (
            <img key={i} src={URL.createObjectURL(img)} width={60} />
          ))}
        </div>
      </div>

      <button style={primary} onClick={generateDetectionPrompt}>
        🔍 Detect Card
      </button>

      <input style={input} placeholder="Player" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />

      <textarea style={input} placeholder={"£10\n£12\n£9"} value={sales} onChange={(e) => setSales(e.target.value)} />

      <input style={input} placeholder="Buy Price (£)" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button style={secondary} onClick={fetchEbay}>Auto</button>
        <button style={primary} onClick={analyse}>
          {loading ? "..." : "Analyse"}
        </button>
      </div>

      <div style={card}>
        <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
      </div>

      <button style={secondary} onClick={addSale}>
        Save Profit
      </button>

      <div style={card}>
        <h3>📈 Player Profit</h3>
        {Object.entries(playerStats()).map(([p, val]) => (
          <div key={p}>{p}: £{val}</div>
        ))}
      </div>
    </div>
  );
}
``
