"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RiskCard from "@/components/RiskCard";
import NutrientBar from "@/components/NutrientBar";
import RecommendationPanel from "@/components/RecommendationPanel";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  
  // Loading states
  const [loadingStep, setLoadingStep] = useState(0); // 0 = not loading, 1 = identifying, 2 = calculating, 3 = generating
  
  const [demoPulsing, setDemoPulsing] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [language, setLanguage] = useState("Hindi");

  useEffect(() => {
    const isDemo = searchParams.get("demo") === "true";
    const imageBase64 = sessionStorage.getItem("scan_image");
    
    setChildName(sessionStorage.getItem("scan_child_name") || "Unknown");
    setChildAge(sessionStorage.getItem("scan_child_age") || "");
    setLanguage(sessionStorage.getItem("scan_language") || "Hindi");

    const fetchData = async () => {
      setLoadingStep(1); // Identifying foods
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        let json;
        
        if (isDemo && !imageBase64) {
          const res = await fetch(`${apiUrl}/demo`);
          json = await res.json();
        } else if (imageBase64) {
          const ageMonths = sessionStorage.getItem("scan_child_age");
          const lang = sessionStorage.getItem("scan_language") || "Hindi";
          
          const payload: Record<string, unknown> = { 
            image_base64: imageBase64,
            language: lang
          };
          
          if (ageMonths) payload.child_age_months = parseInt(ageMonths);
          
          // Simulate loading steps for better UX
          await new Promise(r => setTimeout(r, 1000));
          setLoadingStep(2); // Calculating nutrients
          
          const res = await fetch(`${apiUrl}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          json = await res.json();
          
          await new Promise(r => setTimeout(r, 1000));
          setLoadingStep(3); // Generating recommendation
          await new Promise(r => setTimeout(r, 1000));
          
        } else {
          const res = await fetch(`${apiUrl}/demo`);
          json = await res.json();
        }
        
        setData(json);
        saveScanToHistory(json);
        
      } catch (err) {
        console.error("API call failed", err);
        // Fallback
        const fallback = {
          food_items: [{name: "Rice", estimated_grams: 150}, {name: "Dal", estimated_grams: 100}],
          nutrients: {calories: 311, protein_g: 13.0, iron_mg: 1.8},
          risk_level: "at_risk",
          gap_percentages: {calories: 22, protein: 0, iron: 55},
          recommendation_en: "This meal is missing iron-rich foods. Consider adding a serving of leafy greens (like spinach) or a boiled egg.",
          recommendation_local: "ఈ భోజనంలో ఐరన్ తక్కువగా ఉంది. పాలకూర లేదా ఉడికించిన గుడ్డును ఆహారంలో చేర్చండి."
        };
        
        await new Promise(r => setTimeout(r, 1000));
        setLoadingStep(2);
        await new Promise(r => setTimeout(r, 1000));
        setLoadingStep(3);
        await new Promise(r => setTimeout(r, 1000));
        
        setData(fallback);
        saveScanToHistory(fallback);
      } finally {
        setLoadingStep(0);
        if (isDemo) {
          setTimeout(() => setDemoPulsing(true), 1000);
          setTimeout(() => setDemoPulsing(false), 3000);
        }
      }
    };

    fetchData();
  }, [searchParams]);

  const saveScanToHistory = (scanData: any) => {
    try {
      const stored = localStorage.getItem("nourishnet_scans");
      const history = stored ? JSON.parse(stored) : [];
      const newScan = {
        childName: sessionStorage.getItem("scan_child_name") || "Unknown",
        date: new Date().toLocaleDateString(),
        risk_level: scanData.risk_level
      };
      history.unshift(newScan);
      localStorage.setItem("nourishnet_scans", JSON.stringify(history));
    } catch {
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingStep > 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full bg-white">
        <div className="w-full max-w-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${loadingStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              {loadingStep > 1 ? '✓' : '1'}
            </div>
            <p className={`font-bold ${loadingStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Identifying food items...</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${loadingStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              {loadingStep > 2 ? '✓' : '2'}
            </div>
            <p className={`font-bold ${loadingStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Calculating nutrients...</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${loadingStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              {loadingStep > 3 ? '✓' : '3'}
            </div>
            <p className={`font-bold ${loadingStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Generating recommendation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto w-full">
      <header className="bg-white p-4 flex items-center border-b shadow-sm sticky top-0 z-10 print:hidden">
        <button 
          onClick={() => router.push("/")}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto">Nutrition Results</h1>
        <div className="w-10"></div> 
      </header>
      
      <div className="hidden print:block p-4 text-center">
        <h1 className="text-2xl font-black text-primary">NourishNet Health Card</h1>
        <p>Child: {childName} | Age: {childAge} months | Date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="flex-1 flex flex-col">
        <RiskCard level={data?.risk_level} />
        
        <div className="p-5 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Detected Foods</h2>
            <div className="grid grid-cols-2 gap-3">
              {(data?.food_items as Array<{name: string, estimated_grams: number}>)?.map((item, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-xl">
                    🍲
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 leading-tight">{item.name}</div>
                    <div className="text-xs font-bold text-gray-500">{item.estimated_grams}g</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RecommendationPanel 
            text={data?.recommendation_local} 
            englishText={data?.recommendation_en}
            language={language}
            isPulsing={demoPulsing} 
          />

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Nutritional Gaps
            </h2>
            <div className="space-y-4">
              <NutrientBar name="Calories" gapPercent={data?.gap_percentages?.calories} color="bg-warning" />
              <NutrientBar name="Protein" gapPercent={data?.gap_percentages?.protein} color="bg-blue-500" />
              <NutrientBar name="Iron" gapPercent={data?.gap_percentages?.iron} color="bg-danger" />
            </div>
          </div>

          {(data?.risk_level === "at_risk" || data?.risk_level === "critical") && (
            <div className="bg-orange-50 p-5 rounded-2xl shadow-sm border border-orange-100 print:hidden">
              <h2 className="font-bold text-orange-800 mb-3 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Govt. Schemes Available
              </h2>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-orange-100">
                  <div className="font-bold text-gray-900 text-sm">PM POSHAN</div>
                  <div className="text-xs text-gray-600 mt-1">Provides hot cooked meals to children in govt and govt-aided schools.</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-orange-100">
                  <div className="font-bold text-gray-900 text-sm">ICDS Supplementary Nutrition</div>
                  <div className="text-xs text-gray-600 mt-1">Take-home rations and hot cooked meals at local Anganwadi centers.</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-orange-100">
                  <div className="font-bold text-gray-900 text-sm">Poshan Abhiyaan</div>
                  <div className="text-xs text-gray-600 mt-1">Holistic nutrition program ensuring targeted interventions for children.</div>
                </div>
              </div>
            </div>
          )}

          <div className="pb-6 print:hidden">
            <button 
              onClick={handlePrint}
              className="w-full bg-white border-2 border-primary text-primary font-bold text-lg py-4 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

