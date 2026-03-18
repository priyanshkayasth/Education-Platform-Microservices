import { Role } from "../utils/roles.js";
import { HttpError } from "../utils/httpError.js";
import User from "../models/User.model.js";

export const adminService = {
  // ---------------- USERS ----------------
  async getAllUsers() {
    return await User.find(
      {},
      "name email role createdAt"
    ).lean();
  },

  async updateUserRole(
    adminId: string,
    targetUserId: string,
    newRole: string
  ) {
    const normalizedRole = newRole.toLowerCase();

    if (!Object.values(Role).includes(normalizedRole as Role)) {
      throw new HttpError("Invalid role", 400);
    }

    const admin = await User.findById(adminId);
    // ADD THESE LOGS
    console.log('adminId received:', adminId);
    console.log('admin found:', admin);
    console.log('admin.role:', admin?.role);
    console.log('Role.ADMIN value:', Role.ADMIN);
    console.log('match:', admin?.role === Role.ADMIN);

    if (!admin || admin.role.toLowerCase() !== Role.ADMIN.toLowerCase()) {
      throw new HttpError("Unauthorized", 403);
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    user.role = normalizedRole as Role;
    await user.save();

    return user;
  },

  // ---------------- DASHBOARD STATS ----------------
  async getAdminStats() {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: "student" });
    const instructors = await User.countDocuments({ role: "instructor" });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name role createdAt");

    return {
      totalUsers,
      students,
      instructors,
      recentUsers,
    };
  },
};
