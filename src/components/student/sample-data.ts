// Sample data for the Problocks Student demo. Ported from the Claude
// Design bundle (problocks/project/pb_student/dashboard.jsx).

export type ToneTone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';

export type ClassRecord = {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  tone: ToneTone;
  emoji: string;
  members: number;
};

export type AssignedGame = {
  id: string;
  title: string;
  classId: string;
  subject: string;
  tone: ToneTone;
  icon: string;
  due: string;
  minutes: number;
  questions: number;
  kind: 'Live' | 'Homework';
  status: 'new' | 'inprogress';
  progress?: number;
};

export type RecentGame = {
  id: string;
  title: string;
  score?: number;
  rank?: string;
  plays?: string;
  tone: ToneTone;
  icon: string;
  subject?: string;
};

export type ExploreGame = {
  id: string;
  title: string;
  subject: string;
  plays: string;
  tone: ToneTone;
  icon: string;
  href?: string;
};

export type Invite = {
  code: string;
  className: string;
  teacher: string;
  game?: string;
  questions?: number;
  minutes?: number;
  auto?: boolean;
};

export type StudentUser = {
  name: string;
  email: string;
  avatar?: string;
};

export const SAMPLE_CLASSES: ClassRecord[] = [
  { id: 'c1', name: 'Ms. Rivera — Period 3', subject: 'Algebra 1', teacher: 'Ms. Rivera', tone: 'butter', emoji: '📐', members: 28 },
  { id: 'c2', name: 'Mr. Chen — AP Bio', subject: 'Biology', teacher: 'Mr. Chen', tone: 'mint', emoji: '🧬', members: 22 },
  { id: 'c3', name: 'Ms. Park — World History', subject: 'Social Studies', teacher: 'Ms. Park', tone: 'coral', emoji: '🌍', members: 31 },
];

export const SAMPLE_ASSIGNED: AssignedGame[] = [
  { id: 'g1', title: 'Linear Equations Relay', classId: 'c1', subject: 'Algebra 1', tone: 'butter', icon: 'bolt', due: 'Due today · 9:40 PM', minutes: 15, questions: 12, kind: 'Live', status: 'new' },
  { id: 'g2', title: 'Cell Organelle Showdown', classId: 'c2', subject: 'Biology', tone: 'mint', icon: 'spark', due: 'Due Fri', minutes: 12, questions: 10, kind: 'Homework', status: 'new' },
  { id: 'g3', title: 'Silk Road Scavenger', classId: 'c3', subject: 'World History', tone: 'coral', icon: 'compass', due: 'In progress · 4/10', minutes: 20, questions: 10, kind: 'Homework', status: 'inprogress', progress: 0.4 },
];

export const SAMPLE_RECENT: RecentGame[] = [
  { id: 'r1', title: 'Fractions Bakery', score: 94, rank: '2nd / 28', tone: 'pink', icon: 'music' },
  { id: 'r2', title: 'Ecosystem Tycoon', score: 81, rank: '5th / 22', tone: 'sky', icon: 'cube' },
  { id: 'r3', title: 'Word Roots Rumble', score: 100, rank: '1st / 31', tone: 'grape', icon: 'book' },
];

export const EXPLORE: ExploreGame[] = [
  { id: 'lego-game', title: 'Brick Builder', subject: 'Sandbox · Creative', plays: 'NEW', tone: 'sky', icon: 'cube', href: '/games/lego-game/index.html' },
  { id: 'e1', title: 'Fraction Kingdom', subject: 'Math · Grade 5', plays: '1.2M', tone: 'butter', icon: 'coin' },
  { id: 'e2', title: 'Periodic Table Tycoon', subject: 'Chemistry', plays: '640K', tone: 'mint', icon: 'cube' },
  { id: 'e3', title: 'Grammar Heist', subject: 'ELA', plays: '380K', tone: 'pink', icon: 'book' },
  { id: 'e4', title: 'Geo Sprint', subject: 'Geography', plays: '820K', tone: 'sky', icon: 'compass' },
];

export const TONE_CYCLE: ToneTone[] = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'];
export const EMOJI_CYCLE = ['🎯', '🧪', '📚', '🌎', '🎨', '🎵'];
