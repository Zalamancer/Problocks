import { DesktopOnly } from '@/components/DesktopOnly';

export const metadata = {
  title: 'Scratch Studio · Playdemy',
};

export default function ScratchStudioPage() {
  return (
    <DesktopOnly
      title="Scratch Studio is desktop-only"
      description="The block editor, stage, and sprite panels need a wider screen. Open on a laptop or desktop."
    >
      <div style={{ position: 'fixed', inset: 0, background: '#1e1e1e' }}>
        <iframe
          src="/scratch/index.html"
          title="Scratch Studio"
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          allow="camera; microphone; autoplay; clipboard-read; clipboard-write"
        />
      </div>
    </DesktopOnly>
  );
}
