// Student crates/unboxing page. Shares the cream pb-site theme with the
// wardrobe and dashboard.

import { CratesPanel } from '@/components/student/crates/CratesPanel';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'Playdemy — Crates',
  description: 'Open crates for skins, clothes, and accessories.',
};

export default function CratesPage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <CratesPanel />
      </div>
    </div>
  );
}
