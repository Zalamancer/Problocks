// Student's own profile — identical layout to what the teacher sees when
// clicking "View as student" from the student detail page. Pulls in both
// the pb-site cream theme and teacher.css so the shared <StudentSelf>
// component renders exactly as it does in the teacher app.

import { StudentProfile } from '@/components/student/StudentProfile';
import '@/components/landing/pb-site/styles.css';
import '@/components/teacher/teacher.css';

export const metadata = {
  title: 'Playdemy — Profile',
  description: 'Your progress — quizzes, mastery, badges, and where you got stuck.',
};

export default function StudentProfilePage() {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content">
        <StudentProfile />
      </div>
    </div>
  );
}
