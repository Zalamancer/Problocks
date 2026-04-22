// Student app router — real Supabase auth (no more DemoNav).
// View derives from session: signed-out → AuthScreen, signed-in → Dashboard,
// deep-link `#/join/CODE` routes to JoinScreen once the user is signed in.
// Sample class/assignment data still seeds the dashboard (wiring to the DB is
// a separate task tracked in the vault roadmap).
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { AuthScreen } from './AuthScreen';
import { JoinScreen } from './JoinScreen';
import { Dashboard, type AnyGame } from './Dashboard';
import { ClassDetail } from './ClassDetail';
import { PlayModal, Toast, type ToastState } from './atoms';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useDataSourceStore } from '@/store/data-source-store';
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

type View = 'auth' | 'join' | 'dashboard' | 'class';

const parseHashInvite = (): Invite | null => {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  const m = h.match(/#\/join\/([A-Z0-9]{4,8})/i);
  if (!m) return null;
  const params = new URLSearchParams(h.split('?')[1] || '');
  return {
    code: m[1].toUpperCase(),
    className: params.get('class') || 'Your class',
    teacher: params.get('teacher') || 'Your teacher',
    game: params.get('game') || '',
    questions: Number(params.get('q')) || 0,
    minutes: Number(params.get('min')) || 0,
  };
};

// Module-scoped cache so remounts (e.g. browser back from /student/wardrobe)
// don't flash the "Loading…" screen while getSession() re-resolves. The
// value is `undefined` until the first resolution, then `Session | null`.
let cachedSession: Session | null | undefined = undefined;

const sessionToUser = (session: Session | null): StudentUser | null => {
  if (!session?.user) return null;
  const meta = session.user.user_metadata || {};
  const email = session.user.email || '';
  const inferred = (email.split('@')[0] || 'Student').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    name: (meta.name as string) || (meta.full_name as string) || inferred,
    email,
    avatar: (meta.avatar as string) || 'butter',
  };
};

export const StudentApp = () => {
  const router = useRouter();
  // Hydrate from the module-scoped cache on every mount. If we've already
  // resolved a session in this page lifetime, we skip the loading flash.
  const initialUser = cachedSession !== undefined ? sessionToUser(cachedSession) : null;
  const [sessionReady, setSessionReady] = useState(cachedSession !== undefined);
  const [user, setUser] = useState<StudentUser | null>(initialUser);
  const [view, setView] = useState<View>(
    cachedSession !== undefined ? (initialUser ? 'dashboard' : 'auth') : 'auth',
  );
  // Data-source toggle — "mock" seeds from sample-data.ts, "real" starts
  // empty until Supabase-backed student schema (classes / assignments) ships.
  const useRealData = useDataSourceStore((s) => s.useRealData);
  const setUseRealData = useDataSourceStore((s) => s.setUseRealData);
  const [classes, setClasses] = useState<ClassRecord[]>(useRealData ? [] : SAMPLE_CLASSES);
  const [assigned, setAssigned] = useState<AssignedGame[]>(useRealData ? [] : SAMPLE_ASSIGNED);
  // Re-hydrate when the toggle flips mid-session.
  useEffect(() => {
    setClasses(useRealData ? [] : SAMPLE_CLASSES);
    setAssigned(useRealData ? [] : SAMPLE_ASSIGNED);
  }, [useRealData]);

  // If the student signed in via /join/:classId (NextAuth), fetch their real
  // enrolled classes and drop them into the dashboard. When any real class is
  // found we auto-flip the data-source toggle to "real" so the dashboard
  // reflects their actual roster instead of the mock seed, and we use the
  // NextAuth profile as the `user` so the dashboard renders even without an
  // active Supabase session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/students/me');
        if (!res.ok) return;
        const j = (await res.json()) as {
          user: { name: string; email: string; picture: string | null };
          classes: Array<{ id: string; name: string; subject: string | null; grade: string | null; color: string | null }>;
        };
        if (cancelled || !j.classes?.length) return;
        const mapped: ClassRecord[] = j.classes.map((c, i) => ({
          id: c.id,
          name: c.name,
          subject: c.subject ?? c.name,
          teacher: 'Your teacher',
          tone: TONE_CYCLE[i % TONE_CYCLE.length],
          emoji: EMOJI_CYCLE[i % EMOJI_CYCLE.length],
          members: 0,
        }));
        setClasses(mapped);
        setAssigned([]);
        setUseRealData(true);
        // Show dashboard even if there's no Supabase session — the NextAuth
        // session from /join is enough to identify the student.
        setUser((prev) => prev ?? { name: j.user.name, email: j.user.email, avatar: 'butter' });
        setView((v) => (v === 'auth' ? 'dashboard' : v));
      } catch {
        /* ignore — student without a NextAuth session just sees normal flow */
      }
    })();
    return () => { cancelled = true; };
  }, [setUseRealData]);
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [playing, setPlaying] = useState<AnyGame | null>(null);
  const [openClassId, setOpenClassId] = useState<string | null>(null);

  const showToast = useCallback((msg: string, tone: ToastState['tone'] = 'butter') => {
    const next: ToastState = { msg, tone, id: Date.now() };
    setToast(next);
    window.setTimeout(() => {
      setToast((cur) => (cur && cur.id === next.id ? null : cur));
    }, 2800);
  }, []);

  // Bootstrap + subscribe to Supabase session.
  useEffect(() => {
    if (!supabase) {
      setSessionReady(true);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      cachedSession = data.session;
      if (cancelled) return;
      const u = sessionToUser(data.session);
      setUser(u);
      // Only redirect to auth on the very first resolution; on warm
      // remounts the user may already be on `join` mid-flow.
      setView((cur) => (cur === 'auth' && u ? 'dashboard' : cur));
      setSessionReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedSession = session;
      const u = sessionToUser(session);
      setUser(u);
      if (!u) {
        setView('auth');
        setPendingInvite(null);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
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

  const handleAuthed = (_u: StudentUser, classCode?: string) => {
    // Real Supabase auth has already fired onAuthStateChange — we just decide
    // where to land next based on any pending invite or a typed class code.
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
    showToast(`Welcome, ${_u.name.split(' ')[0]}!`, 'butter');
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

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    cachedSession = null;
    setUser(null);
    setView('auth');
    setPendingInvite(null);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{
          maxWidth: 520, padding: 24, borderRadius: 16,
          background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
          boxShadow: '0 4px 0 var(--pbs-line-2)',
        }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Supabase is not configured.</h1>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5, color: 'var(--pbs-ink-soft)' }}>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="pbs-mono" style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Loading…</div>
      </div>
    );
  }

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
          onPlay={(g) => {
            const href = (g as { href?: string }).href;
            if (href) { router.push(href); return; }
            setPlaying(g);
          }}
          onJoinClass={() => setView('join')}
          onOpenClass={(c) => { setOpenClassId(c.id); setView('class'); }}
          onLogout={handleLogout}
        />
      )}
      {view === 'class' && user && openClassId && (() => {
        const cls = classes.find((c) => c.id === openClassId);
        if (!cls) { setView('dashboard'); return null; }
        return (
          <ClassDetail
            cls={cls}
            user={user}
            assigned={assigned}
            onPlay={(g) => {
            const href = (g as { href?: string }).href;
            if (href) { router.push(href); return; }
            setPlaying(g);
          }}
            onBack={() => { setOpenClassId(null); setView('dashboard'); }}
          />
        );
      })()}

      {toast && <Toast toast={toast}/>}
      {playing && <PlayModal game={playing} onClose={() => setPlaying(null)}/>}
    </>
  );
};
