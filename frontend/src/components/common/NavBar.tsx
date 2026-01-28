import { PlusCircle, ViewIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { notificationService } from "../../services/notification.service";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  const isInstructor = user?.role === "instructor";

  const handleLogout = async () => {
    await logout(); // ✅ ONLY THIS
    notificationService.success("Logged out successfully");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-base-200 bg-white/80 backdrop-blur-md">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
    
    {/* Logo / Brand */}
    <span className="text-xl font-bold tracking-tight text-primary">
      EduPlatform
    </span>

    {/* Navigation Links */}
    <div className="flex items-center gap-6 text-sm font-medium">
      <Link
        to="/courses"
        className="text-gray-600 hover:text-primary transition"
      >
        Courses
      </Link>

      {isInstructor && (
        <Link
          to="/instructor/add-course"
          className="flex items-center gap-1 text-gray-600 hover:text-primary transition"
        >
          <PlusCircle className="h-4 w-4" />
          Add Course
        </Link>
      )}

      {isInstructor && (
        <Link
          to="/instructor/view-course"
          className="flex items-center gap-1 text-gray-600 hover:text-primary transition"
        >
          <ViewIcon className="h-4 w-4" />
          View Course
        </Link>
      )}
    </div>

    {/* Actions */}
    <button
      onClick={handleLogout}
      className="btn btn-sm btn-outline btn-primary"
    >
      Logout
    </button>
  </div>
</nav>

  );
}
