export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
}

export interface School {
  id: string;
  name: string;
  dean: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  school_id: string | null;
  description: string | null;
  prerequisites: string[] | null;
  semester: 'fall' | 'spring' | 'summer';
  max_students: number;
}

export interface CourseSection {
  id: string;
  course_id: string;
  section: string;
  instructor: string;
  schedule: {
    days: string[];
    time: string;
    room: string;
  };
  enrolled: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  course_id: string;
  status: 'enrolled' | 'pending' | 'dropped';
  grade?: string | null;
  enrolled_at: string;
}
