'use client';
import { MessageSquare, Sparkles } from 'lucide-react';
import { PanelTextarea, PanelActionButton } from '@/components/ui';

export function ChatPanel() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Message history */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <MessageSquare size={28} className="mx-auto text-gray-600 mb-2" />
          <p className="text-sm text-gray-400">AI Chat</p>
          <p className="text-xs text-gray-600 mt-1">Describe changes to your game</p>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 px-3 pb-3 space-y-2">
        <PanelTextarea
          value=""
          onChange={() => {}}
          placeholder="Describe your game or changes..."
          rows={3}
          showCount
        />
        <PanelActionButton
          onClick={() => {}}
          variant="primary"
          icon={Sparkles}
          fullWidth
        >
          Generate
        </PanelActionButton>
      </div>
    </div>
  );
}
