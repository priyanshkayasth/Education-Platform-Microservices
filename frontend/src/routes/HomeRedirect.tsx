import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function HomeRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "student") return <Navigate to="/student" replace />;
  if (user.role === "instructor") return <Navigate to="/instructor" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}
