import React, { useEffect, useState } from 'react';

const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('tf-dark-mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tf-dark-mode', String(dark));
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      className={`
        relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none
        ${dark ? 'bg-indigo-600' : 'bg-slate-200'}
      `}
      aria-label="Toggle dark mode"
      title={dark ? '切換淺色模式' : '切換暗色模式'}
    >
      {/* Thumb */}
      <span className={`
        absolute left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center
        transition-transform duration-300 text-[10px]
        ${dark ? 'translate-x-5' : 'translate-x-0'}
      `}>
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
