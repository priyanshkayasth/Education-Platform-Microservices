// import type { JSX } from "react";
// import { useAuth } from "../context/AuthContext";
// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({children,}:{children:JSX.Element}){
//     const {user,loading}=useAuth()
//     if(loading) return <div>Loading...</div>
//     if(!user) return <Navigate to='/login' replace/>

//     return children
// }


import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
