export default function TeluguPanel({ 
  text, 
  englishText,
  isPulsing = false 
}: { 
  text: string, 
  englishText: string,
  isPulsing?: boolean 
}) {
  return (
    <div className={`mt-2 p-5 rounded-2xl bg-indigo-50 border-2 transition-all duration-500
      ${isPulsing ? 'border-indigo-500 bg-indigo-100 shadow-lg shadow-indigo-200' : 'border-indigo-100'}
    `}>
      <h3 className="flex items-center gap-2 font-bold text-indigo-800 mb-3 text-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Actionable Recommendation
      </h3>
      
      <p className="font-telugu text-lg leading-relaxed text-gray-900 mb-3" style={{ fontFamily: 'var(--font-telugu)' }}>
        {text}
      </p>
      
      <div className="pt-3 mt-3 border-t border-indigo-200/50">
        <p className="text-xs text-indigo-600/80 font-medium">
          EN: {englishText}
        </p>
      </div>
    </div>
  );
}
