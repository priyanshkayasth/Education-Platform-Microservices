import { useEffect } from "react";

export default function OAuthSuccess() {
  useEffect(() => {
    console.log("OAuthSuccess loaded");

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("TOKEN FROM URL:", token);

    if (!token) {
      window.location.href = "/login";
      return;
    }

    // ✅ store token
    localStorage.setItem("access_token", token);

    // 🔥 remove token from URL for safety
    window.history.replaceState({}, document.title, "/");

    // 🔥 redirect to home (fresh reload so axios picks token)
    window.location.href = "/";
  }, []);

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
      <h2>Signing you in...</h2>
    </div>
  );
}
