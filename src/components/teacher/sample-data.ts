// Mock data for the Teacher dashboard. Ported from
// problocks/project/pb_teacher/data.jsx — only shape-preserving edits:
// typed the tones, typed the risk/trend unions, added `Tone` re-export,
// added `avatar` per student so the teacher view can render the same
// cardboard RobloxAvatar that the student profile uses.

import type { AvatarOutfit } from '@/components/student/RobloxAvatar';

export type TeacherTone =
  | 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';

export type Trend = 'up' | 'down' | 'flat';
export type Risk = 'none' | 'low' | 'medium' | 'high';

export type Mastery = { alg: number; geo: number; num: number; prob: number };

export type Student = {
  id: string;
  name: string;
  grade: string;
  avg: number;
  streak: number;
  trend: Trend;
  risk: Risk;
  lastActive: string;
  submitted: number;
  mastery: Mastery;
  emoji: string;
  tone: TeacherTone;
  // Cardboard-character outfit, used by `<StudentAvatar>` in the teacher
  // dashboard wherever the old `s.emoji` square was rendered as a profile
  // photo (StudentsList card, StudentDetail header, StudentSelf header).
  // The 16–24px chip usages elsewhere (charts, Overview rows, Assignments
  // submitter strip) keep the emoji because a Three.js avatar at 16px is
  // both wasted detail and a real WebGL-context cost.
  avatar: AvatarOutfit;
};

// Widened for the New Assignment composer: the design adds
//   • kinds: "Live relay", "Practice", "Quiz" (alongside the seeded "Live"/"Homework")
//   • topics: "Ratios", "Functions" (alongside the four mastery topics)
//   • draft: composer output can be saved as a draft (renders a Draft pill in the list)
// hardestQ is optional because composer output has no submissions yet.
export type AssignmentKind  = 'Live' | 'Homework' | 'Live relay' | 'Practice' | 'Quiz';
export type AssignmentTopic = 'Algebra' | 'Geometry' | 'Numbers' | 'Probability' | 'Ratios' | 'Functions';

export type Assignment = {
  id: string;
  title: string;
  kind: AssignmentKind;
  topic: AssignmentTopic;
  due: string;
  avg: number;
  submitted: number;
  total: number;
  questions: number;
  minutes: number;
  tone: TeacherTone;
  icon: string;
  hardestQ?: number;
  draft?: boolean;
};

export type ClassRecord = {
  id: string;
  name: string;
  members: number;
  avg: number;
  tone: TeacherTone;
  emoji: string;
  period: string;
};

export type Topic = {
  id: keyof Mastery;
  name: string;
  mastery: number;
  color: TeacherTone;
};

export type ActivityKind = 'played' | 'asked' | 'review' | 'struggle';
export type ActivityEvent = {
  date: string;
  kind: ActivityKind;
  title: string;
  topic: string;
  score?: number;
  rank?: string;
  minutes?: number;
};

export type TrickyQuestion = {
  id: string;
  aid: string;
  text: string;
  topic: string;
  correct: number;
  asked: number;
};

export type RecentQuestion = {
  sid: string;
  topic: string;
  q: string;
  at: string;
  resolved: boolean;
};

// 12 hand-tuned avatar outfits — distinct silhouettes (gender, hair, hat,
// shirt/pants colour) so a roster of squares reads as 12 different people
// without needing a real per-account wardrobe wired up yet.
const A: Record<string, AvatarOutfit> = {
  s1:  { gender: 'girl', hair: 'long',  hairColor: '#5a3a22', shirt: '#f7c25b', pants: '#5b3a82', face: 'happy' },
  s2:  { gender: 'boy',  hair: 'spike', hairColor: '#1a1a1a', shirt: '#e26a4d', pants: '#3a3c4a', face: 'cool'  },
  s3:  { gender: 'girl', hair: 'long',  hairColor: '#222222', shirt: '#5fb4e6', pants: '#2c4a6a', face: 'smile' },
  s4:  { gender: 'girl', hair: 'short', hairColor: '#2a1a10', shirt: '#6fbf73', pants: '#3a3c4a', face: 'happy' },
  s5:  { gender: 'boy',  hair: 'short', hairColor: '#7a5a3a', shirt: '#7a4ea8', pants: '#1f1f24', hat: 'beanie', hatColor: '#2a2a30', face: 'neutral' },
  s6:  { gender: 'girl', hair: 'long',  hairColor: '#1a1a1a', shirt: '#e88fb4', pants: '#3a3c4a', face: 'smile' },
  s7:  { gender: 'boy',  hair: 'short', hairColor: '#3a2a1a', shirt: '#c4a05a', pants: '#3a3c4a', hat: 'cap',    hatColor: '#5b8b4a', face: 'cool'  },
  s8:  { gender: 'girl', hair: 'long',  hairColor: '#0e0e10', shirt: '#e8657a', pants: '#1a1a20', face: 'wink'  },
  s9:  { gender: 'boy',  hair: 'short', hairColor: '#3a2a1a', shirt: '#5fa0d4', pants: '#2c4a6a', face: 'neutral' },
  s10: { gender: 'girl', hair: 'short', hairColor: '#3a1a08', shirt: '#6fbf73', pants: '#3a3c4a', face: 'smile' },
  s11: { gender: 'boy',  hair: 'short', hairColor: '#2a1a10', shirt: '#7a4ea8', pants: '#3a3c4a', face: 'happy' },
  s12: { gender: 'girl', hair: 'long',  hairColor: '#c8649a', shirt: '#e88fb4', pants: '#3a3c4a', face: 'wink'  },
};

export const STUDENTS: Student[] = [
  { id: 's1',  name: 'Ava Park',       grade: 'A-', avg: 91, streak: 14, trend: 'up',   risk: 'none',   lastActive: '2h ago',    submitted: 24, mastery: { alg: 0.92, geo: 0.78, num: 0.88, prob: 0.72 }, emoji: '🐰', tone: 'butter', avatar: A.s1  },
  { id: 's2',  name: 'Mateo Diaz',     grade: 'B',  avg: 82, streak: 8,  trend: 'up',   risk: 'none',   lastActive: 'Today',     submitted: 22, mastery: { alg: 0.81, geo: 0.66, num: 0.79, prob: 0.58 }, emoji: '🦊', tone: 'coral',  avatar: A.s2  },
  { id: 's3',  name: 'Lin Wu',         grade: 'A',  avg: 95, streak: 21, trend: 'flat', risk: 'none',   lastActive: '30m ago',   submitted: 25, mastery: { alg: 0.96, geo: 0.94, num: 0.92, prob: 0.90 }, emoji: '🦋', tone: 'sky',    avatar: A.s3  },
  { id: 's4',  name: 'Zoe Okafor',     grade: 'B+', avg: 87, streak: 5,  trend: 'up',   risk: 'none',   lastActive: 'Today',     submitted: 24, mastery: { alg: 0.85, geo: 0.88, num: 0.90, prob: 0.74 }, emoji: '🐝', tone: 'mint',   avatar: A.s4  },
  { id: 's5',  name: 'Noah Bishop',    grade: 'C',  avg: 72, streak: 2,  trend: 'down', risk: 'medium', lastActive: '2d ago',    submitted: 19, mastery: { alg: 0.58, geo: 0.62, num: 0.72, prob: 0.45 }, emoji: '🦝', tone: 'grape',  avatar: A.s5  },
  { id: 's6',  name: 'Priya Rao',      grade: 'A-', avg: 90, streak: 12, trend: 'up',   risk: 'none',   lastActive: '4h ago',    submitted: 24, mastery: { alg: 0.90, geo: 0.84, num: 0.91, prob: 0.86 }, emoji: '🦉', tone: 'pink',   avatar: A.s6  },
  { id: 's7',  name: 'Jamal Green',    grade: 'B-', avg: 78, streak: 3,  trend: 'flat', risk: 'low',    lastActive: 'Yesterday', submitted: 21, mastery: { alg: 0.72, geo: 0.75, num: 0.82, prob: 0.61 }, emoji: '🐢', tone: 'butter', avatar: A.s7  },
  { id: 's8',  name: 'Hana Suzuki',    grade: 'A',  avg: 94, streak: 17, trend: 'up',   risk: 'none',   lastActive: '1h ago',    submitted: 25, mastery: { alg: 0.94, geo: 0.92, num: 0.90, prob: 0.88 }, emoji: '🐱', tone: 'coral',  avatar: A.s8  },
  { id: 's9',  name: 'Ethan Coleman',  grade: 'D+', avg: 64, streak: 0,  trend: 'down', risk: 'high',   lastActive: '5d ago',    submitted: 14, mastery: { alg: 0.42, geo: 0.48, num: 0.58, prob: 0.35 }, emoji: '🐙', tone: 'sky',    avatar: A.s9  },
  { id: 's10', name: 'Sofia Reyes',    grade: 'B+', avg: 88, streak: 10, trend: 'up',   risk: 'none',   lastActive: 'Today',     submitted: 23, mastery: { alg: 0.88, geo: 0.82, num: 0.84, prob: 0.78 }, emoji: '🐸', tone: 'mint',   avatar: A.s10 },
  { id: 's11', name: 'Isaac Patel',    grade: 'B',  avg: 83, streak: 7,  trend: 'flat', risk: 'none',   lastActive: '3h ago',    submitted: 22, mastery: { alg: 0.82, geo: 0.76, num: 0.85, prob: 0.68 }, emoji: '🐵', tone: 'grape',  avatar: A.s11 },
  { id: 's12', name: 'Maya Bello',     grade: 'C+', avg: 76, streak: 4,  trend: 'down', risk: 'low',    lastActive: 'Yesterday', submitted: 20, mastery: { alg: 0.70, geo: 0.68, num: 0.78, prob: 0.55 }, emoji: '🦄', tone: 'pink',   avatar: A.s12 },
];

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Linear Equations Relay', kind: 'Live',     topic: 'Algebra',     due: 'Today · 9:40 PM', avg: 84, submitted: 26, total: 28, questions: 12, minutes: 15, tone: 'butter', icon: 'bolt',  hardestQ: 8 },
  { id: 'a2', title: 'Slope Bakery Bonanza',   kind: 'Homework', topic: 'Algebra',     due: 'Yesterday',       avg: 79, submitted: 27, total: 28, questions: 10, minutes: 12, tone: 'coral',  icon: 'music', hardestQ: 5 },
  { id: 'a3', title: 'Shapes & Area Sprint',   kind: 'Homework', topic: 'Geometry',    due: 'Apr 14',          avg: 88, submitted: 28, total: 28, questions: 12, minutes: 15, tone: 'mint',   icon: 'cube',  hardestQ: 9 },
  { id: 'a4', title: 'Number Line Lightning',  kind: 'Live',     topic: 'Numbers',     due: 'Apr 10',          avg: 92, submitted: 28, total: 28, questions: 8,  minutes: 10, tone: 'sky',    icon: 'bolt',  hardestQ: 4 },
  { id: 'a5', title: 'Probability Carnival',   kind: 'Homework', topic: 'Probability', due: 'Apr 7',           avg: 71, submitted: 25, total: 28, questions: 10, minutes: 15, tone: 'grape',  icon: 'spark', hardestQ: 7 },
  { id: 'a6', title: 'Fraction Kingdom',       kind: 'Homework', topic: 'Numbers',     due: 'Apr 3',           avg: 86, submitted: 28, total: 28, questions: 10, minutes: 12, tone: 'pink',   icon: 'coin',  hardestQ: 6 },
];

export const CLASSES: ClassRecord[] = [
  { id: 'c1', name: 'Algebra 1 · Period 3',   members: 28, avg: 84, tone: 'butter', emoji: '📐', period: 'M/W/F · 11:20' },
  { id: 'c2', name: 'Algebra 1 · Period 5',   members: 26, avg: 78, tone: 'coral',  emoji: '🧮', period: 'M/W/F · 1:40' },
  { id: 'c3', name: 'Pre-Algebra · Period 2', members: 24, avg: 81, tone: 'mint',   emoji: '➕', period: 'T/Th · 9:30' },
];

export const ENGAGEMENT_14D: { d: string; v: number }[] = [
  { d: 'Mon', v: 0.58 }, { d: 'Tue', v: 0.72 }, { d: 'Wed', v: 0.81 }, { d: 'Thu', v: 0.68 },
  { d: 'Fri', v: 0.44 }, { d: 'Sat', v: 0.18 }, { d: 'Sun', v: 0.22 },
  { d: 'Mon', v: 0.76 }, { d: 'Tue', v: 0.88 }, { d: 'Wed', v: 0.92 }, { d: 'Thu', v: 0.84 },
  { d: 'Fri', v: 0.71 }, { d: 'Sat', v: 0.28 }, { d: 'Sun', v: 0.36 },
];

export const TOPICS: Topic[] = [
  { id: 'alg',  name: 'Algebra',     mastery: 0.86, color: 'butter' },
  { id: 'geo',  name: 'Geometry',    mastery: 0.78, color: 'mint'   },
  { id: 'num',  name: 'Numbers',     mastery: 0.83, color: 'sky'    },
  { id: 'prob', name: 'Probability', mastery: 0.65, color: 'grape'  },
];

export const TRICKY_QUESTIONS: TrickyQuestion[] = [
  { id: 'q1', aid: 'a1', text: 'Solve: 3(x – 4) + 2x = 5x – 10',         topic: 'Algebra',     correct: 0.32, asked: 14 },
  { id: 'q2', aid: 'a5', text: 'P(two aces in a row, without replace)',   topic: 'Probability', correct: 0.41, asked: 11 },
  { id: 'q3', aid: 'a2', text: 'Find slope through (-2, 5) and (3, -1)',  topic: 'Algebra',     correct: 0.48, asked: 9  },
  { id: 'q4', aid: 'a3', text: 'Area of a rhombus with diagonals 6 & 10', topic: 'Geometry',    correct: 0.55, asked: 7  },
];

export const RECENT_QUESTIONS: RecentQuestion[] = [
  { sid: 's5',  topic: 'Algebra',     q: 'why does subtracting the x first work?',  at: '12m', resolved: true  },
  { sid: 's9',  topic: 'Numbers',     q: 'is 0.9 repeating the same as 1?',          at: '34m', resolved: false },
  { sid: 's2',  topic: 'Probability', q: "why don't we add the two probabilities?",  at: '1h',  resolved: true  },
  { sid: 's12', topic: 'Geometry',    q: 'do we always need to divide by 2?',        at: '2h',  resolved: true  },
  { sid: 's7',  topic: 'Algebra',     q: 'what if both sides have an x term?',       at: '3h',  resolved: true  },
  { sid: 's5',  topic: 'Algebra',     q: 'i keep getting negative, is that ok?',     at: '4h',  resolved: false },
];

const STUDENT_ACTIVITY: Record<string, ActivityEvent[]> = {
  s1: [
    { date: 'Apr 18', kind: 'played',  title: 'Linear Equations Relay', score: 92,  topic: 'Algebra',    rank: '2nd / 28' },
    { date: 'Apr 17', kind: 'asked',   title: 'how do I simplify both sides?',                              topic: 'Algebra' },
    { date: 'Apr 15', kind: 'played',  title: 'Shapes & Area Sprint',   score: 88,  topic: 'Geometry',   rank: '5th / 28' },
    { date: 'Apr 14', kind: 'review',  title: 'Slope intuition',        minutes: 6, topic: 'Algebra' },
    { date: 'Apr 12', kind: 'played',  title: 'Number Line Lightning',  score: 100, topic: 'Numbers',    rank: '1st / 28' },
    { date: 'Apr 10', kind: 'played',  title: 'Probability Carnival',   score: 76,  topic: 'Probability',rank: '9th / 28' },
    { date: 'Apr 9',  kind: 'asked',   title: "why doesn't adding 1/6 + 1/6 give 2/6?",                   topic: 'Probability' },
    { date: 'Apr 7',  kind: 'review',  title: 'Fraction intuition',     minutes: 9, topic: 'Numbers' },
    { date: 'Apr 5',  kind: 'played',  title: 'Fraction Kingdom',       score: 94,  topic: 'Numbers',    rank: '3rd / 28' },
  ],
  s5: [
    { date: 'Apr 18', kind: 'played',   title: 'Linear Equations Relay', score: 58, topic: 'Algebra',    rank: '24th / 28' },
    { date: 'Apr 18', kind: 'asked',    title: 'why does subtracting the x first work?',                   topic: 'Algebra' },
    { date: 'Apr 17', kind: 'struggle', title: 'stuck on Q8 (3 retries)',                                  topic: 'Algebra' },
    { date: 'Apr 15', kind: 'played',   title: 'Shapes & Area Sprint',   score: 72, topic: 'Geometry',   rank: '20th / 28' },
    { date: 'Apr 14', kind: 'review',   title: 'Slope intuition',        minutes: 3, topic: 'Algebra' },
    { date: 'Apr 12', kind: 'played',   title: 'Number Line Lightning',  score: 84, topic: 'Numbers',    rank: '12th / 28' },
    { date: 'Apr 10', kind: 'struggle', title: 'skipped Probability Carnival',                             topic: 'Probability' },
  ],
  s9: [
    { date: 'Apr 17', kind: 'asked',    title: 'is 0.9 repeating the same as 1?', topic: 'Numbers' },
    { date: 'Apr 15', kind: 'played',   title: 'Shapes & Area Sprint',   score: 55, topic: 'Geometry', rank: '26th / 28' },
    { date: 'Apr 12', kind: 'played',   title: 'Number Line Lightning',  score: 62, topic: 'Numbers',  rank: '23rd / 28' },
    { date: 'Apr 10', kind: 'struggle', title: "didn't finish Carnival (timeout)", topic: 'Probability' },
    { date: 'Apr 5',  kind: 'played',   title: 'Fraction Kingdom',       score: 64, topic: 'Numbers',  rank: '22nd / 28' },
  ],
};

const defaultActivity = (s: Student): ActivityEvent[] => ([
  { date: 'Apr 18', kind: 'played', title: 'Linear Equations Relay', score: s.avg,                      topic: 'Algebra',     rank: `${Math.round((1 - s.avg / 100) * 28 + 1)} / 28` },
  { date: 'Apr 15', kind: 'played', title: 'Shapes & Area Sprint',   score: s.avg - 3,                  topic: 'Geometry',    rank: `${Math.round((1 - (s.avg - 3) / 100) * 28 + 1)} / 28` },
  { date: 'Apr 12', kind: 'played', title: 'Number Line Lightning',  score: Math.min(100, s.avg + 5),   topic: 'Numbers',     rank: `${Math.round((1 - (s.avg + 5) / 100) * 28 + 1)} / 28` },
  { date: 'Apr 10', kind: 'played', title: 'Probability Carnival',   score: Math.max(40, s.avg - 9),    topic: 'Probability', rank: `${Math.round((1 - (s.avg - 9) / 100) * 28 + 1)} / 28` },
]);

export const activityFor = (s: Student): ActivityEvent[] =>
  STUDENT_ACTIVITY[s.id] || defaultActivity(s);

// Deterministic pseudo-trend so charts don't re-randomize per render.
export const scoreTrendFor = (s: Student): number[] => {
  const base = s.avg;
  const offsets = [-12, -8, -3, 2, -5, 3, -2, 0];
  const seed = s.id.charCodeAt(1);
  return offsets.map((o, i) => {
    const wobble = ((seed * (i + 3)) % 7) - 3;
    return Math.max(30, Math.min(100, base + o + wobble));
  });
};
