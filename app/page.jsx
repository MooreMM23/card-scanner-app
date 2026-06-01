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

  // ===== CORE =====
  const parsePrices = (text) =>
    text.split("\\n").map(s => parseFloat(s.replace("£",""))).filter(n=>!isNaN(n));

  const avg = (a)=> a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;

  const clean = (arr)=>{
    const a = avg(arr);
    return arr.filter(p=>p>a*0.5 && p<a*1.5);
  };

  const exactPrice = (a)=> a ? a.toFixed(2) : "0.00";

  // ===== DETECTION =====
  const autoFillPlayer = ()=>{
    const match = copilotOutput.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
    if(match) setPlayerName(match[0]);
  };

  // ===== ANALYSE =====
  const analyse = ()=>{
    const raw = parsePrices(sales);
    const price = exactPrice(avg(clean(raw)));
    setOutput(`💰 List at £${price}`);
  };

  // ===== LISTING =====
  const generateListing = ()=>{
    const raw = parsePrices(sales);
    const price = exactPrice(avg(clean(raw)));

    setListing(`📌 ${playerName} Football Card £${price}\n\nGreat condition.\nFast shipping.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl p-4 shadow space-y-4">

        <h1 className="text-lg font-bold text-center">⚽ Pro Card Scanner</h1>

        {/* IMAGE INPUT */}
        <input type="file" accept="image/*" multiple
          onChange={(e)=>setImages([...e.target.files])}
          className="w-full border p-2 rounded" />

        <div className="flex gap-2 overflow-x-auto">
          {images.map((img,i)=>(
            <img key={i} src={URL.createObjectURL(img)} className="w-16 h-16 rounded object-cover" />
          ))}
        </div>

        {/* DETECTION */}
        <textarea
          placeholder="Paste Copilot output"
          value={copilotOutput}
          onChange={e=>setCopilotOutput(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button onClick={autoFillPlayer} className="w-full bg-blue-600 text-white p-2 rounded">
          Auto Fill Player
        </button>

        <input
          value={playerName}
          onChange={e=>setPlayerName(e.target.value)}
          placeholder="Player"
          className="w-full border p-2 rounded"
        />

        {/* PRICES */}
        <textarea
          placeholder="£10\n£12\n£9"
          value={sales}
          onChange={e=>setSales(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Buy price"
          value={purchasePrice}
          onChange={e=>setPurchasePrice(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={analyse} className="bg-green-600 text-white p-2 rounded">Analyse</button>
          <button onClick={generateListing} className="bg-purple-600 text-white p-2 rounded">Listing</button>
        </div>

        {/* OUTPUT */}
        <div className="bg-gray-50 p-2 rounded text-sm whitespace-pre-wrap">
          {output}
        </div>

        {/* LISTING */}
        <div className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
          {listing}
        </div>

      </div>
    </div>
  );
}
