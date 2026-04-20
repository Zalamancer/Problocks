// Shared shape of setup form data — passed through every step.
'use client';

export type ClassroomColor = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';
export type SubjectKey = 'math' | 'ela' | 'science' | 'cs' | 'social' | 'art' | 'mixed';
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

  unit: UnitKey;
};

export const INITIAL_DATA: SetupData = {
  teacherName: 'Lia Nguyen',
  teacherHandle: 'MsN',
  school: 'Maple Ridge Middle School',
  region: 'us',
  standards: 'common-core',
  subjects: ['math', 'cs'],

  className: 'Period 4 · Fraction Friends',
  classSubject: 'math',
  grade: '5',
  color: 'butter',
  days: ['mon', 'wed', 'fri'],
  startTime: '10:15 AM',
  endTime: '11:05 AM',

  rosterMethod: 'paste',
  pastedNames: 'Ava Patel\nKai Tanaka\nMira Lopez\nDev Shah\nJuno Reyes\nTheo Marconi\nNoor Khan\nEmi Watanabe\nSam Brooks\nZoe Abara',
  joinCode: 'PB-7K4',

  unit: 'frac',
};
