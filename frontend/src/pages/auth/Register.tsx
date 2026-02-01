import React, { useState } from "react"
import { authService } from "../../services/auth.service"
import toast from "react-hot-toast"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

interface RegisterForm {
    name: string,
    email: string,
    password: string
}

export default function Register() {
    const [form, setForm] = useState<RegisterForm>({
        name: '',
        email: '',
        password: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!form.name || !form.email || !form.password) {
                toast.error('All fields are required')
                return
            }

            await authService.register(form)
            toast.success('Registration Successfull')
            navigate('/login')
            setForm({
                name: '',
                email: '',
                password: ''
            })

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message;

                // Show specific error message from backend
                if (errorMessage) {
                    toast.error(errorMessage);
                } else if (error.response?.status === 409) {
                    // Fallback for conflict errors (duplicate email)
                    toast.error('Email already exists. Please use a different email or login.');
                } else {
                    toast.error('Registration failed. Please try again.');
                }
            } else {
                toast.error('Registration failed. Please try again.');
            }
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
                        Create Your Account
                    </h2>
                    <p className="text-center text-sm text-base-content/70">
                        Join our learning platform
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {/* Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Full Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                onChange={handleChange}
                                value={form.name}
                                className="input input-bordered w-full"

                            />
                        </div>

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
                            <label className="label">
                                <span className="label-text-alt text-base-content/60">

                                </span>
                            </label>
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
                                "Register"
                            )}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <p className="text-center text-sm">
                        Already have an account?
                        <Link to="/login" className="link link-primary ml-1">
                            login
                        </Link>
                    </p>
                </div>
            </div>
        </div>

    )
}