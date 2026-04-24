export default function NutrientBar({ 
  name, 
  gapPercent,
  color 
}: { 
  name: string, 
  gapPercent: number,
  color: string
}) {
  // Ensure valid number, bounds 0-100
  const gap = Math.min(100, Math.max(0, gapPercent || 0));
  const fill = 100 - gap;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="font-semibold text-gray-700">{name}</span>
        <span className={`text-xs font-bold ${gap > 30 ? 'text-red-500' : 'text-gray-500'}`}>
          {gap > 0 ? `${gap}% short` : 'Adequate'}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${fill}%` }}
        ></div>
      </div>
    </div>
  );
}
