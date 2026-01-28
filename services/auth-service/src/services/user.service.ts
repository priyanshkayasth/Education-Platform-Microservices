import User from "../models/User.model.js"

export const getUserByIdService=async(userId:string)=>{
    const user=await User.findById(userId).select('email name role')
    if(!user){
        throw new Error('User not found')
    }
    return user
}