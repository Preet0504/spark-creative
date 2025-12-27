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
  schoolId: string;
  description: string;
  prerequisites: string[];
  semester: 'fall' | 'spring' | 'summer';
  maxStudents: number;
}

export interface CourseSection {
  id: string;
  courseId: string;
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
  studentId: string;
  sectionId: string;
  courseId: string;
  status: 'enrolled' | 'pending' | 'dropped';
  grade?: string;
  enrolledAt: string;
}
