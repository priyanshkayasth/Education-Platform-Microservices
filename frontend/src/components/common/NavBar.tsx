import { PlusCircle, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { NavLink, Link } from "react-router-dom";
import { notificationService } from "../../services/notification.service";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  const isInstructor = user?.role === "instructor";

  const handleLogout = async () => {
    await logout();
    notificationService.success("Logged out successfully");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-primary font-semibold"
      : "text-gray-600 hover:text-primary transition";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-base-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <div className="dropdown md:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-sm">
              <Menu className="h-5 w-5" />
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li><NavLink to="/courses">Courses</NavLink></li>
              {isInstructor && (
                <>
                  <li><NavLink to="/instructor/add-course">Add Course</NavLink></li>
                  {/* <li><NavLink to="/instructor/view-course">View Course</NavLink></li> */}
                </>
              )}
            </ul>
          </div>

          {/* Brand */}
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">
            EduPlatform
          </Link>

          {/* Role Badge */}
          {/* {isInstructor && (
            <span className="badge badge-outline badge-primary">
              Instructor
            </span>
          )} */}
        </div>

        {/* CENTER (Desktop Nav) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/courses" className={linkClass}>
            Courses
          </NavLink>

          {isInstructor && (
            <NavLink
              to="/instructor/add-course"
              className={linkClass}
            >
              <span className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Course
              </span>
            </NavLink>
          )}

          {/* {isInstructor && (
            <NavLink
              to="/instructor/view-course"
              className={linkClass}
            >
              <span className="flex items-center gap-1">
                <ViewIcon className="h-4 w-4" />
                View Course
              </span>
            </NavLink>
          )} */}
        </div>

        {/* RIGHT */}
        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <ThemeToggle />

          {/* ⭐ Points badge */}
          {user?.points !== undefined && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              ⭐ {user.points} pts
            </div>
          )}

          {/* User name */}
          {/* {user && (
            <span className="text-sm font-medium text-gray-700">
              {user.name}
            </span>
          )} */}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline btn-primary"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}
