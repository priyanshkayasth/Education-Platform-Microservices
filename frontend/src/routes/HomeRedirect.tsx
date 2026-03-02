import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;


  if (!user) return <Navigate to="/login" replace />;

  // Check if there's a saved referral redirect
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  if (redirectTo && redirectTo !== '/') {
    sessionStorage.removeItem('redirectAfterLogin');
    return <Navigate to={redirectTo} replace />;
  }

  if (user.role === "student") return <Navigate to="/student" replace />;
  if (user.role === "instructor") return <Navigate to="/instructor" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}



