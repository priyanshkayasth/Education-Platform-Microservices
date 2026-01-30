import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "../../api/admin.api";

type Stats = {
  totalUsers: number;
  students: number;
  instructors: number;
  courses: number;
};

type RecentUser = {
  name: string;
  role: string;
  createdAt: string;
};

type RecentCourse = {
  title: string;
  instructor: string;
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard()
      .then((data) => {
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setRecentCourses(data.recentCourses);
      })
      .catch(() => {
        console.error("Failed to load admin dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-error">
        Failed to load dashboard
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-base-content/70">
          Welcome back! Here's what's happening on your platform.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon="👤" />
        <StatCard title="Students" value={stats.students} icon="🎓" />
        <StatCard title="Instructors" value={stats.instructors} icon="🧑‍🏫" />
        <StatCard title="Courses" value={stats.courses} icon="📚" />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Users</h2>

            <ul className="space-y-4">
              {recentUsers.length === 0 ? (
                <li className="opacity-70">No recent users</li>
              ) : (
                recentUsers.map((user, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <span className="badge badge-outline capitalize">
                        {user.role}
                      </span>
                    </div>
                    <span className="text-sm opacity-70">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Courses</h2>

            <ul className="space-y-4">
              {recentCourses.length === 0 ? (
                <li className="opacity-70">No recent courses</li>
              ) : (
                recentCourses.map((course, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{course.title}</span>
                    <span className="text-sm opacity-70">
                      {course.instructor}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable stat card */
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="stat bg-base-200 shadow-lg rounded-box min-h-[130px]">
      <div className="stat-figure text-primary text-4xl">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
