import { loginUser, logout, registerUser, type LoginRequest, type RegisterRequest } from "../api/auth.api";

export const authService={
    async register(data:RegisterRequest){
        const response=await registerUser(data)
        return response.data
    },

    async login(data:LoginRequest){
        const response=await loginUser(data)
        return response.data
    },

    

    async logout(){
        await logout();
    }
}