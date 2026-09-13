import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Immediately dismiss native Capacitor splash screen so this custom branded screen is shown directly
    try {
      if (window.Capacitor?.Plugins?.SplashScreen?.hide) {
        window.Capacitor.Plugins.SplashScreen.hide();
      }
    } catch (e) {}

    // Start fade-out at 1750ms
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1750);

    // Complete splash at 2000ms (2 seconds)
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white select-none transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

      {/* Main Branding Card */}
      <div className="relative flex flex-col items-center text-center px-6 animate-fade-in">
        {/* School Logo */}
        <div className="relative mb-6">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-200 to-indigo-500 shadow-2xl shadow-amber-500/20 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="NVP English Medium School"
              className="w-full h-full object-contain rounded-full bg-white p-1"
            />
          </div>
        </div>

        {/* Text Line 1: NVP ENGLISH MEDIUM SCHOOL */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-black tracking-wider text-white uppercase drop-shadow-md">
          NVP ENGLISH MEDIUM SCHOOL
        </h1>

        {/* Text Line 2: NIMBI JODHAN BASS */}
        <p className="mt-2 text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.25em] text-amber-400 drop-shadow">
          NIMBI JODHAN BASS
        </p>

        {/* Subtle 2-second progress indicator bar */}
        <div className="mt-6 w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
