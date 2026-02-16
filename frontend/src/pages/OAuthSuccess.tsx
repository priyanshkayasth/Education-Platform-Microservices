import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const {refetchUser}=useAuth()

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const completeLogin = async () => {
      try {
        await api.post("/auth/oauth-login", { token });
        await new Promise(resolve => setTimeout(resolve,100))
        await refetchUser()
        navigate("/", { replace: true });
      } catch (err) {
        console.error("OAuth login failed", err);
        navigate("/login");
      }
    };

    completeLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="ml-3">Signing you in...</p>
    </div>
  );
}
