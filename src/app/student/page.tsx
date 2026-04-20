// Student experience entry point — login, join class, dashboard.
// Hosts the entire StudentApp under the cream/playful pb-site theme.

import { StudentApp } from '@/components/student/StudentApp';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'ProBlocks — Student',
  description: 'Sign in, join a class, and play games assigned by your teacher.',
};

export default function StudentPage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <StudentApp startView="dashboard" />
      </div>
    </div>
  );
}
