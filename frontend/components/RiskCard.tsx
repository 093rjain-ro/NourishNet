export default function RiskCard({ level }: { level: "safe" | "at_risk" | "critical" | string }) {
  let colorClass = "";
  let icon = "";
  let title = "";
  let subtitle = "";

  if (level === "safe") {
    colorClass = "bg-safe text-white";
    icon = "✓";
    title = "Safe";
    subtitle = "This meal looks good";
  } else if (level === "critical") {
    colorClass = "bg-danger text-white";
    icon = "!";
    title = "Critical";
    subtitle = "This child needs immediate attention.";
  } else {
    // Default to at_risk
    colorClass = "bg-warning text-white";
    icon = "!";
    title = "At Risk";
    subtitle = "This meal needs some improvement";
  }

  return (
    <div className={`w-full py-10 px-6 shadow-md flex flex-col items-center justify-center text-center ${colorClass}`}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl font-black bg-white/20 mb-4 shadow-inner">
        {icon}
      </div>
      <h2 className="text-4xl font-black tracking-tight uppercase mb-2">{title}</h2>
      <p className="text-xl font-bold opacity-90 max-w-xs">
        {subtitle}
      </p>
    </div>
  );
}
