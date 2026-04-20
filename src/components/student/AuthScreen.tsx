// Login / signup screen for students.
// Ported from problocks/project/pb_student/auth.jsx.
'use client';

import React, { useState } from 'react';
import { Block, Chunky, FloatBlock, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { GoogleGlyph } from './atoms';
import type { Invite, StudentUser } from './sample-data';

type Method = 'email' | 'google' | 'clever';

export const AuthScreen = ({
  pendingInvite, onAuthed, goJoin,
}: {
  pendingInvite: Invite | null;
  onAuthed: (u: StudentUser) => void;
  goJoin: () => void;
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inferred = (email.split('@')[0] || 'Student').replace(/\b\w/g, (c) => c.toUpperCase());
    onAuthed({
      name: name || inferred,
      email: email || 'student@school.edu',
      avatar: 'butter',
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <FloatBlock tone="butter" rot={-8} size={72} delay={0} style={{ position: 'absolute', top: 80, left: 80 }}>
          <Icon name="star" size={28} stroke={2.2}/>
        </FloatBlock>
        <FloatBlock tone="mint" rot={-4} size={64} delay={2.4} style={{ position: 'absolute', bottom: 120, left: 160 }}>
          <Icon name="gamepad" size={24}/>
        </FloatBlock>
        <FloatBlock tone="coral" rot={10} size={50} delay={1.2} style={{ position: 'absolute', top: 120, right: 120 }}/>
        <FloatBlock tone="grape" rot={-12} size={58} delay={0.6} style={{ position: 'absolute', bottom: 80, right: 180 }}>
          <Icon name="sparkle" size={22}/>
        </FloatBlock>
        <FloatBlock tone="pink" rot={6} size={40} delay={3.0} style={{ position: 'absolute', top: 240, left: 280 }}/>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
          <Icon name="logo-block" size={30}/>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>ProBlocks</span>
        </div>

        {pendingInvite && (
          <Block tone="mint" style={{ padding: 14, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--pbs-paper)',
              border: '1.5px solid var(--pbs-mint-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="sparkle" size={15} stroke={2.4}/>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.4, flex: 1 }}>
              <strong>{pendingInvite.teacher}</strong> invited you to{' '}
              <strong>{pendingInvite.className}</strong>.<br/>
              <span className="pbs-mono" style={{ fontSize: 11 }}>
                Sign in to start &ldquo;{pendingInvite.game}&rdquo;
              </span>
            </div>
          </Block>
        )}

        <Block tone="paper" style={{ padding: 28 }}>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.025em', fontWeight: 700 }}>
            {mode === 'login' ? <>Welcome back.</> : <>Make an <span className="pbs-serif">account</span>.</>}
          </h1>
          <p style={{ margin: '6px 0 20px', fontSize: 14, color: 'var(--pbs-ink-soft)' }}>
            {mode === 'login' ? 'Log in to keep building.' : 'It takes 20 seconds. Promise.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setMethod('google')} style={ssoStyle(method === 'google')}>
              <GoogleGlyph/> Google
            </button>
            <button onClick={() => setMethod('clever')} style={ssoStyle(method === 'clever')}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--pbs-sky)', border: '1.5px solid var(--pbs-sky-ink)' }}/>
              Clever
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--pbs-line-2)' }}/>
            <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>OR WITH EMAIL</div>
            <div style={{ flex: 1, height: 1, background: 'var(--pbs-line-2)' }}/>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mode === 'signup' && (
              <Field label="Your name" value={name} onChange={setName} placeholder="Ava P." />
            )}
            <Field label="Email or username" value={email} onChange={setEmail} placeholder="ava@ridgewood.school" />
            <Field label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <a href="#" style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Forgot password?</a>
              </div>
            )}

            <Chunky
              tone="butter"
              trailing="arrow-right"
              onClick={() => submit()}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Chunky>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--pbs-ink-soft)' }}>
            {mode === 'login' ? (
              <>New here? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} style={{ fontWeight: 700, color: 'var(--pbs-ink)' }}>Create account</a></>
            ) : (
              <>Already have one? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }} style={{ fontWeight: 700, color: 'var(--pbs-ink)' }}>Log in</a></>
            )}
          </div>
        </Block>

        <button onClick={goJoin} style={{
          width: '100%', marginTop: 14, padding: '12px 14px',
          borderRadius: 14, border: '1.5px dashed var(--pbs-line-2)',
          background: 'transparent', color: 'var(--pbs-ink-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13.5, fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer',
        }}>
          <Icon name="arrow-right" size={14} stroke={2.4}/> Got a class code or QR?
        </button>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11.5, color: 'var(--pbs-ink-muted)', lineHeight: 1.5 }}>
          By continuing you agree to our <a href="#" style={{ textDecoration: 'underline' }}>Terms</a> and <a href="#" style={{ textDecoration: 'underline' }}>COPPA</a> notice. <br/>
          Under 13? A parent or teacher will set this up for you.
        </div>
      </div>
    </div>
  );
};

const ssoStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 14px', borderRadius: 12,
  background: active ? 'var(--pbs-cream-2)' : 'var(--pbs-paper)',
  border: `1.5px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
  fontSize: 13.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
});

const Field = ({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) => (
  <label style={{ display: 'block' }}>
    <span className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '11px 14px', marginTop: 4,
        borderRadius: 12, border: '1.5px solid var(--pbs-line-2)',
        background: 'var(--pbs-cream)', color: 'var(--pbs-ink)',
        fontSize: 14, outline: 'none',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--pbs-ink)'; e.target.style.background = 'var(--pbs-paper)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--pbs-line-2)'; e.target.style.background = 'var(--pbs-cream)'; }}
    />
  </label>
);

export { Field };
