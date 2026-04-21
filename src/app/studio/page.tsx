import { StudioLayout } from '@/components/studio/StudioLayout';
import { DesktopOnly } from '@/components/DesktopOnly';

export default function StudioPage() {
  return (
    <DesktopOnly
      title="Studio is desktop-only"
      description="The node canvas, asset panels, and AI tools need a wider screen to work. Open ProBlocks Studio on a laptop or desktop."
    >
      <StudioLayout />
    </DesktopOnly>
  );
}
