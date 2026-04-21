// Step 1: teacher profile (name, school, region, standards, subjects).
// Ported from Claude Design bundle (pb_classroom_setup/steps_early.jsx).
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { Field, TextInput, Select, ChipGroup, StepCard, StepHeader } from './form';
import type { SetupData } from './types';

type Set<K extends keyof SetupData> = (k: K, v: SetupData[K]) => void;

export const StepAboutYou = ({
  data, set,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <StepHeader
      index={0}
      total={5}
      step={{
        title: <>Welcome! Let&apos;s <span className="pbs-serif">meet you first.</span></>,
        sub: 'Two minutes here unlocks standards auto-mapping and school-district rules. We never share your details with students.',
      }}
    />

    <StepCard>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Your name">
          <TextInput
            value={data.teacherName}
            onChange={(e) => set('teacherName', e.target.value)}
            placeholder="Ms. Nguyen"
          />
        </Field>
        <Field label="Display name" hint="How students see you in chat.">
          <TextInput
            value={data.teacherHandle}
            onChange={(e) => set('teacherHandle', e.target.value)}
            placeholder="Ms. N"
            prefix="@"
          />
        </Field>

        <Field label="School" style={{ gridColumn: '1 / -1' }}>
          <TextInput
            value={data.school}
            onChange={(e) => set('school', e.target.value)}
            placeholder="Start typing your school name…"
            icon="book"
          />
        </Field>

        <Field label="Country / region">
          <Select
            value={data.region}
            onChange={(e) => set('region', e.target.value as SetupData['region'])}
            options={[
              { value: 'us', label: '🇺🇸 United States' },
              { value: 'uk', label: '🇬🇧 United Kingdom' },
              { value: 'ca', label: '🇨🇦 Canada' },
              { value: 'au', label: '🇦🇺 Australia' },
              { value: 'nz', label: '🇳🇿 New Zealand' },
              { value: 'other', label: 'Somewhere else' },
            ]}
          />
        </Field>
        <Field label="Standards framework" hint="We'll pre-tag lessons to this.">
          <Select
            value={data.standards}
            onChange={(e) => set('standards', e.target.value as SetupData['standards'])}
            options={[
              { value: 'common-core', label: 'Common Core (math)' },
              { value: 'ngss', label: 'NGSS (science)' },
              { value: 'csta', label: 'CSTA (CS)' },
              { value: 'iste', label: 'ISTE' },
              { value: 'uk-nc', label: 'UK National Curriculum' },
              { value: 'none', label: 'None / skip' },
            ]}
          />
        </Field>
      </div>

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px dashed var(--pbs-line-2)' }}>
        <Field label="I mostly teach" hint="Pick all that apply — affects starter units.">
          <div style={{ height: 6 }}/>
          <ChipGroup
            multi
            value={data.subjects}
            onChange={(v) => set('subjects', v as SetupData['subjects'])}
            options={[
              { value: 'math',    label: 'Math',              icon: 'coin',    tone: 'butter' },
              { value: 'ela',     label: 'Reading & writing', icon: 'book',    tone: 'coral' },
              { value: 'science', label: 'Science',           icon: 'spark',   tone: 'mint' },
              { value: 'cs',      label: 'Computer science',  icon: 'code',    tone: 'sky' },
              { value: 'social',  label: 'Social studies',    icon: 'compass', tone: 'grape' },
              { value: 'art',     label: 'Art & music',       icon: 'music',   tone: 'pink' },
            ]}
          />
        </Field>
      </div>
    </StepCard>

    <div style={{
      padding: '14px 18px',
      background: 'var(--pbs-cream-2)',
      border: '1.5px dashed var(--pbs-line-2)',
      borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 13, color: 'var(--pbs-ink-soft)', lineHeight: 1.5,
    }}>
      <Icon name="lock" size={16} stroke={2.2} style={{ color: 'var(--pbs-ink)', flexShrink: 0 }}/>
      <span>FERPA &amp; COPPA compliant. Your school admin can pre-approve Playdemy so you never hit a wall. <a href="#admin" style={{ color: 'var(--pbs-ink)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Admin info →</a></span>
    </div>
  </div>
);
