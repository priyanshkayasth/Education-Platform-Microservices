import { Outlet, Link } from "react-router-dom";
import Navbar from "../components/common/NavBar";
import { Footer } from "../components/common/Footer";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <nav className="flex gap-4 p-4 bg-base-200">
        <Link to="" className="btn btn-ghost">
          Dashboard
        </Link>
        <Link to="users" className="btn btn-ghost">
          Users
        </Link>
      </nav>

      {/* Main content pushes footer down */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
