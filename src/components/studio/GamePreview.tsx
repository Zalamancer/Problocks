'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Gamepad2, RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';

export interface GameObjectInfo {
  name: string;
  index: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface GamePreviewHandle {
  sendToGame: (msg: Record<string, unknown>) => void;
  selectModel: (name: string) => void;
  selectModelByIndex: (index: number) => void;
  deselectAll: () => void;
  setGizmoMode: (mode: 'translate' | 'rotate' | 'scale' | 'none') => void;
  addModel: (name: string, x?: number, y?: number, z?: number) => void;
  removeSelected: () => void;
  getSceneModels: () => void;
}

export function GamePreview({
  html,
  onClose,
  onObjectSelected,
  onObjectDeselected,
  onObjectTransformed,
  onSceneModels,
  previewRef,
}: {
  html: string;
  onClose: () => void;
  onObjectSelected?: (info: GameObjectInfo) => void;
  onObjectDeselected?: () => void;
  onObjectTransformed?: (info: Omit<GameObjectInfo, 'name' | 'index'>) => void;
  onSceneModels?: (models: GameObjectInfo[]) => void;
  previewRef?: React.MutableRefObject<GamePreviewHandle | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeFocused, setIframeFocused] = useState(false);
  const [key, setKey] = useState(0);

  // Send a message to the game iframe
  const sendToGame = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  // Expose handle methods
  useEffect(() => {
    if (!previewRef) return;
    previewRef.current = {
      sendToGame,
      selectModel: (name: string) => sendToGame({ type: 'selectModel', name }),
      selectModelByIndex: (index: number) => sendToGame({ type: 'selectModelByIndex', index }),
      deselectAll: () => sendToGame({ type: 'deselectAll' }),
      setGizmoMode: (mode) => sendToGame({ type: 'setGizmoMode', mode }),
      addModel: (name, x = 0, y = 0, z = 0) => sendToGame({ type: 'addModel', name, x, y, z }),
      removeSelected: () => sendToGame({ type: 'removeSelected' }),
      getSceneModels: () => sendToGame({ type: 'getSceneModels' }),
    };
    return () => { if (previewRef) previewRef.current = null; };
  }, [previewRef, sendToGame]);

  // Listen for messages from the game iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || !msg.type) return;

      // Only accept messages from our iframe
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) return;

      switch (msg.type) {
        case 'objectSelected':
          onObjectSelected?.({
            name: msg.name,
            index: msg.index,
            position: msg.position,
            rotation: msg.rotation,
            scale: msg.scale,
          });
          break;
        case 'deselected':
          onObjectDeselected?.();
          break;
        case 'objectTransformed':
          onObjectTransformed?.({
            position: msg.position,
            rotation: msg.rotation,
            scale: msg.scale,
          });
          break;
        case 'sceneModels':
          onSceneModels?.(msg.models);
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onObjectSelected, onObjectDeselected, onObjectTransformed, onSceneModels]);

  const refresh = useCallback(() => {
    setKey((k) => k + 1);
    setIframeFocused(false);
  }, []);

  const focusIframe = useCallback(() => {
    iframeRef.current?.focus();
    setIframeFocused(true);
  }, []);

  // Auto-focus iframe immediately so click-to-select works in edit mode
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && !iframeFocused) {
        iframeRef.current.focus();
        setIframeFocused(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Fullscreen the iframe itself so the game fills the screen with no toolbar chrome
      iframeRef.current?.requestFullscreen().catch(() => {
        // Fallback to container fullscreen if iframe fullscreen is blocked
        containerRef.current?.requestFullscreen().catch(() => {});
      });
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

  // Auto-focus iframe after it loads
  useEffect(() => {
    const timer = setTimeout(() => focusIframe(), 300);
    return () => clearTimeout(timer);
  }, [key, focusIframe]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col min-h-0 border-b border-white/[0.06] ${isFullscreen ? '!w-screen !h-screen' : ''}`}
    >
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

      {/* Game iframe -- click overlay to focus */}
      <div className="flex-1 min-h-0 bg-black relative">
        <iframe
          ref={iframeRef}
          key={key}
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          allow="fullscreen; pointer-lock"
          allowFullScreen
          tabIndex={0}
          className="w-full h-full border-0"
          title="Game Preview"
          onLoad={focusIframe}
        />
        {!iframeFocused && (
          <div
            onClick={focusIframe}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10"
          >
            <div className="flex flex-col items-center gap-2 text-white/70">
              <Gamepad2 size={28} />
              <span className="text-sm font-medium">Click to play</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
