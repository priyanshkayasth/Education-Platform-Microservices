import { useState } from "react";
import Navbar from "../components/common/NavBar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { notificationService } from "../services/notification.service";

export default function ProfilePage() {
    const { user } = useAuth();
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            notificationService.error("New passwords don't match");
            return;
        }

        if (form.newPassword.length < 6) {
            notificationService.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await api.patch("/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            notificationService.success("Password changed successfully!");
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            notificationService.error(error?.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 p-6 max-w-2xl mx-auto w-full">

                {/* Profile Info */}
                <div className="card bg-base-100 shadow mb-6">
                    <div className="card-body">
                        <h2 className="card-title">Profile</h2>
                        <div className="flex items-center gap-4">
                            <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-16 h-16 flex items-center justify-center">
                                    <span className="text-2xl">{user?.name?.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{user?.name}</p>
                                <p className="text-sm text-base-content/60 capitalize">{user?.role}</p>
                                <div className="badge badge-primary mt-1">⭐ {user?.points ?? 0} points</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">Change Password</h2>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Current Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">New Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Confirm New Password</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-2"
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Change Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}