// /join/:classId — student self-enrollment entry point.
// Teachers paste this link into Google Classroom announcements.
// Student lands → "Sign in with Google" → we upsert a students row via
// /api/students/join → redirect them to /student (or class page later).

import { ClassroomProviders } from '@/app/classroom/Providers';
import { JoinClient } from './JoinClient';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'ProBlocks — Join your class',
};

export default async function JoinClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return (
    <ClassroomProviders>
      <div className="pbs-root">
        <div className="pbs-page-bg" aria-hidden />
        <div className="pbs-page-noise" aria-hidden />
        <div className="pbs-content">
          <JoinClient classId={classId} />
        </div>
      </div>
    </ClassroomProviders>
  );
}
