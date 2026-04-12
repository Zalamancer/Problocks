// Google Classroom API types and client helpers

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: 'PROVISIONED' | 'ACTIVE' | 'ARCHIVED' | 'DECLINED' | 'SUSPENDED';
  alternateLink: string;
  calendarId?: string;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  materials?: ClassroomMaterial[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  scheduledTime?: string;
  creatorUserId: string;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: ClassroomMaterial[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  maxPoints?: number;
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  creatorUserId: string;
  topicId?: string;
  scheduledTime?: string;
}

export interface ClassroomCourseMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: ClassroomMaterial[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  topicId?: string;
}

export interface ClassroomMaterial {
  driveFile?: { driveFile: { id: string; title: string; alternateLink: string; thumbnailUrl?: string }; shareMode: string };
  youtubeVideo?: { id: string; title: string; alternateLink: string; thumbnailUrl?: string };
  link?: { url: string; title?: string; thumbnailUrl?: string };
  form?: { formUrl: string; title: string; alternateLink: string; thumbnailUrl?: string };
}

export interface ClassroomTopic {
  courseId: string;
  topicId: string;
  name: string;
  updateTime: string;
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile: ClassroomUserProfile;
  studentWorkFolder?: { id: string; title: string; alternateLink: string };
}

export interface ClassroomTeacher {
  courseId: string;
  userId: string;
  profile: ClassroomUserProfile;
}

export interface ClassroomUserProfile {
  id: string;
  name: { givenName: string; familyName: string; fullName: string };
  emailAddress?: string;
  photoUrl?: string;
  permissions?: Array<{ permission: string }>;
}

export interface ClassroomStudentSubmission {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late?: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  courseWorkType: string;
  associatedWithDeveloper?: boolean;
}

export interface ClassroomInvitation {
  id: string;
  userId: string;
  courseId: string;
  role: 'STUDENT' | 'TEACHER' | 'CO_TEACHER';
}

// Fetch helper — calls our own API proxy routes
export async function classroomFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`/api/classroom${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Classroom API error: ${res.status}`);
  }
  return res.json();
}

export interface ListCoursesResponse { courses: ClassroomCourse[]; nextPageToken?: string }
export interface ListAnnouncementsResponse { announcements: ClassroomAnnouncement[]; nextPageToken?: string }
export interface ListCourseWorkResponse { courseWork: ClassroomCourseWork[]; nextPageToken?: string }
export interface ListTopicsResponse { topic: ClassroomTopic[]; nextPageToken?: string }
export interface ListStudentsResponse { students: ClassroomStudent[]; nextPageToken?: string }
export interface ListTeachersResponse { teachers: ClassroomTeacher[]; nextPageToken?: string }
export interface ListCourseMaterialsResponse { courseWorkMaterial: ClassroomCourseMaterial[]; nextPageToken?: string }
