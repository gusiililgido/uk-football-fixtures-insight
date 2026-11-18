import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const step1 = setTimeout(() => setProgress(62), 250);
    const step2 = setTimeout(() => setProgress(100), 650);
    const done = setTimeout(() => onFinish(), 1100);
    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(done);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 select-none">
      {/* Custom Vector Brand Crest */}
      <div className="relative flex flex-col items-center">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-800 to-[#0B0F19] p-1 shadow-2xl border border-blue-400/40 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="w-24 h-24"
            fill="none"
            xmlns="http://w3.org"
          >
            <path
              d="M60 8L104 26V58C104 86 85 107 60 114C35 107 16 86 16 58V26L60 8Z"
              fill="#0B0F19"
              stroke="#3B82F6"
              strokeWidth="4"
            />
            <path
              d="M60 18L94 32V57C94 79 79 96 60 102C41 96 26 79 26 57V32L60 18Z"
              fill="#1D4ED8"
              fillOpacity="0.28"
            />
            <circle cx="60" cy="44" r="14" stroke="#FFFFFF" strokeWidth="3" />
            <path
              d="M60 30V58M46 44H74M50 34L70 54M70 34L50 54"
              stroke="#93C5FD"
              strokeWidth="2"
            />
            <rect x="28" y="68" width="64" height="18" rx="9" fill="#DC2626" />
            <text
              x="60"
              y="80"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="900"
              letterSpacing="1.5"
            >
              U.K INSIGHT
            </text>
          </svg>
        </div>

        <h1 className="mt-5 text-xl sm:text-2xl font-black tracking-tight text-center">
          U.K FOOTBALL <span className="text-red-500">INSIGHT</span>
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-400 mt-1">
          98% Statistical Match Intelligence
        </p>

        {/* Progress Bar */}
        <div className="w-52 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-red-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-semibold mt-2">
          Loading Live Matchday Desk...
        </span>
      </div>
    </div>
  );
};
