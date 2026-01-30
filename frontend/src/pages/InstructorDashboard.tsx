import { Footer } from "../components/common/Footer";
import Navbar from "../components/common/NavBar";
import { Outlet } from "react-router-dom";

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
