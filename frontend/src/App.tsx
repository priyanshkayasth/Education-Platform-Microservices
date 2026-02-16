import { Routes, Route, Navigate } from "react-router-dom";

import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import PublicRoute from "./routes/PublicRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./routes/ProtectedRoutes";
import RoleRoute from "./routes/RoleBasedRoutes";
import Unauthorized from "./pages/Unauthorized";
import { Toaster } from "react-hot-toast";

import InstructorAddCourse from "./pages/instructor/AddCourse";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import EditCourse from "./pages/instructor/EditCourse";
import LessonPlayer from "./pages/LessonPlayer";
import UsersPage from "./pages/admin/UserPage";
import AdminHome from "./pages/admin/AdminHome";
import InstructorHome from "./pages/instructor/InstructorHome";
import HomeRedirect from "./routes/HomeRedirect";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
  path="/oauth-success"
  element={
    <PublicRoute>
      <OAuthSuccess />
    </PublicRoute>
  }
/>

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>

          <Route path="/" element={<HomeRedirect />} />


          {/* STUDENT */}
          <Route
            path="/student"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </RoleRoute>
            }
          />
          

          <Route
            path="/courses/:courseId/lessons/:lessonId"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <LessonPlayer />
              </RoleRoute>
            }
          />

          {/* INSTRUCTOR */}
          <Route
            path="/instructor"
            element={
              <RoleRoute allowedRoles={["instructor"]}>
                <InstructorDashboard />
              </RoleRoute>
            }
          >
            <Route index element={<InstructorHome/>} />
            <Route path="add-course" element={<InstructorAddCourse />} />
            <Route path="view-course" element={<InstructorCourses />} />
            <Route path="edit-course/:courseId" element={<EditCourse />} />
          </Route>

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          >
            {/* Dashboard Home */}
            <Route index element={<AdminHome />} />

            {/* Users Page */}
            <Route path="users" element={<UsersPage />} />
          </Route>

        </Route>

        {/* FALLBACK */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
