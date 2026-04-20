// Student dashboard: classes, upcoming games, explore/library, stats.
// Ported from problocks/project/pb_student/dashboard.jsx.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { AvatarBlob } from './atoms';
import { RobloxAvatar } from './RobloxAvatar';
import {
  EXPLORE,
  SAMPLE_RECENT,
  type AssignedGame,
  type ClassRecord,
  type ExploreGame,
  type RecentGame,
  type StudentUser,
} from './sample-data';

type Tab = 'home' | 'classes' | 'explore' | 'library';
export type AnyGame = AssignedGame | ExploreGame | RecentGame | { title: string; icon?: string; tone?: string; questions?: number; minutes?: number };

export const Dashboard = ({
  user, classes, assigned, onPlay, onJoinClass, onLogout,
}: {
  user: StudentUser;
  classes: ClassRecord[];
  assigned: AssignedGame[];
  onPlay: (g: AnyGame) => void;
  onJoinClass: () => void;
  onLogout: () => void;
}) => {
  const [tab, setTab] = useState<Tab>('home');
  const streak = 7;
  const coins = 2480;
  const xp = 1840;
  const xpNext = 2500;

  return (
    <div style={{ minHeight: '100vh' }}>

      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(253,246,230,0.85)', backdropFilter: 'blur(10px)',
        borderBottom: '1.5px solid var(--pbs-line)',
      }}>
        <div className="pbs-wrap" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="logo-block" size={26}/>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>ProBlocks</span>
          </div>
          <nav style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
            {([
              ['home', 'Home'],
              ['classes', 'My classes'],
              ['explore', 'Explore'],
              ['library', 'Library'],
            ] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={tabBtn(tab === k)}>{l}</button>
            ))}
          </nav>
          <div style={{ flex: 1 }}/>
          <StatChip icon="bolt" tone="butter" value={String(streak)} label="day streak"/>
          <StatChip icon="coin" tone="mint" value={coins.toLocaleString()} label="blocks"/>
          <AvatarMenu user={user} onLogout={onLogout}/>
        </div>
      </header>

      <main className="pbs-wrap" style={{ padding: '32px 28px 80px' }}>

        {tab === 'home' && (
          <HomeTab
            user={user}
            classes={classes}
            assigned={assigned}
            xp={xp}
            xpNext={xpNext}
            onPlay={onPlay}
            onJoinClass={onJoinClass}
          />
        )}
        {tab === 'classes' && (
          <ClassesTab classes={classes} assigned={assigned} onPlay={onPlay} onJoinClass={onJoinClass}/>
        )}
        {tab === 'explore' && <ExploreTab onPlay={onPlay}/>}
        {tab === 'library' && <LibraryTab onPlay={onPlay}/>}

      </main>
    </div>
  );
};

// ─────────────── Home tab ───────────────

const HomeTab = ({
  user, classes, assigned, xp, xpNext, onPlay, onJoinClass,
}: {
  user: StudentUser;
  classes: ClassRecord[];
  assigned: AssignedGame[];
  xp: number;
  xpNext: number;
  onPlay: (g: AnyGame) => void;
  onJoinClass: () => void;
}) => {
  const firstName = (user?.name || 'You').split(' ')[0];
  const next = assigned[0];

  return (
    <div className="pbs-student-home" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <div className="pbs-mono" style={kickerSty}>TUESDAY · APR 22</div>
          <h1 style={{
            margin: '6px 0 0',
            fontSize: 'clamp(34px, 4.4vw, 52px)',
            fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.02,
          }}>
            Hey <span className="pbs-serif">{firstName}</span>, ready to play?
          </h1>

          {next && (
            <Block tone={next.tone} style={{ marginTop: 18, padding: 22, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 16,
                  background: 'var(--pbs-paper)',
                  border: '1.5px solid currentColor',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 0 currentColor',
                  flexShrink: 0,
                }}>
                  <Icon name={next.icon as 'bolt'} size={34} stroke={2.2}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <Pill tone="paper" icon="users">
                      {classes.find((c) => c.id === next.classId)?.teacher || 'Class'}
                    </Pill>
                    <Pill tone="paper">{next.kind}</Pill>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {next.title}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, opacity: 0.75 }}>
                    {next.due} · {next.questions} Qs · ~{next.minutes} min
                  </div>
                </div>
                <Chunky tone="ink" trailing="arrow-right" onClick={() => onPlay(next)}>
                  {next.status === 'inprogress' ? 'Resume' : 'Start'}
                </Chunky>
              </div>
              {next.status === 'inprogress' && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(29,26,20,0.12)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(next.progress || 0) * 100}%`,
                      height: '100%', background: 'var(--pbs-ink)', borderRadius: 999,
                    }}/>
                  </div>
                </div>
              )}
            </Block>
          )}
        </div>

        <section>
          <SectionHead title="Assigned to you" count={assigned.length}/>
          <div style={{
            display: 'grid', gap: 14,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}>
            {assigned.map((a) => (
              <AssignedCard
                key={a.id}
                a={a}
                cls={classes.find((c) => c.id === a.classId)}
                onPlay={() => onPlay(a)}
              />
            ))}
            <button onClick={onJoinClass} style={addCard}>
              <div style={{ fontSize: 22, color: 'var(--pbs-ink-soft)' }}>＋</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--pbs-ink-soft)' }}>
                Have a class code?
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)' }}>
                Join with a code or QR
              </div>
            </button>
          </div>
        </section>

        <section>
          <SectionHead title="Recent plays" linkLabel="View all"/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {SAMPLE_RECENT.map((r) => <RecentCard key={r.id} r={r}/>)}
          </div>
        </section>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <Block tone="ink" style={{ padding: 22, color: 'var(--pbs-cream)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14 }}>
            {/* Wrapper supplies the height that `size="fill"` reads from
                (the parent flex column has no explicit height). Square
                aspect = avatar fills full card width without the chunky
                butter frame. */}
            <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
              <RobloxAvatar
                size="fill"
                framed={false}
                outfit={{
                  // Omit `skin` → default kraft-cardboard look kicks in.
                  shirt: '#6fbf73',
                  pants: '#3a3c4a',
                  face: 'smile',
                  hair: 'short',
                  hairColor: '#3a2a1a',
                }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>{user?.name || 'You'}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{user?.email || 'student@school.edu'}</div>
            </div>
            <Chunky
              as="a"
              href="/student/wardrobe"
              tone="butter"
              icon="sparkle"
              trailing="arrow-right"
              // Inline color: parent <Block tone="ink"> sets color:cream
              // inline, which the .pbs-chunky-butter class can't beat in
              // this layer order — so spell out butter-ink directly.
              style={{
                width: '100%',
                justifyContent: 'center',
                color: 'var(--pbs-butter-ink)',
              }}
            >
              Customize avatar
            </Chunky>
            <Chunky
              as="a"
              href="/student/crates"
              tone="ghost"
              icon="star"
              trailing="arrow-right"
              // Match Footer.tsx's "ghost on dark bg" treatment: transparent
              // body + cream outline + cream text so it reads on the ink card.
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'transparent',
                color: 'var(--pbs-cream)',
                borderColor: 'var(--pbs-cream)',
                boxShadow: '0 4px 0 var(--pbs-cream)',
              }}
            >
              Open crates
            </Chunky>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ opacity: 0.75 }}>Level 14</span>
              <span className="pbs-mono" style={{ opacity: 0.9 }}>
                {xp.toLocaleString()} / {xpNext.toLocaleString()} XP
              </span>
            </div>
            <div style={{
              height: 10, borderRadius: 999,
              background: 'rgba(253,246,230,0.15)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${(xp / xpNext) * 100}%`, height: '100%',
                background: 'linear-gradient(90deg, var(--pbs-butter), var(--pbs-coral))',
                borderRadius: 999,
              }}/>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniStat label="Won" value="48"/>
            <MiniStat label="Accuracy" value="86%"/>
          </div>
        </Block>

        <Block tone="paper" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>My classes</div>
            <button
              onClick={onJoinClass}
              style={{
                fontSize: 11.5, fontWeight: 700, color: 'var(--pbs-butter-ink)',
                padding: 4, background: 'transparent', border: 0,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >+ Join</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {classes.map((c) => <ClassRow key={c.id} c={c}/>)}
          </div>
        </Block>

        <Block tone="pink" style={{ padding: 18 }}>
          <Pill tone="paper" icon="star">Daily challenge</Pill>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8, letterSpacing: '-0.015em' }}>
            Solve 5 word problems in a row.
          </div>
          <div style={{ fontSize: 12, color: 'var(--pbs-pink-ink)', marginTop: 4, opacity: 0.85 }}>
            Reward: 200 blocks + streak shield
          </div>
          <Chunky
            tone="ink"
            trailing="arrow-right"
            style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
            onClick={() => onPlay({ title: 'Daily challenge', icon: 'star', tone: 'pink' })}
          >
            Try it
          </Chunky>
        </Block>
      </aside>
    </div>
  );
};

// ─────────────── Classes tab ───────────────

const ClassesTab = ({
  classes, assigned, onPlay, onJoinClass,
}: {
  classes: ClassRecord[];
  assigned: AssignedGame[];
  onPlay: (g: AnyGame) => void;
  onJoinClass: () => void;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
      <div>
        <div className="pbs-mono" style={kickerSty}>YOUR CLASSES</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em' }}>
          {classes.length} classes, {assigned.length} assignments
        </h1>
      </div>
      <Chunky tone="butter" icon="plus" onClick={onJoinClass}>Join a class</Chunky>
    </div>

    <div style={{
      display: 'grid', gap: 16,
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    }}>
      {classes.map((c) => {
        const cAssigned = assigned.filter((a) => a.classId === c.id);
        return (
          <Block key={c.id} tone={c.tone} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                fontSize: 32, width: 52, height: 52, borderRadius: 14,
                background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{c.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{c.subject}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{c.teacher} · {c.members} classmates</div>
              </div>
            </div>
            <div style={{
              marginTop: 16, padding: 12, borderRadius: 12,
              background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
            }}>
              <div className="pbs-mono" style={{
                fontSize: 10.5, opacity: 0.7,
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
              }}>
                {cAssigned.length ? 'Assigned' : 'No assignments'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cAssigned.length ? cAssigned.map((a) => (
                  <button key={a.id} onClick={() => onPlay(a)} style={mini}>
                    <Icon name={a.icon as 'bolt'} size={14} stroke={2.2}/>
                    <div style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                    <span style={{ fontSize: 11, opacity: 0.7 }}>{a.due.replace('Due ', '')}</span>
                  </button>
                )) : (
                  <div style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Check back later.</div>
                )}
              </div>
            </div>
          </Block>
        );
      })}

      <button onClick={onJoinClass} style={addCardBig}>
        <div style={{ fontSize: 32, color: 'var(--pbs-ink-soft)' }}>＋</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Join another class</div>
        <div style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
          Code, QR, or invite link
        </div>
      </button>
    </div>
  </div>
);

// ─────────────── Explore tab ───────────────

const ExploreTab = ({ onPlay }: { onPlay: (g: AnyGame) => void }) => (
  <div>
    <div className="pbs-mono" style={kickerSty}>EXPLORE</div>
    <h1 style={{ margin: '6px 0 20px', fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em' }}>
      Free-play games <span className="pbs-serif">just for you.</span>
    </h1>

    <div style={{
      display: 'grid', gap: 14,
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    }}>
      {EXPLORE.map((g) => (
        <Block key={g.id} tone={g.tone} style={{ padding: 18, cursor: 'pointer' }} onClick={() => onPlay(g)}>
          <div style={{
            aspectRatio: '4/3', borderRadius: 12,
            background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Icon name={g.icon as 'coin'} size={52} stroke={1.6}/>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{g.title}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{g.subject}</div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
            <Icon name="users" size={12} stroke={2.2}/> {g.plays} plays
          </div>
        </Block>
      ))}
    </div>
  </div>
);

// ─────────────── Library tab ───────────────

const LibraryTab = ({ onPlay: _onPlay }: { onPlay: (g: AnyGame) => void }) => (
  <div>
    <div className="pbs-mono" style={kickerSty}>YOUR LIBRARY</div>
    <h1 style={{ margin: '6px 0 20px', fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em' }}>
      Games you&rsquo;ve <span className="pbs-serif">loved.</span>
    </h1>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {[...SAMPLE_RECENT, ...EXPLORE.slice(0, 3).map((e) => ({
        id: e.id, title: e.title, plays: e.plays, tone: e.tone, icon: e.icon,
      } as RecentGame))].map((r, i) => <RecentCard key={r.id + i} r={r}/>)}
    </div>
  </div>
);

// ─────────────── Small pieces ───────────────

const SectionHead = ({ title, count, linkLabel }: { title: string; count?: number; linkLabel?: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em' }}>
      {title} {count != null && <span style={{ color: 'var(--pbs-ink-muted)', fontWeight: 500 }}>· {count}</span>}
    </h2>
    {linkLabel && <a href="#" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pbs-ink-soft)' }}>{linkLabel} →</a>}
  </div>
);

const AssignedCard = ({
  a, cls, onPlay,
}: { a: AssignedGame; cls?: ClassRecord; onPlay: () => void }) => (
  <Block tone={a.tone} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={a.icon as 'bolt'} size={22} stroke={2.2}/>
      </div>
      <Pill tone="paper">{a.kind}</Pill>
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{a.title}</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>
        {cls?.teacher || a.subject} · {a.questions} Qs
      </div>
    </div>
    {a.status === 'inprogress' && (
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(29,26,20,0.15)', overflow: 'hidden' }}>
        <div style={{
          width: `${(a.progress || 0) * 100}%`, height: '100%',
          background: 'currentColor', borderRadius: 999, opacity: 0.85,
        }}/>
      </div>
    )}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11.5, opacity: 0.8 }}>{a.due}</span>
      <button onClick={onPlay} style={playBtn}>
        <Icon name="play" size={10}/> {a.status === 'inprogress' ? 'Resume' : 'Play'}
      </button>
    </div>
  </Block>
);

const RecentCard = ({ r }: { r: RecentGame }) => (
  <Block tone={r.tone} style={{ padding: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={r.icon as 'music'} size={20}/>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.title}</div>
    </div>
    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ opacity: 0.8 }}>{r.rank || r.plays}</span>
      {r.score != null && <span className="pbs-mono" style={{ fontWeight: 700 }}>{r.score}%</span>}
    </div>
  </Block>
);

const ClassRow = ({ c }: { c: ClassRecord }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: `var(--pbs-${c.tone})`, border: `1.5px solid var(--pbs-${c.tone}-ink)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
    }}>{c.emoji}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 12.5, fontWeight: 700,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{c.subject}</div>
      <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>{c.teacher}</div>
    </div>
  </div>
);

const AvatarMenu = ({
  user, onLogout,
}: { user: StudentUser; onLogout: () => void }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        style={avatarBtn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={user?.name || 'Account'}
      >
        <AvatarBlob tone="butter" size={36}/>
      </button>
      {open && (
        <div role="menu" style={menuSty}>
          <div style={menuHeaderSty}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {user?.name || 'Student'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
              {user?.email || ''}
            </div>
          </div>
          <Link href="/student/profile" role="menuitem" style={menuItemSty} onClick={() => setOpen(false)}>
            <Icon name="users" size={14} stroke={2.2}/>
            <span>Profile</span>
          </Link>
          <Link href="/student/settings" role="menuitem" style={menuItemSty} onClick={() => setOpen(false)}>
            <Icon name="bolt" size={14} stroke={2.2}/>
            <span>Settings</span>
          </Link>
          <div style={menuDividerSty}/>
          <button
            role="menuitem"
            style={{ ...menuItemSty, color: 'var(--pbs-coral-ink)' }}
            onClick={() => { setOpen(false); onLogout(); }}
          >
            <Icon name="arrow-right" size={14} stroke={2.2}/>
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
};

const StatChip = ({
  icon, tone, value, label,
}: { icon: 'bolt' | 'coin'; tone: 'butter' | 'mint'; value: string; label: string }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px 6px 8px', borderRadius: 999,
    background: `var(--pbs-${tone})`,
    color: `var(--pbs-${tone}-ink)`,
    border: `1.5px solid var(--pbs-${tone}-ink)`,
    fontSize: 13, fontWeight: 700,
  }}>
    <Icon name={icon} size={14} stroke={2.4}/>
    {value} <span style={{ fontWeight: 500, opacity: 0.8, fontSize: 11.5 }}>{label}</span>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    padding: 10, borderRadius: 10,
    background: 'rgba(253,246,230,0.08)',
    border: '1.5px solid rgba(253,246,230,0.15)',
  }}>
    <div style={{ fontSize: 11, opacity: 0.6 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{value}</div>
  </div>
);

// Styles
const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px', borderRadius: 999,
  background: active ? 'var(--pbs-ink)' : 'transparent',
  color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
  fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.005em',
  border: 0, cursor: 'pointer', fontFamily: 'inherit',
});
const avatarBtn: React.CSSProperties = {
  padding: 2, borderRadius: 12, background: 'transparent', border: 0, cursor: 'pointer',
};
const menuSty: React.CSSProperties = {
  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
  minWidth: 200, padding: 6,
  background: 'var(--pbs-paper)',
  border: '1.5px solid var(--pbs-line-2)',
  borderRadius: 14,
  boxShadow: '0 4px 0 var(--pbs-line-2), 0 18px 40px -12px rgba(0,0,0,0.25)',
  zIndex: 40,
  display: 'flex', flexDirection: 'column', gap: 2,
};
const menuHeaderSty: React.CSSProperties = {
  padding: '10px 12px 8px',
  borderBottom: '1px solid var(--pbs-line)',
  marginBottom: 4,
};
const menuItemSty: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px', borderRadius: 10,
  background: 'transparent', border: 0,
  color: 'var(--pbs-ink)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  textDecoration: 'none', textAlign: 'left', width: '100%',
};
const menuDividerSty: React.CSSProperties = {
  height: 1, background: 'var(--pbs-line)', margin: '4px 0',
};
const kickerSty: React.CSSProperties = {
  fontSize: 11, color: 'var(--pbs-ink-muted)',
  textTransform: 'uppercase', letterSpacing: '0.12em',
};
const addCard: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
  minHeight: 180, padding: 18, borderRadius: 'var(--pbs-radius)',
  background: 'var(--pbs-paper)', border: '1.5px dashed var(--pbs-line-2)',
  cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
};
const addCardBig: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: 220, padding: 20, borderRadius: 'var(--pbs-radius)',
  background: 'transparent', border: '1.5px dashed var(--pbs-line-2)',
  color: 'var(--pbs-ink)', cursor: 'pointer', fontFamily: 'inherit',
};
const mini: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '8px 10px', borderRadius: 10,
  background: 'transparent', color: 'currentColor',
  width: '100%', border: 0, cursor: 'pointer', fontFamily: 'inherit',
};
const playBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '7px 12px', borderRadius: 999,
  background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
  fontSize: 12, fontWeight: 700,
  border: 0, cursor: 'pointer', fontFamily: 'inherit',
};
