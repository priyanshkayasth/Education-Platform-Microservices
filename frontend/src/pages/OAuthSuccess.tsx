import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ store token locally
    localStorage.setItem("access_token", token);

    const completeLogin = async () => {
      try {
        await refetchUser();   // this now sends Authorization header
        navigate("/", { replace: true });
      } catch (err) {
        console.error("OAuth login failed", err);
        navigate("/login");
      }
    };

    completeLogin();
  }, [navigate, refetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="ml-3">Signing you in...</p>
    </div>
  );
}
