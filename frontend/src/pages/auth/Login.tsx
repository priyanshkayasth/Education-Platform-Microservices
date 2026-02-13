import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });


  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const { refetchUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 🔁 Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔐 Email/Password Login
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginLoading(true);
  setError(null);

  try {
    if (!form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    const res = await authService.login(form);

    //  invalid credentials
    if (!res?.user) {
      toast.error(res?.message || "Invalid email or password");
      return;
    }

    //  valid login
    await refetchUser();
    toast.success("Login successful");

  } catch (error: any) {
  const message =
    error?.response?.data?.message ||   
    "Invalid email or password";        

  toast.error(message);

  } finally {
    setLoginLoading(false);
  }
};

  //  Google Login
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // window.location.href = "http://localhost:3001/auth/google";
     const baseUrl = import.meta.env.VITE_AUTH_BASE_URL;
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
          <p className="text-center text-sm text-base-content/70">
            Login to continue learning
          </p>

          {/*  EMAIL LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                onChange={handleChange}
                value={form.email}
                className="input input-bordered w-full"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                value={form.password}
                className="input input-bordered w-full"
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/*  GOOGLE LOGIN BUTTON */}
          <button
            type="button"
            className="btn btn-primary w-full mt-3"
            disabled={googleLoading}
            onClick={handleGoogleLogin}
          >
            {googleLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Login with Google"
            )}
          </button>

          <div className="divider">OR</div>

          <p className="text-center text-sm">
            Don’t have an account?
            <Link to="/register" className="link link-primary ml-1">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
