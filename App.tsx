import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { TreeMode, ThemeId } from './types';
import { THEMES } from './constants';
import { supabase } from './supabaseClient';
// 👇 1. 引入二维码组件
import QRCode from "react-qr-code";

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>(TreeMode.SCATTERED);
  const [themeId, setThemeId] = useState<ThemeId>(ThemeId.AURORA_GREEN);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

 // 1. 启动时检查：我是 A 用户还是 B 用户？
  useEffect(() => {
    const fetchTree = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (id) {
        setIsReadOnly(true); // 设为只读
        
        const { data, error } = await supabase
          .from('trees')
          .select('tree_data')
          .eq('id', id)
          .single();

        if (data && data.tree_data) {
          // 1. 先恢复照片和主题
          setThemeId(data.tree_data.themeId);
          setPhotos(data.tree_data.photos);
          
          // 2. 关键修复：
          // 先强制设为“分散模式”，确保起始状态正确
          setMode(TreeMode.SCATTERED); 

          // 3. 给浏览器 800毫秒 的时间准备渲染，然后自动变身！
          setTimeout(() => {
            setMode(TreeMode.TREE_SHAPE); 
          }, 800); 
        } 
      }
    };

    fetchTree();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) setPhotos((prev) => [...prev, event.target!.result as string]);
        };
        reader.readAsDataURL(file);
      });
      if (mode === TreeMode.SCATTERED) setMode(TreeMode.TREE_SHAPE);
    }
  };

  const handleShare = async () => {
    if (photos.length === 0) {
      alert("请先上传至少一张照片再分享哦！");
      return;
    }
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('trees')
        .insert([{ tree_data: { mode, themeId, photos } }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        // 👇 这里很重要：确保生成的链接是完整的
        const baseUrl = window.location.href.split('?')[0]; // 去掉可能存在的旧参数
        const fullUrl = `${baseUrl}?id=${data[0].id}`;
        setShareUrl(fullUrl);
      }
    } catch (err) {
      console.error(err);
      alert("保存失败，请检查网络");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[linear-gradient(to_bottom,#051B16_0%,#3D2E0F_100%)]">
      <Scene mode={mode} theme={THEMES[themeId]} photos={photos} />

      {/* 👇👇👇 2. 重点修改了这里的弹窗 👇👇👇 */}
      {shareUrl && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-black">🎄 扫码查看圣诞树</h3>
            
            {/* 二维码显示区域 */}
            <div className="bg-white p-2 border-2 border-gray-100 rounded-lg mb-4">
              <QRCode 
                value={shareUrl} 
                size={200} 
                fgColor="#000000" 
                bgColor="#ffffff" 
              />
            </div>

            <p className="text-sm text-gray-500 mb-4">
              微信扫码如果打不开，请点击右上角<br/>选择“在浏览器打开”
            </p>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => {navigator.clipboard.writeText(shareUrl); alert("链接已复制！");}}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
              >
                复制链接
              </button>
              <button 
                onClick={() => setShareUrl(null)}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && !shareUrl && (
        <>
          <UIOverlay 
            mode={mode} 
            setMode={setMode} 
            currentTheme={THEMES[themeId]} 
            setThemeId={setThemeId}
            onUploadPhoto={handlePhotoUpload}
          />
          <button
            onClick={handleShare}
            disabled={isSaving}
            className="absolute top-4 right-4 z-40 px-6 py-2 bg-yellow-500 text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 transition-all transform hover:scale-105"
          >
            {isSaving ? "⏳ 生成中..." : "🎁 生成二维码"}
          </button>
        </>
      )}

      {isReadOnly && (
        <div className="absolute bottom-10 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-full text-white text-center shadow-lg pointer-events-auto">
            <p className="text-lg font-bold mb-1">✨ 这是朋友送你的圣诞树 ✨</p>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
