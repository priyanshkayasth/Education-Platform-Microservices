import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { notificationService } from "../../services/notification.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      notificationService.success("Reset link sent to your email!");
    } catch (error: any) {
      notificationService.error(error?.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
          <p className="text-center text-sm text-base-content/70">
            Enter your email to receive a reset link
          </p>

          {sent ? (
            <div className="alert alert-success mt-4">
              <span>✅ Reset link sent! Check your email.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm"></span> : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link to="/login" className="link link-primary text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}