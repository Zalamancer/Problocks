// Teacher onboarding — "Set up your classroom" multi-step flow reached
// from the landing page's "I'm a teacher → Set up a classroom" CTA.
// Reuses the cream pb-site theme (.pbs-root) so it matches the rest of the site.

import { ClassroomSetupApp } from '@/components/teacher-setup/ClassroomSetupApp';
import { ClassroomProviders } from '@/app/classroom/Providers';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'Playdemy — Set up your classroom',
  description: 'Teacher onboarding: name your classroom, add students, pick a starter unit, and open the doors.',
};

export default function TeacherSetupPage() {
  return (
    <ClassroomProviders>
      <div className="pbs-root">
        <div className="pbs-page-bg" aria-hidden />
        <div className="pbs-page-noise" aria-hidden />
        <div className="pbs-content">
          <ClassroomSetupApp />
        </div>
      </div>
    </ClassroomProviders>
  );
}
