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
    if (arr.length < 3) return "Not enough data";
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

  const generateDetectionPrompt = () => {
    if (images.length === 0) return;

    const prompt = `Identify this football trading card from the images provided.

Return:
- Player name
- Year
- Set/Brand
- Parallel/variation
- Card number (if visible)

Be accurate and do not guess.`;

    navigator.clipboard.writeText(prompt);
    setOutput("✅ Prompt copied — paste into Copilot with images.");
  };

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

🤖 ${finalDecision}`);
      setLoading(false);
    }, 300);
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  const fetchEbay = () => {
    setSales("£10\\n£12\\n£9");
  };

  const addSale = () => {
    if (!purchasePrice || !playerName) return;

    const profit = parseFloat(purchasePrice);

    setSoldCards([
      ...soldCards,
      { player: playerName, profit },
    ]);
  };

  const playerStats = () => {
    const map = {};
    soldCards.forEach((c) => {
      map[c.player] = (map[c.player] || 0) + c.profit;
    });
    return map;
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>⚽ AI Card Scanner</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleImages}
      />

      <div>
        {images.map((img, i) => (
          <img
            key={i}
            src={URL.createObjectURL(img)}
            width={80}
            alt="card"
          />
        ))}
      </div>

      <button onClick={generateDetectionPrompt}>
        🔍 Detect Card
      </button>

      <input
        placeholder="Player"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />

      <textarea
        placeholder={"£10\n£12\n£9"}
        value={sales}
        onChange={(e) => setSales(e.target.value)}
      />

      <input
        placeholder="Buy Price"
        value={purchasePrice}
        onChange={(e) => setPurchasePrice(e.target.value)}
      />

      <button onClick={fetchEbay}>Auto Prices</button>

      <button onClick={analyse}>
        {loading ? "..." : "Analyse"}
      </button>

      <pre>{output}</pre>

      <button onClick={addSale}>Save Profit</button>

      <h3>📈 Player Profits</h3>
      {Object.entries(playerStats()).map(([p, val]) => (
        <div key={p}>
          {p}: £{val}
        </div>
      ))}
    </div>
  );
}
