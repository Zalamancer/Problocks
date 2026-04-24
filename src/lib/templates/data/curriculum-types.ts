export type CurriculumUnit = {
  name: string;
  description: string;
};

export type CurriculumGrade = {
  grade: string;
  label: string;
  sourceUrl: string;
  units: CurriculumUnit[];
};

export type SubjectTone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';

export type CurriculumSubject = {
  id: string;
  subject: string;
  tone: SubjectTone;
  tagline: string;
  source: string;
  grades: CurriculumGrade[];
};
