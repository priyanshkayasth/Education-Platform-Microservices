// import React, { createContext, useContext, useEffect, useState } from "react"
// import api from "../api/axios"
// import { useNavigate } from "react-router-dom"

// type User = {
//     id: string,
//     role: 'student' | 'instructor' | 'admin'
// }

// type AuthContextType = {
//     user: User | null,
//     loading: boolean,
//     logout: () => Promise<void>,
//     refetchUser:()=>Promise<void>
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)

//   const navigate = useNavigate()

//   const fetchUser = async () => {
//   try {
//     const res = await api.get("/auth/me")
//     setUser(res.data.user)
//   } catch {
//     setUser(null)
//   }
// }


//   useEffect(() => {
//     fetchUser().finally(() => setLoading(false))
//   }, [])

//   const logout = async () => {
//     await api.post("/auth/logout")
//     setUser(null)
//     navigate("/login", { replace: true })
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, logout, refetchUser: fetchUser }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }



// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };

// export default AuthProvider


////

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: String;
  role: "student" | "instructor" | "admin";
  referralCode?: string;
  points?:number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      await api.post("/auth/logout")
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");

      setUser(null)
      setIsLoggingOut(false)
      navigate("/login", { replace: true });

    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refetchUser: fetchUser,
        isLoggingOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthProvider;
