'use client';

import { useState, useCallback } from 'react';

type Kind = 'delete' | 'export' | 'opt-out' | 'correction';
type Role = 'self' | 'parent' | 'school';

const KIND_OPTIONS: { id: Kind; label: string; description: string }[] = [
  { id: 'delete',     label: 'Delete all data',    description: 'Remove the student\'s account, games, messages, and activity from our systems.' },
  { id: 'export',     label: 'Export data',        description: 'Send me a copy of everything you have about this student.' },
  { id: 'opt-out',    label: 'Opt out',            description: 'Keep the account but stop using the student\'s data for analytics or improvements.' },
  { id: 'correction', label: 'Correct or update',  description: 'Something about the student\'s record is wrong — fix it.' },
];

const ROLE_OPTIONS: { id: Role; label: string; description: string }[] = [
  { id: 'parent', label: 'Parent / guardian',      description: 'I am the legal guardian of the student.' },
  { id: 'school', label: 'School administrator',   description: 'I represent the school or district.' },
  { id: 'self',   label: 'I am the student',       description: 'I\'m the user whose data this request is about.' },
];

export function DataRequestForm() {
  const [kind, setKind] = useState<Kind>('delete');
  const [role, setRole] = useState<Role>('parent');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentUserId, setStudentUserId] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/coppa/data-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind,
          requesterRole: role,
          requesterEmail: requesterEmail.trim(),
          requesterName: requesterName.trim() || undefined,
          studentName: studentName.trim() || undefined,
          studentEmail: studentEmail.trim() || undefined,
          studentUserId: studentUserId.trim() || undefined,
          details: details.trim() || undefined,
        }),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? 'Something went wrong. Try again.');
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError((err as Error).message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  }, [kind, role, requesterEmail, requesterName, studentName, studentEmail, studentUserId, details, submitting]);

  if (submitted) {
    return (
      <div style={{
        padding: '24px 20px',
        borderRadius: 14,
        background: 'var(--pb-mint-2, #c8f2d0)',
        color: 'var(--pb-mint-ink, #2a6a3a)',
        border: '1.5px solid var(--pb-mint-ink, #2a6a3a)',
        fontSize: 14, lineHeight: 1.55,
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Got it.</div>
        We&apos;ve logged your request. A human will review it and reply to
        <strong> {requesterEmail}</strong> within 10 business days. If you don&apos;t
        hear back, email <a href="mailto:tryproblocks@gmail.com" style={{ color: 'inherit', fontWeight: 700 }}>tryproblocks@gmail.com</a>.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Field label="What do you want us to do?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {KIND_OPTIONS.map((o) => (
            <RadioRow key={o.id} name="kind" value={o.id} checked={kind === o.id} onChange={() => setKind(o.id)} label={o.label} description={o.description} />
          ))}
        </div>
      </Field>

      <Field label="Who are you?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ROLE_OPTIONS.map((o) => (
            <RadioRow key={o.id} name="role" value={o.id} checked={role === o.id} onChange={() => setRole(o.id)} label={o.label} description={o.description} />
          ))}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Your email *">
          <input
            type="email"
            required
            value={requesterEmail}
            onChange={(e) => setRequesterEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle()}
          />
        </Field>
        <Field label="Your name (optional)">
          <input
            type="text"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value.slice(0, 200))}
            style={inputStyle()}
          />
        </Field>
      </div>

      <Field
        label="About the student"
        hint="Anything that helps us find the right account. One of these is usually enough."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input
            type="text"
            placeholder="Student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value.slice(0, 200))}
            style={inputStyle()}
          />
          <input
            type="email"
            placeholder="Student email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value.slice(0, 200))}
            style={inputStyle()}
          />
        </div>
        <input
          type="text"
          placeholder="Student ID (if you have it)"
          value={studentUserId}
          onChange={(e) => setStudentUserId(e.target.value.slice(0, 200))}
          style={{ ...inputStyle(), marginTop: 10 }}
        />
      </Field>

      <Field label="Anything else?" hint="Optional — up to 2,000 characters.">
        <textarea
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
          placeholder="e.g. which fields to correct, which games to delete, or why you're opting out."
          style={{ ...inputStyle(), resize: 'vertical' }}
        />
      </Field>

      {error && (
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'var(--pb-coral-2, #fddad5)',
          color: 'var(--pb-coral-ink, #a03a2e)',
          fontSize: 13, fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px 22px', borderRadius: 12,
            background: 'var(--pb-ink, #1d1a14)',
            color: 'var(--pb-paper, #fff)',
            border: '1.5px solid var(--pb-ink, #1d1a14)',
            fontSize: 14, fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {submitting ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12.5, fontWeight: 700,
        color: 'var(--pb-ink, #1d1a14)',
        marginBottom: hint ? 2 : 6,
      }}>
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: 11.5, color: 'var(--pb-ink-muted, #6a6458)', margin: '0 0 6px' }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function RadioRow({
  name, value, checked, onChange, label, description,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: 12,
      background: checked ? 'var(--pb-cream-2, #fff5df)' : 'var(--pb-paper, #fff)',
      border: `1.5px solid ${checked ? 'var(--pb-ink, #1d1a14)' : 'var(--pb-line-2, #e5dfd2)'}`,
      cursor: 'pointer',
    }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ marginTop: 3 }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 2 }}>
          {description}
        </div>
      </div>
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1.5px solid var(--pb-line-2, #e5dfd2)',
    background: 'var(--pb-paper, #fff)',
    color: 'var(--pb-ink, #1d1a14)',
    fontSize: 13.5,
    fontFamily: 'inherit',
    outline: 'none',
  };
}
