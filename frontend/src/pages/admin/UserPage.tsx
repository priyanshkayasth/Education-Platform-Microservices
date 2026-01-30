import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { toBackendRole } from "../../utils/roleMapper";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/admin.service";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

useEffect(() => {
  adminService
    .getAllUsers()
    .then((data) => {
    //   console.log("USERS DATA:", data);
      setUsers(data);
    })
    .catch((err) => {
      console.error("LOAD USERS ERROR:", err);
      toast.error("Failed to load users");
    })
    .finally(() => setLoading(false));
}, []);

  const changeRole = async (
    userId: string,
    role: "student" | "instructor"
  ) => {
    try {
      setUpdatingId(userId);

      // 🔥 convert frontend role → backend role
      await adminService.changeUserRole(
        userId,
        toBackendRole(role)
      )

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role } : u
        )
      );

      toast.success("Role updated. User must re-login.");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-xl font-bold">Users</h2>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-right">Change Role</th>
                </tr>
              </thead>
              <tbody>
  {users.length === 0 ? (
    <tr>
      <td colSpan={4} className="text-center py-6 opacity-70">
        No users found
      </td>
    </tr>
  ) : (
    users.map((user) => {
      const isSelf = currentUser?.id === user._id;

      return (
        <tr key={user._id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>
            <span className="badge badge-outline capitalize">
              {user.role}
            </span>
          </td>
          <td className="text-right">
            <select
              className="select select-sm select-bordered"
              value={user.role}
              disabled={isSelf || updatingId === user._id}
              onChange={(e) =>
                changeRole(
                  user._id,
                  e.target.value as "student" | "instructor"
                )
              }
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </td>
        </tr>
      );
    })
  )}
</tbody>

            </table>
          </div>

          <p className="text-sm text-base-content/60 mt-3">
            ⚠ Role changes apply after user logs in again.
          </p>
        </div>
      </div>
    </div>
  );
}
