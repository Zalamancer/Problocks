// Post-setup share screen. Reached by ClassroomSetupApp.openRoom() after the
// `classes` row is persisted. Shows the teacher a copy-able /join/:classId
// URL + a Classroom announcement template + CTA into the teacher dashboard.

import { Suspense } from 'react';
import { ShareScreen } from '@/components/teacher-setup/ShareScreen';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'ProBlocks — Invite your students',
  description: 'Share your ProBlocks classroom join link so students can sign in.',
};

export default function TeacherSetupSharePage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <Suspense fallback={null}>
          <ShareScreen />
        </Suspense>
      </div>
    </div>
  );
}
