import { useState } from "react"
import toast from "react-hot-toast"
import { authService } from "../../services/auth.service"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { refetchUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!form.email || !form.password) {
        toast.error("All fields are required")
        setLoading(false)
        return
      }

      await authService.login(form)
      await refetchUser()
      toast.success("Login successful")

     

      setForm({
        email: "",
        password: "",
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        const message =
          typeof data?.message === "string"
            ? data.message
            : "Something went wrong. Please try again.";

        toast.error(message);
        setError(message);
        return;
      }

      toast.error("Something went wrong. Please try again.");
      setError("Something went wrong. Please try again.");
    }



    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-base-content/70">
            Login to continue learning
          </p>

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
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Login"
              )}
            </button>
          </form>

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
  )
}


