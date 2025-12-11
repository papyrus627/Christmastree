import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { TreeMode, ThemeId } from './types';
import { THEMES } from './constants';
// 引入我们刚才建好的连接器
import { supabase } from './supabaseClient'; 

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>(TreeMode.SCATTERED);
  const [themeId, setThemeId] = useState<ThemeId>(ThemeId.AURORA_GREEN);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // 新增：状态控制
  const [isReadOnly, setIsReadOnly] = useState(false); // 是否是 B 用户（只读）
  const [shareUrl, setShareUrl] = useState<string | null>(null); // 生成的分享链接
  const [isSaving, setIsSaving] = useState(false); // 保存中的加载状态

  // 1. 启动时检查：我是 A 用户还是 B 用户？
  useEffect(() => {
    const fetchTree = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (id) {
        // 如果网址里有 id，说明是 B 用户
        setIsReadOnly(true);
        console.log("检测到分享ID，正在加载...", id);
        
        const { data, error } = await supabase
          .from('trees')
          .select('tree_data')
          .eq('id', id)
          .single();

        if (data && data.tree_data) {
          // 恢复圣诞树的状态
          setMode(data.tree_data.mode);
          setThemeId(data.tree_data.themeId);
          setPhotos(data.tree_data.photos);
        } else {
          console.error("加载失败:", error);
        }
      }
    };

    fetchTree();
  }, []);

  // 2. 上传照片逻辑 (保持不变)
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

      if (mode === TreeMode.SCATTERED) {
         setMode(TreeMode.TREE_SHAPE);
      }
    }
  };

  // 3. 新增：分享功能 (A 用户点击)
  const handleShare = async () => {
    if (photos.length === 0) {
      alert("请先上传至少一张照片再分享哦！");
      return;
    }
    
    setIsSaving(true);
    try {
      // 打包数据
      const treeData = {
        mode,
        themeId,
        photos
      };

      // 发送到 Supabase
      const { data, error } = await supabase
        .from('trees')
        .insert([{ tree_data: treeData }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        // 生成链接
        const newId = data[0].id;
        // 自动识别当前是本地还是github pages
        const baseUrl = window.location.origin + window.location.pathname; 
        const fullUrl = `${baseUrl}?id=${newId}`;
        setShareUrl(fullUrl);
      }
    } catch (err) {
      console.error(err);
      alert("保存失败，请检查网络或配置");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[linear-gradient(to_bottom,#051B16_0%,#3D2E0F_100%)]">
      {/* 3D 场景永远存在 */}
      <Scene 
        mode={mode} 
        theme={THEMES[themeId]} 
        photos={photos}
      />

      {/* --- 界面逻辑分层 --- */}

      {/* 1. 如果生成了链接，显示分享弹窗 */}
      {shareUrl && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white p-6 rounded-lg max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4 text-black">🎄 圣诞树已生成！</h3>
            <p className="text-gray-600 mb-2">复制下方链接发给朋友：</p>
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="w-full p-2 border rounded mb-4 text-sm bg-gray-100 text-black"
            />
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => {navigator.clipboard.writeText(shareUrl); alert("已复制！");}}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                复制链接
              </button>
              <button 
                onClick={() => setShareUrl(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 只有在 A 用户模式（非只读）下，才显示原来的 UIOverlay */}
      {!isReadOnly && !shareUrl && (
        <>
          <UIOverlay 
            mode={mode} 
            setMode={setMode} 
            currentTheme={THEMES[themeId]} 
            setThemeId={setThemeId}
            onUploadPhoto={handlePhotoUpload}
          />
          
          {/* 额外的分享按钮，放在右上角 */}
          <button
            onClick={handleShare}
            disabled={isSaving}
            className="absolute top-4 right-4 z-40 px-6 py-2 bg-yellow-500 text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 transition-all"
          >
            {isSaving ? "生成中..." : "🎁 生成分享链接"}
          </button>
        </>
      )}

      {/* 3. 如果是 B 用户（只读模式），显示简单的祝福栏 */}
      {isReadOnly && (
        <div className="absolute bottom-10 left-0 right-0 z-40 flex flex-col items-center">
          <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white text-center">
            <p className="text-lg font-bold">✨ 这是一棵收到的圣诞树 ✨</p>
          </div>
          <button 
            onClick={() => window.location.href = window.location.pathname}
            className="mt-4 text-sm text-white/80 underline hover:text-white"
          >
            我也要做一个
          </button>
        </div>
      )}
    </div>
  );
};

export default App;