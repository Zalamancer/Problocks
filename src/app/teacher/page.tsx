// Teacher dashboard entry point — class overview, assignments, student
// metrics, and the "as student" view. Uses the cream pb-site theme.

import { Suspense } from 'react';
import { TeacherApp } from '@/components/teacher/TeacherApp';
import { NewClassBanner } from '@/components/teacher/NewClassBanner';
import '@/components/landing/pb-site/styles.css';
import '@/components/teacher/teacher.css';

export const metadata = {
  title: 'ProBlocks — Teacher',
  description: 'Class overview, assignments, student progress, and the per-student view.',
};

export default function TeacherPage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <Suspense fallback={null}>
          <NewClassBanner />
        </Suspense>
        <TeacherApp />
      </div>
    </div>
  );
}
