// Student wardrobe — pick face, hair, hat, and clothing colors for the
// Roblox-style avatar. Lives under the same cream pb-site theme as the
// rest of the student app.

import { Wardrobe } from '@/components/student/Wardrobe';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'ProBlocks — Wardrobe',
  description: 'Customize your avatar — face, hair, hat, and outfit.',
};

export default function WardrobePage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <Wardrobe />
      </div>
    </div>
  );
}
