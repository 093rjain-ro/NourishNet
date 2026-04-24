export default function RecommendationPanel({ 
  text, 
  englishText,
  language,
  isPulsing = false 
}: { 
  text: string, 
  englishText: string,
  language: string,
  isPulsing?: boolean 
}) {

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Basic mapping
      const langMap: Record<string, string> = {
        "Hindi": "hi-IN",
        "Telugu": "te-IN",
        "Tamil": "ta-IN",
        "Kannada": "kn-IN",
        "Malayalam": "ml-IN",
        "Marathi": "mr-IN",
        "Bengali": "bn-IN",
        "Gujarati": "gu-IN"
      };
      
      utterance.lang = langMap[language] || "hi-IN";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className={`mt-2 p-5 rounded-2xl bg-primary-light border-2 transition-all duration-500
      ${isPulsing ? 'border-primary bg-[#dcfce7] shadow-lg shadow-primary/20' : 'border-[#bbf7d0]'}
    `}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="flex items-center gap-2 font-bold text-primary text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Actionable Recommendation
        </h3>
        
        <button 
          onClick={handleSpeak}
          className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-transform print:hidden"
          aria-label="Read aloud"
        >
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>
      
      <p className="font-sans text-xl font-bold leading-relaxed text-gray-900 mb-4">
        {text}
      </p>
      
      <div className="pt-3 border-t border-primary/20">
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          {englishText}
        </p>
      </div>
    </div>
  );
}
