import { School, Course, CourseSection, Enrollment, User } from '@/types';

export const schools: School[] = [
  { id: "1", name: "School of Engineering", dean: "Dr. Sarah Johnson" },
  { id: "2", name: "School of Business", dean: "Dr. Michael Chen" },
  { id: "3", name: "School of Arts & Sciences", dean: "Dr. Emma Davis" },
  { id: "4", name: "School of Medicine", dean: "Dr. James Wilson" }
];

export const courses: Course[] = [
  { id: "1", code: "CS101", title: "Introduction to Computer Science", credits: 3, schoolId: "1", description: "Fundamental concepts of programming and computer science", prerequisites: [], semester: "fall", maxStudents: 30 },
  { id: "2", code: "CS201", title: "Data Structures", credits: 4, schoolId: "1", description: "Advanced data structures and algorithms", prerequisites: ["1"], semester: "spring", maxStudents: 25 },
  { id: "3", code: "MATH101", title: "Calculus I", credits: 4, schoolId: "3", description: "Differential calculus and applications", prerequisites: [], semester: "fall", maxStudents: 40 },
  { id: "4", code: "BUS101", title: "Introduction to Business", credits: 3, schoolId: "2", description: "Fundamentals of business operations", prerequisites: [], semester: "fall", maxStudents: 35 },
  { id: "5", code: "ENG101", title: "English Composition", credits: 3, schoolId: "3", description: "Academic writing and communication", prerequisites: [], semester: "fall", maxStudents: 20 },
  { id: "6", code: "PHYS101", title: "General Physics I", credits: 4, schoolId: "3", description: "Mechanics and thermodynamics", prerequisites: ["3"], semester: "spring", maxStudents: 30 },
  { id: "7", code: "CS301", title: "Database Systems", credits: 3, schoolId: "1", description: "Database design and management", prerequisites: ["2"], semester: "fall", maxStudents: 20 },
  { id: "8", code: "BUS201", title: "Marketing Principles", credits: 3, schoolId: "2", description: "Marketing fundamentals and strategies", prerequisites: ["4"], semester: "spring", maxStudents: 30 }
];

export const courseSections: CourseSection[] = [
  { id: "1", courseId: "1", section: "A", instructor: "Prof. Smith", schedule: { days: ["Mon", "Wed", "Fri"], time: "09:00-10:00", room: "CS101" }, enrolled: 25 },
  { id: "2", courseId: "1", section: "B", instructor: "Prof. Johnson", schedule: { days: ["Tue", "Thu"], time: "10:00-11:30", room: "CS102" }, enrolled: 28 },
  { id: "3", courseId: "2", section: "A", instructor: "Prof. Williams", schedule: { days: ["Mon", "Wed", "Fri"], time: "11:00-12:00", room: "CS201" }, enrolled: 20 },
  { id: "4", courseId: "3", section: "A", instructor: "Prof. Brown", schedule: { days: ["Mon", "Wed", "Fri"], time: "09:00-10:00", room: "MATH101" }, enrolled: 35 },
  { id: "5", courseId: "4", section: "A", instructor: "Prof. Davis", schedule: { days: ["Tue", "Thu"], time: "14:00-15:30", room: "BUS101" }, enrolled: 30 },
  { id: "6", courseId: "5", section: "A", instructor: "Prof. Miller", schedule: { days: ["Mon", "Wed"], time: "13:00-14:30", room: "ENG101" }, enrolled: 18 },
  { id: "7", courseId: "6", section: "A", instructor: "Prof. Wilson", schedule: { days: ["Tue", "Thu"], time: "09:00-10:30", room: "PHYS101" }, enrolled: 25 },
  { id: "8", courseId: "7", section: "A", instructor: "Prof. Taylor", schedule: { days: ["Mon", "Wed", "Fri"], time: "14:00-15:00", room: "CS301" }, enrolled: 15 }
];

export const sampleUsers: User[] = [
  { id: "1", username: "john_student", email: "john@university.edu", firstName: "John", lastName: "Doe", role: "student" },
  { id: "2", username: "jane_teacher", email: "jane@university.edu", firstName: "Jane", lastName: "Smith", role: "teacher" },
  { id: "3", username: "admin_user", email: "admin@university.edu", firstName: "Admin", lastName: "User", role: "admin" }
];

export const sampleEnrollments: Enrollment[] = [
  { id: "1", studentId: "1", sectionId: "1", courseId: "1", status: "enrolled", enrolledAt: "2024-01-15" },
  { id: "2", studentId: "1", sectionId: "4", courseId: "3", status: "enrolled", enrolledAt: "2024-01-15" },
  { id: "3", studentId: "1", sectionId: "5", courseId: "4", status: "enrolled", enrolledAt: "2024-01-16" }
];

export const getSchoolById = (id: string) => schools.find(s => s.id === id);
export const getCourseById = (id: string) => courses.find(c => c.id === id);
export const getSectionsByCourseId = (courseId: string) => courseSections.filter(s => s.courseId === courseId);
