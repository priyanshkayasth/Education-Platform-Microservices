import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { user, loading, refetchUser } = useAuth();

  // Step 1: read token & fetch user
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("access_token", token);

    refetchUser();
  }, [navigate, refetchUser]);

  // Step 2: when user becomes available → redirect
  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="ml-3">Signing you in...</p>
    </div>
  );
}
