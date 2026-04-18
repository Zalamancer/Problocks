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
      className={`flex-1 flex flex-col min-h-0 ${isFullscreen ? '!w-screen !h-screen' : ''}`}
      style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{
          background: 'var(--pb-paper)',
          borderBottom: '1.5px solid var(--pb-line-2)',
        }}
      >
        <div className="flex items-center gap-2">
          <Gamepad2 size={13} strokeWidth={2.4} style={{ color: 'var(--pb-mint-ink)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pb-ink)' }}>
            Game Preview
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { onClick: refresh, icon: RefreshCw, title: 'Restart game' },
            {
              onClick: toggleFullscreen,
              icon: isFullscreen ? Minimize2 : Maximize2,
              title: isFullscreen ? 'Exit fullscreen' : 'Fullscreen',
            },
            { onClick: onClose, icon: X, title: 'Close preview' },
          ].map(({ onClick, icon: Icon, title }) => (
            <button
              key={title}
              onClick={onClick}
              title={title}
              className="flex items-center justify-center transition-colors"
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'transparent',
                color: 'var(--pb-ink-soft)',
                border: '1.5px solid transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--pb-cream-2)';
                e.currentTarget.style.borderColor = 'var(--pb-line-2)';
                e.currentTarget.style.color = 'var(--pb-ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'var(--pb-ink-soft)';
              }}
            >
              <Icon size={12} strokeWidth={2.2} />
            </button>
          ))}
        </div>
      </div>

      {/* Game iframe -- click overlay to focus */}
      <div className="flex-1 min-h-0 relative" style={{ background: '#000' }}>
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
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            style={{ background: 'rgba(29,26,20,0.45)' }}
          >
            <div
              className="flex flex-col items-center gap-2"
              style={{
                padding: '14px 20px',
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-ink)',
                borderRadius: 14,
                boxShadow: '0 4px 0 var(--pb-ink)',
              }}
            >
              <Gamepad2 size={24} strokeWidth={2.4} style={{ color: 'var(--pb-mint-ink)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}>
                Click to play
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
