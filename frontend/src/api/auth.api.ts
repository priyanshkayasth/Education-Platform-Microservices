import api from "./axios"

export interface RegisterRequest{
    name:string,
    email:string,
    password:string
}

export interface LoginRequest{
    email:string,
    password:string
}

export const registerUser=async(data:RegisterRequest)=>{
    const response=await api.post(`/auth/register`,data)
    return response.data
}

export const loginUser=async(data:LoginRequest)=>{
    const response=await api.post(`/auth/login`,data)
    return response.data
}

export const getMe=async()=> {
    const response = await api.get("/auth/me");
    return response.data;
  }

export const logout=()=>api.post("/auth/logout")

