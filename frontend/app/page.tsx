"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import DemoModeToggle from "@/components/DemoModeToggle";

const LANGUAGES = [
  "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", 
  "Marathi", "Bengali", "Odia", "Gujarati", "Punjabi"
];

export default function Home() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "highlight_scan" | "loading_image" | "analyzing">("idle");
  
  const [language, setLanguage] = useState("Hindi");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState<number | "">("");
  
  const [recentScans, setRecentScans] = useState<Array<{childName: string, date: string, risk_level: string}>>([]);

  useEffect(() => {
    const stored = localStorage.getItem("nourishnet_scans");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentScans(parsed.slice(0, 3));
      } catch {
        // ignore
      }
    }
  }, []);

  const isFormValid = childName.trim() !== "" && typeof childAge === 'number' && childAge >= 6 && childAge <= 60;

  const startDemoSequence = () => {
    setDemoState("highlight_scan");
    setChildName("Demo Child");
    setChildAge(24);
    setTimeout(() => {
      setDemoState("loading_image");
      setImagePreview("/sample-meal.jpg");
      setTimeout(() => {
        setDemoState("analyzing");
        setIsAnalyzing(true);
        setTimeout(() => {
          sessionStorage.setItem("scan_language", language);
          sessionStorage.setItem("scan_child_name", "Demo Child");
          sessionStorage.setItem("scan_child_age", "24");
          router.push("/results?demo=true");
        }, 3000);
      }, 2000);
    }, 2000);
  };

  const handleImageUploaded = async (base64: string) => {
    if (demoState !== "idle" || !isFormValid) return; 
    setImagePreview(base64);
    setIsAnalyzing(true);
    
    try {
      const cleanBase64 = base64.split(",")[1] || base64;
      sessionStorage.setItem("scan_image", cleanBase64);
      sessionStorage.setItem("scan_language", language);
      sessionStorage.setItem("scan_child_name", childName);
      sessionStorage.setItem("scan_child_age", childAge.toString());
      
      router.push("/results");
    } catch {
      router.push("/results?error=true");
    }
  };

  return (
    <div className="flex flex-col h-full relative pb-10">
      <header className="p-6 pb-2 text-center flex flex-col items-center">
        <h1 className="text-4xl font-serif font-extrabold text-primary tracking-tight">NourishNet</h1>
        <p className="text-text-secondary mt-2 text-sm max-w-xs mx-auto">
          AI-powered malnutrition risk analysis for growing children.
        </p>
      </header>

      <div className="w-full overflow-x-auto py-2 px-4 whitespace-nowrap border-b border-gray-100" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${language === lang ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Child Name</label>
          <input 
            type="text" 
            value={childName}
            onChange={e => setChildName(e.target.value)}
            placeholder="Enter name"
            className="w-full text-lg p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Age (Months) [6-60]</label>
          <input 
            type="number" 
            value={childAge}
            onChange={e => setChildAge(e.target.value ? parseInt(e.target.value) : "")}
            placeholder="e.g. 24"
            min="6" max="60"
            className="w-full text-lg p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-2">
        {!imagePreview ? (
          <div className={`w-full flex justify-center transition-opacity ${!isFormValid ? 'opacity-50 pointer-events-none' : ''}`}>
            <ImageUpload 
              onUpload={handleImageUploaded} 
              isHighlighted={demoState === "highlight_scan"} 
            />
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className={`relative rounded-2xl overflow-hidden shadow-lg border-4 ${demoState === 'loading_image' ? 'border-primary' : 'border-white'} transition-all duration-500`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Captured meal" className="w-full h-auto object-cover max-h-64" />
            </div>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="mt-8 flex flex-col items-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-gray-700 animate-pulse">Analyzing with Gemma 4 AI...</p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 mt-auto border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Recent Scans</h3>
        {recentScans.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No scans yet. Start by scanning a meal.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentScans.map((scan, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div>
                  <div className="font-bold text-gray-800">{scan.childName}</div>
                  <div className="text-xs text-gray-500">{scan.date}</div>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold ${scan.risk_level === 'safe' ? 'bg-safe text-white' : scan.risk_level === 'at_risk' ? 'bg-warning text-white' : 'bg-danger text-white'}`}>
                  {scan.risk_level === 'safe' ? 'Safe' : scan.risk_level === 'at_risk' ? 'At Risk' : 'Critical'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="p-4 flex flex-col items-center gap-3 bg-white">
        <div className="text-xs text-gray-400 font-medium tracking-wide">
          Powered by Gemma 4 · Runs Offline
        </div>
        
        <div className="fixed bottom-6 right-6 z-50">
          <DemoModeToggle onTrigger={startDemoSequence} isRunning={demoState !== "idle"} />
        </div>
      </footer>
    </div>
  );
}
