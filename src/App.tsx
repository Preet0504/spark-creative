import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import Schedule from "./pages/Schedule";
import Schools from "./pages/Schools";
import Users from "./pages/Users";
import CoursesAdmin from "./pages/CoursesAdmin";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Grading from "./pages/Grading";
import Assignments from "./pages/Assignments";
import Grades from "./pages/Grades";
import Announcements from "./pages/Announcements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          } />
          <Route path="/my-courses" element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="/grades" element={
            <ProtectedRoute>
              <Grades />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/schools" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Schools />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/courses-admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CoursesAdmin />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/grading" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <Grading />
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Announcements />
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
