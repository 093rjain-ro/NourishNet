"use client";

export default function DemoModeToggle({ 
  onTrigger, 
  isRunning 
}: { 
  onTrigger: () => void,
  isRunning: boolean
}) {
  return (
    <button 
      onClick={onTrigger}
      disabled={isRunning}
      className={`
        px-4 py-2 rounded-full font-bold shadow-md text-sm transition-all
        flex items-center gap-2
        ${isRunning 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-gray-800'
        }
      `}
    >
      <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-gray-400' : 'bg-red-500 animate-pulse'}`}></div>
      {isRunning ? 'Demo Running...' : 'Demo Mode'}
    </button>
  );
}
