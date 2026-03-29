import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import StudentRegister from "./pages/StudentRegister";
import StudentLogin from "./pages/StudentLogin";
import StudentHome from "./pages/StudentHome";

import AlumniRegister from "./pages/AlumniRegister";
import AlumniLogin from "./pages/AlumniLogin";
import AlumniHome from "./pages/AlumniHome";
import AlumniDetailPage from "./pages/AlumniDetailPage";

import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";
import AlumniStudentRequestDetail from "./pages/AlumniStudentRequestDetail";
import ResetPassword from "./pages/ResetPassword";



const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/login" element={<StudentLogin />} />

              <Route
                path="/student/home"
                element={
                  <ProtectedRoute allowedRole="student">
                    <StudentHome />
                  </ProtectedRoute>
                }
              />

              <Route path="/alumni/register" element={<AlumniRegister />} />
              <Route path="/alumni/login" element={<AlumniLogin />} />

              <Route
                path="/alumni/home"
                element={
                  <ProtectedRoute allowedRole="alumni">
                    <AlumniHome />
                  </ProtectedRoute>
                }
              />

              {/* ✅ ONLY ONE alumni detail route */}
              <Route
                path="/alumni/:id"
                element={
                  <ProtectedRoute>
                    <AlumniDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/alumni/student-request/:id" 
                element={<AlumniStudentRequestDetail />}
              />
              <Route path="/reset-password/:id" element={<ResetPassword />} />
              

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
