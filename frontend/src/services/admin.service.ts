import { fetchUsers, updateUserRole } from "../api/admin.api"

export const adminService={
    async getAllUsers(){
       return await fetchUsers()
    },
    async changeUserRole(userId:string,role:string){
        await updateUserRole(userId,role)
    }

}