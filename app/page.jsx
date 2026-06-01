"use client";
import { useState } from "react";

export default function FootballCardApp() {
  const [images, setImages] = useState([]);
  const [sales, setSales] = useState("");
  const [copilotOutput, setCopilotOutput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [output, setOutput] = useState("");
  const [listing, setListing] = useState("");

  // ===== CORE =====
  const parsePrices = (text) =>
    text.split("\\n").map(s => parseFloat(s.replace("£",""))).filter(n=>!isNaN(n));

  const avg = (a)=> a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;

  const clean = (arr)=>{
    const a = avg(arr);
    return arr.filter(p=>p>a*0.5 && p<a*1.5);
  };

  const autoFillPlayer = ()=>{
    const match = copilotOutput.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
    if(match) setPlayerName(match[0]);
  };

  const getPrice = ()=>{
    const raw = parsePrices(sales);
    return avg(clean(raw)).toFixed(2);
  };

  const analyse = ()=>{
    setOutput(`💰 List at £${getPrice()}`);
  };

  const generateListing = ()=>{
    const price = getPrice();
    setListing(`📌 ${playerName || "Card"} £${price}\n\nGreat condition\nFast dispatch`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-3">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 space-y-4">

        <h1 className="text-xl font-bold text-center">⚽ Card Scanner</h1>

        {/* IMAGE UPLOAD */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Upload / Scan Card</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e)=>setImages([...e.target.files])}
            className="w-full border rounded p-2"
          />

          <div className="flex gap-2 overflow-x-auto">
            {images.map((img,i)=> (
              <img key={i} src={URL.createObjectURL(img)} className="w-16 h-16 rounded object-cover" />
            ))}
          </div>
        </div>

        {/* DETECTION */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Paste Copilot Result</label>
          <textarea
            placeholder="Paste AI output here..."
            value={copilotOutput}
            onChange={e=>setCopilotOutput(e.target.value)}
            className="w-full border rounded p-2"
          />

          <button onClick={autoFillPlayer} className="w-full bg-blue-600 text-white rounded p-2">
            Auto Detect Player
          </button>

          <input
            value={playerName}
            onChange={e=>setPlayerName(e.target.value)}
            placeholder="Player name"
            className="w-full border rounded p-2"
          />
        </div>

        {/* PRICING */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Sold Prices</label>
          <textarea
            placeholder="£10\n£12\n£9"
            value={sales}
            onChange={e=>setSales(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={analyse} className="bg-green-600 text-white p-3 rounded font-semibold">
            Analyse
          </button>
          <button onClick={generateListing} className="bg-purple-600 text-white p-3 rounded font-semibold">
            Listing
          </button>
        </div>

        {/* OUTPUT */}
        <div className="bg-gray-50 p-3 rounded text-sm">
          {output || "Results will appear here"}
        </div>

        {/* LISTING */}
        <div className="bg-gray-100 p-3 rounded text-sm">
          {listing || "Listing will appear here"}
        </div>

      </div>
    </div>
  );
}
