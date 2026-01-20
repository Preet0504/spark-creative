# 🎓 UniCourse - Student Course Management System

<div align="center">

![UniCourse Banner](https://img.shields.io/badge/UniCourse-Student%20Management%20System-21808D?style=for-the-badge&logo=graduation-cap&logoColor=white)

A comprehensive, full-stack university course management system with role-based access control, real-time data management, and a modern, responsive UI.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

[Live Demo](#demo) • [Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Screenshots](#screenshots)

</div>

---

## 📋 Overview

UniCourse is a production-ready student course management system that demonstrates advanced full-stack development skills. Built with modern technologies and best practices, it provides separate interfaces and functionalities for **Students**, **Teachers**, and **Administrators**.

### Key Highlights

- 🔐 **Role-Based Access Control (RBAC)** with secure RLS policies
- 📱 **Responsive Design** optimized for all devices
- 🎨 **Custom Design System** with teal & cream color palette
- ⚡ **Real-time Updates** using React Query
- 🔒 **Row-Level Security** protecting all database operations
- 📊 **Analytics Dashboard** for administrators
- 📁 **File Upload System** for assignment submissions

---

## 🎯 Demo

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | *(Sign up with any email)* | *(Any password)* |
| **Teacher** | teacher@test.com | Teacher123! |
| **Admin** | admin@test.com | Admin123! |

> **Note**: After signing up, default role is `student`. Teacher and Admin accounts need to be created first via signup, then their roles can be assigned through the admin panel or directly in the database.

---

## ✨ Features

### 👨‍🎓 Student Features

| Feature | Description |
|---------|-------------|
| **Course Catalog** | Browse and search available courses with filters |
| **Course Enrollment** | Enroll in courses with prerequisite validation |
| **Schedule Conflict Detection** | Prevents enrolling in overlapping class times |
| **Waitlist System** | Join waitlists for full sections |
| **My Courses** | View enrolled courses with section details |
| **Assignment Submissions** | Upload PDF, DOCX, or images for assignments |
| **Gradebook** | View grades and GPA calculations |
| **Schedule View** | Weekly calendar with enrolled classes |
| **AI Assistant** | AI-powered academic help chatbot |
| **Profile Management** | Update profile with avatar upload |

### 👨‍🏫 Teacher Features

| Feature | Description |
|---------|-------------|
| **Course Management** | View assigned courses and sections |
| **Assignment Creation** | Create assignments with due dates and point values |
| **Submission Review** | View and download student submissions |
| **Grading System** | Grade submissions with feedback |
| **Student Roster** | View students enrolled in sections |
| **Dashboard Analytics** | Track enrollment and performance metrics |

### 👨‍💼 Admin Features

| Feature | Description |
|---------|-------------|
| **School Management** | CRUD operations for schools/departments |
| **Course Administration** | Create courses, sections, and assign instructors |
| **User Management** | View all users and assign roles |
| **Enrollment Oversight** | Monitor all enrollments system-wide |
| **Announcement System** | Create priority-based announcements |
| **Analytics Dashboard** | System-wide statistics and metrics |
| **Grading Access** | View and manage all grades |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI component library with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible component library |
| **React Router v6** | Client-side routing |
| **React Query (TanStack)** | Server state management |
| **React Hook Form** | Form handling with validation |
| **Zod** | Schema validation |
| **Lucide React** | Icon library |
| **date-fns** | Date manipulation |
| **Recharts** | Data visualization |

### Backend (Supabase)

| Feature | Purpose |
|---------|---------|
| **PostgreSQL** | Relational database |
| **Row-Level Security (RLS)** | Fine-grained access control |
| **Auth** | Email/password authentication |
| **Storage** | File uploads (avatars, submissions) |
| **Edge Functions** | Serverless backend logic |
| **Realtime** | Live data subscriptions |

### Design System

| Aspect | Implementation |
|--------|----------------|
| **Typography** | Plus Jakarta Sans |
| **Primary Color** | Teal (#21808D) |
| **Background** | Cream palette |
| **Dark Mode** | Full dark theme support |
| **Components** | Custom elevated cards, stat cards, badges |

---

## 🏗 Architecture

### Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     schools     │────<│     courses     │────<│ course_sections │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                │                        │
                                ▼                        ▼
                        ┌───────────────┐        ┌─────────────┐
                        │  enrollments  │<───────│   waitlist  │
                        └───────────────┘        └─────────────┘
                                │
                                │
┌─────────────────┐     ┌───────▼───────┐     ┌─────────────────┐
│    profiles     │<────│  user_roles   │     │  announcements  │
└─────────────────┘     └───────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────┐     ┌─────────────────────┐
│   assignments   │────<│ assignment_submissions│
└─────────────────┘     └─────────────────────┘
```

### Security Model

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access (student, teacher, admin)
- **Database Security**: RLS policies on all tables
- **Profile Privacy**: Users can only view relevant profiles (classmates, instructors)
- **File Security**: Private storage buckets with signed URLs

---

## 📂 Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dialogs (Course, School, Section forms)
│   ├── announcements/   # Announcement banners and lists
│   ├── assignments/     # Assignment creation, submission, grading
│   ├── auth/            # Protected route wrapper
│   ├── courses/         # Course cards and enrollment
│   ├── enrollment/      # Section selection dialog
│   ├── grading/         # Grade assignment dialogs
│   ├── layout/          # MainLayout, Sidebar
│   ├── profile/         # Avatar upload
│   └── ui/              # shadcn/ui components
├── hooks/
│   ├── useAuth.ts       # Authentication state
│   ├── useCourses.ts    # Course queries
│   ├── useEnrollments.ts # Enrollment management
│   ├── useScheduleConflicts.ts # Schedule conflict detection
│   ├── useAssignments.ts # Assignment CRUD
│   ├── useWaitlist.ts   # Waitlist operations
│   └── ...              # Other data hooks
├── pages/
│   ├── Dashboard.tsx    # Role-specific dashboards
│   ├── Courses.tsx      # Course catalog
│   ├── MyCourses.tsx    # Enrolled courses
│   ├── Assignments.tsx  # Assignment management
│   ├── Grades.tsx       # Student gradebook
│   ├── Grading.tsx      # Teacher grading interface
│   └── ...              # Other pages
├── lib/
│   ├── utils.ts         # Utility functions
│   ├── gradeUtils.ts    # GPA calculations
│   ├── scheduleUtils.ts # Time conflict detection
│   └── exportUtils.ts   # CSV export
└── integrations/
    └── supabase/        # Generated Supabase types
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd unicourse

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## 📸 Screenshots

### Student Dashboard
- Personalized greeting with enrollment statistics
- Current courses grid with progress indicators
- Today's schedule with class times and rooms

### Course Catalog
- Searchable course listing with filters
- Prerequisite indicators and credit display
- Section availability with instructor info

### Teacher Grading Interface
- Submission list with file preview
- Grade input with feedback system
- Export grades to CSV

### Admin Analytics
- System-wide statistics cards
- School overview with course counts
- Recent enrollment activity

---

## 🔐 Security Features

1. **Row-Level Security (RLS)**: Every table has granular policies
2. **Role Verification**: `has_role()` function prevents privilege escalation
3. **Profile Privacy**: `can_view_profile()` restricts data access
4. **Secure File Access**: Signed URLs for private storage buckets
5. **Input Validation**: Zod schemas on all forms
6. **CSRF Protection**: Built into Supabase Auth

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ using [Lovable](https://lovable.dev)

---

<div align="center">

**[⬆ Back to Top](#-unicourse---student-course-management-system)**

</div>
