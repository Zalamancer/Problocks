export type PracticeQuestion = {
  prompt: string;
  answer: string;
  explanation?: string;
};

export type KhanItemType = 'exercise' | 'video' | 'article';

export type KhanItem = {
  label: string;
  type: KhanItemType;
  href: string;
  question?: PracticeQuestion;
};

export type DeepLesson = {
  name: string;
  description?: string;
  items?: KhanItem[];
  questions?: PracticeQuestion[];
};

export type DeepUnit = {
  name: string;
  description?: string;
  lessons: DeepLesson[];
};

export type DeepGrade = {
  grade: string;
  label: string;
  sourceUrl: string;
  units: DeepUnit[];
};
