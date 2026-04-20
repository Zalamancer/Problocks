// Student app router: handles deep-link invites, auth, join, dashboard.
// Ported from problocks/project/pb_student/app.jsx (TWEAKS panel removed —
// replaced with the persistent DemoNav so the rest of the app stays in
// sync with the design's interactive demo).
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AuthScreen } from './AuthScreen';
import { JoinScreen } from './JoinScreen';
import { Dashboard, type AnyGame } from './Dashboard';
import { DemoNav, PlayModal, Toast, type ToastState } from './atoms';
import {
  EMOJI_CYCLE,
  SAMPLE_ASSIGNED,
  SAMPLE_CLASSES,
  TONE_CYCLE,
  type AssignedGame,
  type ClassRecord,
  type Invite,
  type StudentUser,
} from './sample-data';

type View = 'auth' | 'join' | 'dashboard';

const parseHashInvite = (): Invite | null => {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  const m = h.match(/#\/join\/([A-Z0-9]{4,8})/i);
  if (!m) return null;
  const params = new URLSearchParams(h.split('?')[1] || '');
  return {
    code: m[1].toUpperCase(),
    className: params.get('class') || 'Ms. Rivera — Period 3',
    teacher: params.get('teacher') || 'Ms. Rivera',
    game: params.get('game') || 'Linear Equations Relay',
    questions: Number(params.get('q')) || 12,
    minutes: Number(params.get('min')) || 15,
  };
};

export type StartView = View;

export const StudentApp = ({ startView = 'dashboard' }: { startView?: StartView }) => {
  const [view, setView] = useState<View>(startView);
  const [user, setUser] = useState<StudentUser | null>(
    startView === 'dashboard' ? { name: 'Ava Park', email: 'ava@ridgewood.school' } : null,
  );
  const [classes, setClasses] = useState<ClassRecord[]>(SAMPLE_CLASSES);
  const [assigned, setAssigned] = useState<AssignedGame[]>(SAMPLE_ASSIGNED);
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [playing, setPlaying] = useState<AnyGame | null>(null);

  const showToast = useCallback((msg: string, tone: ToastState['tone'] = 'butter') => {
    const next: ToastState = { msg, tone, id: Date.now() };
    setToast(next);
    window.setTimeout(() => {
      setToast((cur) => (cur && cur.id === next.id ? null : cur));
    }, 2800);
  }, []);

  // Deep-link handling — pick up `#/join/CODE?...` and route appropriately.
  useEffect(() => {
    const check = () => {
      const inv = parseHashInvite();
      if (inv) {
        setPendingInvite(inv);
        setView(user ? 'join' : 'auth');
      }
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [user]);

  const handleAuthed = (u: StudentUser, classCode?: string) => {
    setUser(u);
    if (classCode) {
      setPendingInvite({
        code: classCode,
        className: 'Your class',
        teacher: 'Your teacher',
        game: '',
        questions: 0,
        minutes: 0,
      });
      setView('join');
    } else if (pendingInvite) {
      setView('join');
    } else {
      setView('dashboard');
    }
    showToast(`Welcome, ${u.name.split(' ')[0]}!`, 'butter');
  };

  const handleJoined = (invite: Invite) => {
    const newClass: ClassRecord = {
      id: 'c-' + Date.now(),
      name: invite.className,
      subject: invite.className.split(' — ').pop() || 'New class',
      teacher: invite.teacher,
      tone: TONE_CYCLE[classes.length % TONE_CYCLE.length],
      emoji: EMOJI_CYCLE[classes.length % EMOJI_CYCLE.length],
      members: 20 + Math.floor(Math.random() * 14),
    };
    const exists = classes.find((c) => c.name === invite.className);
    const cls = exists || newClass;
    if (!exists) setClasses([cls, ...classes]);

    if (invite.game) {
      const newGame: AssignedGame = {
        id: 'a-' + Date.now(),
        title: invite.game,
        classId: cls.id,
        subject: cls.subject,
        tone: cls.tone,
        icon: 'bolt',
        due: 'Due today',
        minutes: invite.minutes || 15,
        questions: invite.questions || 12,
        kind: 'Live',
        status: 'new',
      };
      setAssigned([newGame, ...assigned.filter((a) => a.title !== invite.game)]);
      setPendingInvite(null);
      setPlaying(newGame);
      setView('dashboard');
      showToast(`Joined ${cls.subject}. Starting now…`, 'mint');
    } else {
      setPendingInvite(null);
      setView('dashboard');
      showToast(`Joined ${cls.subject}`, 'mint');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setPendingInvite(null);
  };

  const ensureDemoUser = () => {
    if (!user) setUser({ name: 'Ava Park', email: 'ava@ridgewood.school' });
  };

  return (
    <>
      {view === 'auth' && (
        <AuthScreen
          pendingInvite={pendingInvite}
          onAuthed={handleAuthed}
          goJoin={() => setView(user ? 'join' : 'auth')}
        />
      )}
      {view === 'join' && (
        <JoinScreen
          user={user}
          pendingInvite={pendingInvite}
          onJoined={handleJoined}
          goBack={() => {
            setPendingInvite(null);
            setView(user ? 'dashboard' : 'auth');
          }}
        />
      )}
      {view === 'dashboard' && user && (
        <Dashboard
          user={user}
          classes={classes}
          assigned={assigned}
          onPlay={(g) => setPlaying(g)}
          onJoinClass={() => setView('join')}
          onLogout={handleLogout}
        />
      )}

      {toast && <Toast toast={toast}/>}
      {playing && <PlayModal game={playing} onClose={() => setPlaying(null)}/>}

      <DemoNav
        view={view}
        setView={setView}
        hasUser={!!user}
        onNeedUser={ensureDemoUser}
      />
    </>
  );
};
