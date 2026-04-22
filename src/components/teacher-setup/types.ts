// Shared shape of setup form data — passed through every step.
'use client';

export type ClassroomColor = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';
export type SubjectKey =
  | 'math' | 'ela' | 'science' | 'cs' | 'social'
  | 'art' | 'music' | 'lang' | 'pe' | 'stem' | 'sped'
  | 'other' | 'mixed';
export type GradeKey = 'k2' | '3' | '4' | '5' | '6' | '7' | '8' | 'hs' | 'mix';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type RosterMethod = 'paste' | 'google' | 'clever' | 'teams' | 'code' | 'later';
export type RegionKey = 'us' | 'uk' | 'ca' | 'au' | 'nz' | 'other';
export type StandardsKey = 'common-core' | 'ngss' | 'csta' | 'iste' | 'uk-nc' | 'none';
export type UnitKey = 'frac' | 'story' | 'eco' | 'scratch';

export type SetupData = {
  teacherName: string;
  teacherHandle: string;
  school: string;
  region: RegionKey;
  standards: StandardsKey;
  subjects: Exclude<SubjectKey, 'mixed'>[];

  className: string;
  classSubject: SubjectKey;
  grade: GradeKey;
  color: ClassroomColor;
  days: DayKey[];
  startTime: string;
  endTime: string;

  rosterMethod: RosterMethod;
  pastedNames: string;
  joinCode: string;
  // When the teacher picks a Google Classroom course we store the course id
  // (same value as Classroom's `id` / API userId namespace) so downstream
  // grade/assignment sync can key off it.
  classroomCourseId?: string;
  classroomCourseName?: string;

  unit: UnitKey;
};

// Generate a fresh join code per session so two teachers don't collide on
// the same demo code. Format matches the old static "PB-7K4" style.
function randomJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  let out = 'PB-';
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// Blank-slate defaults — every teacher starts with empty identity + class
// fields so nothing feels pre-filled by the example bundle ("Lia Nguyen",
// "Period 4 · Fraction Friends", etc.). Enum-backed fields still need a
// valid value so the preview/pickers render, so we keep a minimal
// structural default (region: us, color: butter, M/W/F schedule).
export const INITIAL_DATA: SetupData = {
  teacherName: '',
  teacherHandle: '',
  school: '',
  region: 'us',
  standards: 'none',
  subjects: [],

  className: '',
  classSubject: 'math',
  grade: '5',
  color: 'butter',
  days: ['mon', 'wed', 'fri'],
  startTime: '10:15 AM',
  endTime: '11:05 AM',

  rosterMethod: 'paste',
  pastedNames: '',
  joinCode: randomJoinCode(),

  unit: 'frac',
};
