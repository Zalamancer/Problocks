// Shared shape of setup form data — passed through every step.
'use client';

export type ClassroomColor = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';
export type SubjectKey =
  | 'math' | 'ela' | 'science' | 'cs' | 'social'
  | 'art' | 'music' | 'lang' | 'pe' | 'stem' | 'sped'
  | 'other' | 'mixed';
export type GradeKey = 'k2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'hs' | 'mix';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type RosterMethod = 'paste' | 'google' | 'clever' | 'teams' | 'code' | 'later';
export type RegionKey = 'us' | 'uk' | 'ca' | 'au' | 'nz' | 'other';
export type StandardsKey = 'common-core' | 'ngss' | 'csta' | 'iste' | 'uk-nc' | 'none';
// Allowed palette for starter-unit cards. Kept in sync with the API
// /api/starter-units/draft prompt and the StepUnit renderer.
export type StarterUnitTone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';
export type StarterUnitIcon =
  | 'coin' | 'book' | 'spark' | 'cube' | 'star' | 'heart' | 'bolt' | 'compass'
  | 'music' | 'image' | 'mic' | 'gamepad' | 'code' | 'wand' | 'smile';

// A picked starter unit held in setup state. `source` tells us where it came
// from so we can attribute-back when the teacher hits "Open the classroom":
//   - 'blank'     → built-in "Blank canvas" option (nothing to persist)
//   - 'template'  → an existing row from the starter_units table (bump usage_count)
//   - 'draft'     → a freshly-AI-drafted unit (insert a new row)
export type StarterUnit = {
  id: string;
  source: 'blank' | 'template' | 'draft';
  title: string;
  weeks: string;
  blurb: string;
  bullets: string[];
  tone: StarterUnitTone;
  icon: StarterUnitIcon;
  prompt?: string;    // original teacher description, only set when source==='draft'
};

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

  // null until the teacher picks one in step 4.
  unit: StarterUnit | null;
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

  unit: null,
};
