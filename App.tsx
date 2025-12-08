import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { TreeMode, ThemeId } from './types';
import { THEMES } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>(TreeMode.SCATTERED);
  const [themeId, setThemeId] = useState<ThemeId>(ThemeId.AURORA_GREEN);
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotos((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Switch to tree mode so user can see the spiral forming around the tree
      if (mode === TreeMode.SCATTERED) {
         setMode(TreeMode.TREE_SHAPE);
      }
    }
  };

  return (
    // Gradient: Deep Emerald Green (#0B4036 range) -> Warm Dark Gold (#5C4010 range)
    <div className="relative w-full h-screen bg-[linear-gradient(to_bottom,#051B16_0%,#3D2E0F_100%)]">
      <Scene 
        mode={mode} 
        theme={THEMES[themeId]} 
        photos={photos}
      />
      <UIOverlay 
        mode={mode} 
        setMode={setMode} 
        currentTheme={THEMES[themeId]} 
        setThemeId={setThemeId}
        onUploadPhoto={handlePhotoUpload}
      />
    </div>
  );
};

export default App;