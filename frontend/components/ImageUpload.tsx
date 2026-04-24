"use client";

import { useRef } from "react";

export default function ImageUpload({ 
  onUpload, 
  isHighlighted = false 
}: { 
  onUpload: (base64: string) => void,
  isHighlighted?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpload(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex justify-center">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center 
          w-56 h-56 rounded-full shadow-lg transition-all duration-300
          text-white font-bold text-xl
          ${isHighlighted 
            ? 'bg-primary scale-110 shadow-primary/50 ring-4 ring-primary-light' 
            : 'bg-primary hover:bg-[#155d31] hover:scale-105 active:scale-95 shadow-primary/30'
          }
        `}
      >
        <svg className="w-16 h-16 mb-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Scan a Meal</span>
      </button>
    </div>
  );
}
