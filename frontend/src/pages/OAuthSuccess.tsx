import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const completeLogin = async () => {
      try {
        await api.post("/auth/oauth-login", { token });
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
