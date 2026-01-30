import api from "./axios"


export const fetchUsers=async()=>{
    const response=await api.get("/admin/users")
    return response.data
}

export const updateUserRole=async(userId:string,role:string)=>{
    await api.patch(`/admin/users/${userId}/role`,{role})
}

export const fetchAdminDashboard=async()=>{
    const response=await api.get('/admin/dashboard')
    return response.data
}