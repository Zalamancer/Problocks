'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Gamepad2, RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';

export function GamePreview({
  html,
  onClose,
}: {
  html: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const refresh = useCallback(() => setKey((k) => k + 1), []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0 border-b border-white/[0.06]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161616] border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Gamepad2 size={13} className="text-green-400" />
          <span className="text-xs font-medium text-zinc-300">Game Preview</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={refresh}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Restart game"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Close preview"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Game iframe */}
      <div className="flex-1 min-h-0 bg-black">
        <iframe
          key={key}
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          className="w-full h-full border-0"
          title="Game Preview"
        />
      </div>
    </div>
  );
}
