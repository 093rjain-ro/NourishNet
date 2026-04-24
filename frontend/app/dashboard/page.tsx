"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    atRisk: 0,
    critical: 0
  });
  const [chartData, setChartData] = useState<Array<{date: string, count: number}>>([]);

  useEffect(() => {
    const stored = localStorage.getItem("nourishnet_scans");
    if (stored) {
      try {
        const scans = JSON.parse(stored);
        
        let safe = 0;
        let atRisk = 0;
        let critical = 0;
        
        // Count risks
        scans.forEach((s: {risk_level: string, date: string}) => {
          if (s.risk_level === "safe") safe++;
          else if (s.risk_level === "at_risk") atRisk++;
          else if (s.risk_level === "critical") critical++;
        });
        
        setStats({
          total: scans.length,
          safe,
          atRisk,
          critical
        });

        // Group by date for simple chart
        const byDate: Record<string, number> = {};
        // Reverse so chronological
        [...scans].reverse().forEach((s: {date: string}) => {
          const d = s.date;
          byDate[d] = (byDate[d] || 0) + 1;
        });
        
        const cData = Object.keys(byDate).map(date => ({
          date: date.substring(0, 5), // short date
          count: byDate[date]
        }));
        
        // Take last 7 days
        setChartData(cData.slice(-7));

      } catch {
        // ignore parsing error
      }
    }
  }, []);

  const maxCount = Math.max(1, ...chartData.map(d => d.count));

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="bg-white p-4 flex items-center border-b shadow-sm sticky top-0 z-10">
        <button 
          onClick={() => router.push("/")}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto">Supervisor Dashboard</h1>
        <div className="w-10"></div> 
      </header>

      <div className="p-6 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Total Scans</h2>
          <div className="text-5xl font-black text-primary">{stats.total}</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-safe text-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-black mb-1">{stats.safe}</div>
            <div className="text-xs font-bold uppercase opacity-90">Safe</div>
          </div>
          <div className="bg-warning text-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-black mb-1">{stats.atRisk}</div>
            <div className="text-xs font-bold uppercase opacity-90">At Risk</div>
          </div>
          <div className="bg-danger text-white rounded-2xl shadow-sm p-4 text-center">
            <div className="text-2xl font-black mb-1">{stats.critical}</div>
            <div className="text-xs font-bold uppercase opacity-90">Critical</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-6">Recent Activity (Last 7 Days)</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-48 mt-4">
              {chartData.map((d, i) => {
                const heightPct = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-primary-light rounded-t-sm relative flex items-end justify-center group" style={{ height: '100%' }}>
                      <div className="w-full bg-primary rounded-t-md transition-all duration-1000" style={{ height: `${heightPct}%` }}></div>
                      <div className="absolute -top-6 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.count}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 transform -rotate-45 mt-2 origin-top-left">{d.date}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
