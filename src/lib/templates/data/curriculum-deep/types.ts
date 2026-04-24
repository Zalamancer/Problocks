export type PracticeQuestion = {
  prompt: string;
  answer: string;
  explanation?: string;
};

export type DeepLesson = {
  name: string;
  description: string;
  questions: PracticeQuestion[];
};

export type DeepUnit = {
  name: string;
  description: string;
  lessons: DeepLesson[];
};

export type DeepGrade = {
  grade: string;
  label: string;
  sourceUrl: string;
  units: DeepUnit[];
};
