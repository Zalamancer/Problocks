// Step 5: review summary + big "open the classroom" CTA card.
// Ported from Claude Design bundle (pb_classroom_setup/steps_late.jsx).
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { StepCard, StepHeader } from './form';
import { STARTER_UNITS } from './StepUnit';
import type { SetupData } from './types';

const Row = ({
  label, value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 14,
    padding: '12px 0', borderBottom: '1px dashed var(--pbs-line-2)',
  }}>
    <div className="pbs-mono" style={{
      width: 120, flexShrink: 0,
      fontSize: 11, color: 'var(--pbs-ink-muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      paddingTop: 2,
    }}>{label}</div>
    <div style={{ flex: 1, fontSize: 14.5, color: 'var(--pbs-ink)', lineHeight: 1.45 }}>{value}</div>
  </div>
);

export const StepReview = ({ data }: { data: SetupData }) => {
  const unit = STARTER_UNITS.find((u) => u.id === data.unit);
  const rosterCount = data.pastedNames
    ? data.pastedNames.split(/\n|,/).map((s) => s.trim()).filter(Boolean).length
    : 0;

  const rosterValue: React.ReactNode =
    data.rosterMethod === 'paste'  ? `${rosterCount} students pasted` :
    data.rosterMethod === 'google' ? 'Will connect Google Classroom' :
    data.rosterMethod === 'clever' ? 'Will connect Clever' :
    data.rosterMethod === 'teams'  ? 'Will connect Microsoft Teams' :
    data.rosterMethod === 'code'   ? (
      <>Share code <span className="pbs-mono" style={{ background: 'var(--pbs-cream-2)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--pbs-line-2)' }}>{data.joinCode}</span></>
    ) :
    'Open empty — roster later';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StepHeader
        index={4}
        total={5}
        step={{
          title: <>One last look before <span className="pbs-serif">the doors open.</span></>,
          sub: "Double-check the room — anything here is still editable once you're inside the Teacher app.",
        }}
      />

      <StepCard>
        <Row label="Teacher" value={<>{data.teacherName || '—'} · <span className="pbs-mono" style={{ color: 'var(--pbs-ink-muted)' }}>@{data.teacherHandle || 'you'}</span></>}/>
        <Row label="School" value={data.school || '—'}/>
        <Row label="Classroom" value={<><strong>{data.className || 'Untitled classroom'}</strong> · {data.classSubject} · {data.grade}</>}/>
        <Row label="Schedule" value={<>{data.days.length ? data.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(' / ') : '—'} · {data.startTime} – {data.endTime}</>}/>
        <Row label="Roster" value={rosterValue}/>
        <Row label="Starter" value={unit ? <><strong>{unit.title}</strong> · {unit.weeks}</> : 'None'}/>
        <Row label="Standards" value={data.standards}/>
      </StepCard>

      <StepCard style={{ background: 'var(--pbs-ink)', color: 'var(--pbs-cream)', borderColor: 'var(--pbs-ink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
            border: '1.5px solid var(--pbs-butter-ink)',
            boxShadow: '0 3px 0 var(--pbs-butter-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="sparkle" size={22} stroke={2.2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>You&apos;re two clicks from teaching.</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>
              Opening the room creates the classroom page, seeds the first week&apos;s lessons, and emails any connected roster.
            </div>
          </div>
        </div>
      </StepCard>
    </div>
  );
};
