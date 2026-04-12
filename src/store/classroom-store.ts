import { create } from 'zustand';
import type {
  ClassroomCourse,
  ClassroomAnnouncement,
  ClassroomCourseWork,
  ClassroomTopic,
  ClassroomStudent,
  ClassroomTeacher,
} from '@/lib/classroom-api';

export type ClassroomTab = 'stream' | 'classwork' | 'people';

interface CourseData {
  announcements: ClassroomAnnouncement[];
  coursework: ClassroomCourseWork[];
  topics: ClassroomTopic[];
  teachers: ClassroomTeacher[];
  students: ClassroomStudent[];
  loadedAt: number;
}

interface ClassroomStore {
  courses: ClassroomCourse[];
  coursesLoading: boolean;
  coursesError: string | null;

  selectedCourseId: string | null;
  activeTab: ClassroomTab;

  courseData: Record<string, CourseData>;
  courseDataLoading: Record<string, boolean>;

  setCourses: (courses: ClassroomCourse[]) => void;
  setCoursesLoading: (loading: boolean) => void;
  setCoursesError: (error: string | null) => void;
  selectCourse: (courseId: string | null) => void;
  setActiveTab: (tab: ClassroomTab) => void;
  setCourseData: (courseId: string, data: Partial<CourseData>) => void;
  setCourseDataLoading: (courseId: string, loading: boolean) => void;
  getCourseData: (courseId: string) => CourseData | null;
}

const emptyCourseData = (): CourseData => ({
  announcements: [],
  coursework: [],
  topics: [],
  teachers: [],
  students: [],
  loadedAt: 0,
});

export const useClassroomStore = create<ClassroomStore>((set, get) => ({
  courses: [],
  coursesLoading: false,
  coursesError: null,
  selectedCourseId: null,
  activeTab: 'stream',
  courseData: {},
  courseDataLoading: {},

  setCourses: (courses) => set({ courses }),
  setCoursesLoading: (loading) => set({ coursesLoading: loading }),
  setCoursesError: (error) => set({ coursesError: error }),

  selectCourse: (courseId) => set({ selectedCourseId: courseId, activeTab: 'stream' }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setCourseData: (courseId, data) =>
    set((state) => ({
      courseData: {
        ...state.courseData,
        [courseId]: {
          ...(state.courseData[courseId] ?? emptyCourseData()),
          ...data,
          loadedAt: Date.now(),
        },
      },
    })),

  setCourseDataLoading: (courseId, loading) =>
    set((state) => ({
      courseDataLoading: { ...state.courseDataLoading, [courseId]: loading },
    })),

  getCourseData: (courseId) => get().courseData[courseId] ?? null,
}));
