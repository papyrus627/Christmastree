import React, { useRef } from 'react';
import { TreeMode, ThemeId, ThemeConfig } from '../types';
import { THEMES } from '../constants';

interface UIOverlayProps {
  mode: TreeMode;
  setMode: (m: TreeMode) => void;
  currentTheme: ThemeConfig;
  setThemeId: (id: ThemeId) => void;
  onUploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ mode, setMode, currentTheme, setThemeId, onUploadPhoto }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMode = () => {
    setMode(mode === TreeMode.SCATTERED ? TreeMode.TREE_SHAPE : TreeMode.SCATTERED);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-start space-y-2 pointer-events-auto">
        <h1 className={`text-4xl md:text-6xl font-light tracking-widest uppercase`} style={{ color: currentTheme.colors.particlesPrimary, textShadow: `0 0 20px ${currentTheme.colors.particlesSecondary}` }}>
          Arix Signature
        </h1>
        <div className="h-px w-32 bg-white/50"></div>
        <p className="text-white/80 font-serif italic tracking-wide">Interactive Christmas Experience</p>
      </header>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-auto w-full">
        
        {/* Left: Theme Switcher */}
        <div className="flex flex-col gap-2">
            <span className="text-white/50 text-xs tracking-widest uppercase mb-2">Select Theme</span>
            <div className="flex gap-2">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                    <button
                        key={id}
                        onClick={() => setThemeId(id)}
                        className={`px-4 py-2 border transition-all duration-300 text-sm tracking-widest ${
                            currentTheme.id === id 
                            ? 'bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                            : 'bg-black/40 border-white/20 text-white/60 hover:border-white/60'
                        }`}
                    >
                        {THEMES[id].name.split(" ")[0]}
                    </button>
                ))}
            </div>
        </div>

        {/* Center: Morph Action */}
        <div className="flex-1 flex justify-center">
            <button 
                onClick={toggleMode}
                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-white/30 backdrop-blur-md transition-all duration-500 hover:border-white hover:bg-white/5"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                <span className="relative text-white font-light tracking-[0.3em] uppercase">
                    {mode === TreeMode.SCATTERED ? "Assemble Tree" : "Release Magic"}
                </span>
            </button>
        </div>

        {/* Right: Upload Photo */}
        <div className="flex flex-col gap-2 items-end">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                multiple
                onChange={onUploadPhoto}
            />
            <span className="text-white/50 text-xs tracking-widest uppercase mb-2">Memories</span>
            <button 
                onClick={triggerUpload}
                className="px-6 py-2 border border-white/30 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white hover:text-white transition-all duration-300 backdrop-blur-sm text-sm tracking-wider uppercase flex items-center gap-2"
            >
                <span>+ Add Photos</span>
            </button>
        </div>

      </div>

      {/* Decorative footer line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
};