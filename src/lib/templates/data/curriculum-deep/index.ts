import type { DeepGrade } from './types';

import { GRADE_DATA as MATH_K }                      from './math/grade-k';
import { GRADE_DATA as MATH_1 }                      from './math/grade-1';
import { GRADE_DATA as MATH_2 }                      from './math/grade-2';
import { GRADE_DATA as MATH_3 }                      from './math/grade-3';
import { GRADE_DATA as MATH_4 }                      from './math/grade-4';
import { GRADE_DATA as MATH_5 }                      from './math/grade-5';
import { GRADE_DATA as MATH_6 }                      from './math/grade-6';
import { GRADE_DATA as MATH_7 }                      from './math/grade-7';
import { GRADE_DATA as MATH_8 }                      from './math/grade-8';
import { GRADE_DATA as MATH_ALG1 }                   from './math/algebra-1';
import { GRADE_DATA as MATH_GEO }                    from './math/geometry';
import { GRADE_DATA as MATH_ALG2 }                   from './math/algebra-2';
import { GRADE_DATA as MATH_PRECALC }                from './math/precalculus';
import { GRADE_DATA as MATH_AP_CALC }                from './math/ap-calculus-ab';

import { GRADE_DATA as SCI_K2 }                      from './science/k-2';
import { GRADE_DATA as SCI_35 }                      from './science/3-5';
import { GRADE_DATA as SCI_68 }                      from './science/6-8';
import { GRADE_DATA as SCI_BIO }                     from './science/biology';
import { GRADE_DATA as SCI_CHEM }                    from './science/chemistry';
import { GRADE_DATA as SCI_PHYS }                    from './science/physics';
import { GRADE_DATA as SCI_EARTH }                   from './science/earth-space';

import { GRADE_DATA as ENG_1 }                       from './english/grade-1';
import { GRADE_DATA as ENG_2 }                       from './english/grade-2';
import { GRADE_DATA as ENG_3 }                       from './english/grade-3';
import { GRADE_DATA as ENG_4 }                       from './english/grade-4';
import { GRADE_DATA as ENG_5 }                       from './english/grade-5';
import { GRADE_DATA as ENG_6 }                       from './english/grade-6';
import { GRADE_DATA as ENG_7 }                       from './english/grade-7';
import { GRADE_DATA as ENG_8 }                       from './english/grade-8';
import { GRADE_DATA as ENG_9 }                       from './english/grade-9';
import { GRADE_DATA as ENG_10 }                      from './english/grade-10';
import { GRADE_DATA as ENG_11 }                      from './english/grade-11';
import { GRADE_DATA as ENG_12 }                      from './english/grade-12';

import { OPENSTAX_BANK } from './openstax-bank';
import { KHAN_QUESTIONS } from './khan-questions';
import type { PracticeQuestion } from './types';

export type { DeepGrade, DeepUnit, DeepLesson, PracticeQuestion, KhanItem } from './types';

export function getOpenStaxBank(subjectId: string, gradeKey: string): PracticeQuestion[] {
  return OPENSTAX_BANK[`${subjectId}-${gradeKey}`] ?? [];
}

export function getKhanQuestionsByHref(href: string): PracticeQuestion[] {
  return KHAN_QUESTIONS[href] ?? [];
}

export const DEEP_MATH: DeepGrade[] = [
  MATH_K, MATH_1, MATH_2, MATH_3, MATH_4, MATH_5, MATH_6, MATH_7, MATH_8,
  MATH_ALG1, MATH_GEO, MATH_ALG2, MATH_PRECALC, MATH_AP_CALC,
];

export const DEEP_SCIENCE: DeepGrade[] = [
  SCI_K2, SCI_35, SCI_68, SCI_BIO, SCI_CHEM, SCI_PHYS, SCI_EARTH,
];

export const DEEP_ENGLISH: DeepGrade[] = [
  ENG_1, ENG_2, ENG_3, ENG_4, ENG_5, ENG_6, ENG_7, ENG_8, ENG_9, ENG_10, ENG_11, ENG_12,
];

export function findDeepGrade(subjectId: string, gradeKey: string): DeepGrade | undefined {
  const list = subjectId === 'math' ? DEEP_MATH : subjectId === 'science' ? DEEP_SCIENCE : DEEP_ENGLISH;
  return list.find((g) => g.grade === gradeKey);
}

export function countDeep(
  list: DeepGrade[],
  subjectId?: 'math' | 'science' | 'english',
): { units: number; lessons: number; items: number; questions: number; openstax: number } {
  let units = 0, lessons = 0, items = 0, questions = 0, openstax = 0;
  for (const grade of list) {
    for (const unit of grade.units) {
      units++;
      for (const lesson of unit.lessons) {
        lessons++;
        const lessonItems = lesson.items ?? [];
        items += lessonItems.length;
        for (const item of lessonItems) {
          if (item.question) questions++;
        }
        questions += lesson.questions?.length ?? 0;
      }
    }
    if (subjectId) openstax += getOpenStaxBank(subjectId, grade.grade).length;
  }
  return { units, lessons, items, questions, openstax };
}
