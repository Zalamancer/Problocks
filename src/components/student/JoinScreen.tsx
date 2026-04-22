// Join class flow: by code, by QR scan, or auto-join via shared link.
// Ported from problocks/project/pb_student/join.jsx.
'use client';

import React, { useEffect, useState } from 'react';
import { Block, Chunky, FloatBlock, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { QrGlyph } from './atoms';
import { useDataSourceStore } from '@/store/data-source-store';
import type { Invite, StudentUser } from './sample-data';

export const JoinScreen = ({
  user, pendingInvite, onJoined, goBack, mode: initialMode = 'choose',
}: {
  user: StudentUser | null;
  pendingInvite: Invite | null;
  onJoined: (i: Invite) => void;
  goBack: () => void;
  mode?: 'choose' | 'invite';
}) => {
  const [mode, setMode] = useState<'choose' | 'invite'>(pendingInvite ? 'invite' : initialMode);
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const useReal = useDataSourceStore((s) => s.useRealData);

  useEffect(() => {
    if (pendingInvite) setMode('invite');
  }, [pendingInvite]);

  if (mode === 'invite' && pendingInvite) {
    return (
      <InviteAccept
        invite={pendingInvite}
        user={user}
        onAccept={() => onJoined(pendingInvite)}
        goBack={goBack}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        <button onClick={goBack} style={backBtn}>
          <Icon name="arrow-right" size={14} stroke={2.4} style={{ transform: 'rotate(180deg)' }}/> Back
        </button>

        <Block tone="paper" style={{ padding: 28, marginTop: 10 }}>
          <Pill tone="mint" icon="users">Join a class</Pill>
          <h1 style={{ margin: '14px 0 4px', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em' }}>
            Got a code from your <span className="pbs-serif">teacher?</span>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--pbs-ink-soft)' }}>
            Type it in, or scan the QR on the board.
          </p>

          <div style={{ marginTop: 22 }}>
            <span className="pbs-mono" style={labelSty}>CLASS CODE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const ch = (code[i] || '').toUpperCase();
                return (
                  <div key={i} style={{
                    height: 62, borderRadius: 14,
                    background: ch ? 'var(--pbs-butter)' : 'var(--pbs-cream)',
                    border: `1.5px solid ${ch ? 'var(--pbs-butter-ink)' : 'var(--pbs-line-2)'}`,
                    boxShadow: ch ? '0 3px 0 var(--pbs-butter-ink)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 700,
                    color: ch ? 'var(--pbs-butter-ink)' : 'var(--pbs-ink-muted)',
                    letterSpacing: '0.02em',
                    transition: 'all 140ms ease',
                  }}>{ch || '·'}</div>
                );
              })}
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))}
              placeholder="e.g. BLOCK42"
              autoFocus
              style={{
                width: '100%', marginTop: 10,
                padding: '12px 14px', borderRadius: 12,
                border: '1.5px solid var(--pbs-line-2)', background: 'var(--pbs-cream)',
                fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                outline: 'none', color: 'var(--pbs-ink)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--pbs-ink)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--pbs-line-2)')}
            />
          </div>

          <Chunky
            tone={code.length === 6 ? 'butter' : 'ghost'}
            trailing="arrow-right"
            onClick={() => code.length === 6 && onJoined(
              useReal
                ? {
                    code: code.toUpperCase(),
                    className: `Class ${code.toUpperCase()}`,
                    teacher: '',
                  }
                : {
                    code: code.toUpperCase(),
                    className: 'Ms. Rivera — Period 3',
                    teacher: 'Ms. Rivera',
                  }
            )}
            style={{
              width: '100%', justifyContent: 'center',
              marginTop: 16, opacity: code.length === 6 ? 1 : 0.55,
            }}
          >
            {code.length === 6 ? 'Join class' : 'Enter 6-character code'}
          </Chunky>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--pbs-line-2)' }}/>
            <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>OR</div>
            <div style={{ flex: 1, height: 1, background: 'var(--pbs-line-2)' }}/>
          </div>

          <button onClick={() => setScanning(true)} style={scanBtn}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <QrGlyph size={26} color="#fdf6e6"/>
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Scan the QR on the board</div>
              <div style={{ fontSize: 12, color: 'var(--pbs-ink-soft)' }}>
                We&rsquo;ll use your camera to read it
              </div>
            </div>
            <Icon name="arrow-right" size={16} stroke={2.2}/>
          </button>
        </Block>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12.5, color: 'var(--pbs-ink-muted)' }}>
          No code? <a href="#" style={{ textDecoration: 'underline', fontWeight: 600 }}>Browse public games</a>
        </div>
      </div>

      {scanning && (
        <Scanner
          onClose={() => setScanning(false)}
          onRead={(invite) => { setScanning(false); onJoined(invite); }}
        />
      )}
    </div>
  );
};

const InviteAccept = ({
  invite, user, onAccept, goBack,
}: {
  invite: Invite;
  user: StudentUser | null;
  onAccept: () => void;
  goBack: () => void;
}) => (
  <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '100%', maxWidth: 480 }}>

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <Pill tone="coral" icon="sparkle">Invited by a teacher</Pill>
      </div>

      <Block tone="paper" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 14px' }}>
          <FloatBlock tone="butter" size={72} rot={-6}>
            <div style={{ fontSize: 30 }}>🎮</div>
          </FloatBlock>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>
          Join <span className="pbs-serif">&ldquo;{invite.className}&rdquo;</span>
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--pbs-ink-soft)' }}>
          with {invite.teacher}
        </p>

        <div style={{
          marginTop: 22, padding: 16, borderRadius: 14,
          background: 'var(--pbs-cream-2)',
          border: '1.5px dashed var(--pbs-line-2)',
        }}>
          <div className="pbs-mono" style={{
            fontSize: 10.5, color: 'var(--pbs-ink-muted)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            Starts with
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'var(--pbs-grape)',
              border: '1.5px solid var(--pbs-grape-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="gamepad" size={24} stroke={2.2}/>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{invite.game}</div>
              <div style={{ fontSize: 12, color: 'var(--pbs-ink-soft)' }}>
                {invite.questions || 12} questions · ~{invite.minutes || 15} min
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: 13, color: 'var(--pbs-ink-soft)' }}>
          Joining as <strong style={{ color: 'var(--pbs-ink)' }}>{user?.name || 'You'}</strong>
        </div>

        <Chunky
          tone="butter"
          trailing="arrow-right"
          onClick={onAccept}
          style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
        >
          Accept &amp; play
        </Chunky>
        <button
          onClick={goBack}
          style={{
            marginTop: 10, fontSize: 12.5, color: 'var(--pbs-ink-muted)',
            padding: 6, background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Not now
        </button>
      </Block>
    </div>
  </div>
);

const Scanner = ({
  onClose, onRead,
}: {
  onClose: () => void;
  onRead: (i: Invite) => void;
}) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 2400);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        onRead({
          className: 'Mr. Chen — AP Bio',
          teacher: 'Mr. Chen',
          code: 'QR9X4K',
          game: 'Cell Organelle Showdown',
          minutes: 12,
          questions: 10,
          auto: true,
        });
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onRead]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(29,26,20,0.82)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, backdropFilter: 'blur(6px)',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380 }} className="pbs-pop-in">
        <div style={{ textAlign: 'center', color: 'var(--pbs-cream)', marginBottom: 14 }}>
          <div className="pbs-mono" style={{ fontSize: 11, letterSpacing: '0.15em', opacity: 0.8 }}>POINT AT THE QR</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>Scanning…</div>
        </div>
        <div style={{
          aspectRatio: '1 / 1', borderRadius: 20,
          background: 'linear-gradient(135deg, #2a2620, #4a3f2e)',
          position: 'relative', overflow: 'hidden',
          border: '1.5px solid rgba(255,216,77,0.4)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.35 + progress * 0.6,
          }}>
            <QrGlyph size={180} color="#fdf6e6"/>
          </div>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
            <div key={c} style={{
              position: 'absolute', width: 40, height: 40,
              borderColor: 'var(--pbs-butter)', borderStyle: 'solid',
              borderWidth: c === 'tl' ? '3px 0 0 3px'
                : c === 'tr' ? '3px 3px 0 0'
                : c === 'bl' ? '0 0 3px 3px'
                : '0 3px 3px 0',
              borderRadius: c === 'tl' ? '14px 0 0 0'
                : c === 'tr' ? '0 14px 0 0'
                : c === 'bl' ? '0 0 0 14px'
                : '0 0 14px 0',
              top: c.startsWith('t') ? 16 : undefined,
              bottom: c.startsWith('b') ? 16 : undefined,
              left: c.endsWith('l') ? 16 : undefined,
              right: c.endsWith('r') ? 16 : undefined,
            }}/>
          ))}
          <div style={{
            position: 'absolute', left: 16, right: 16,
            top: `${16 + progress * (100 - 32)}%`, height: 2,
            background: 'var(--pbs-butter)',
            boxShadow: '0 0 16px 4px rgba(255,216,77,0.7)',
          }}/>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 14, width: '100%', padding: 12, borderRadius: 12,
            background: 'transparent', border: '1.5px solid rgba(253,246,230,0.3)',
            color: 'var(--pbs-cream)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const backBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 999,
  background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
  fontSize: 12.5, fontWeight: 600, color: 'var(--pbs-ink-soft)',
  cursor: 'pointer', fontFamily: 'inherit',
};
const labelSty: React.CSSProperties = {
  fontSize: 10.5, color: 'var(--pbs-ink-muted)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};
const scanBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
  padding: 14, borderRadius: 14,
  background: 'var(--pbs-cream-2)',
  border: '1.5px solid var(--pbs-line-2)',
  color: 'var(--pbs-ink)',
  cursor: 'pointer', fontFamily: 'inherit',
};
