import type { CurriculumSubject } from './curriculum-types';
import { MATH_GRADES } from './curriculum-math';
import { SCIENCE_GRADES } from './curriculum-science';
import { ENGLISH_GRADES } from './curriculum-english';

export type { CurriculumUnit, CurriculumGrade, SubjectTone, CurriculumSubject } from './curriculum-types';

export const CURRICULUM: CurriculumSubject[] = [
  {
    id: 'math',
    subject: 'Math',
    tone: 'butter',
    tagline: 'Counting to Calculus — every grade, every standard.',
    source: 'Khan Academy',
    grades: MATH_GRADES,
  },
  {
    id: 'science',
    subject: 'Science',
    tone: 'mint',
    tagline: 'From pushes and pulls to black holes and AP capstones.',
    source: 'Khan Academy & NGSS',
    grades: SCIENCE_GRADES,
  },
  {
    id: 'english',
    subject: 'English',
    tone: 'pink',
    tagline: 'Reading, writing, and vocabulary from Grade 1 through college-ready.',
    source: 'Khan Academy & Common Core',
    grades: ENGLISH_GRADES,
  },
];

export const TOTAL_UNIT_COUNT: number = CURRICULUM.reduce(
  (sum, subject) => sum + subject.grades.reduce((gradeSum, grade) => gradeSum + grade.units.length, 0),
  0,
);
