import bcrypt from "bcryptjs"
import User from "../models/User.model.js"

export const getUserByIdService=async(userId:string)=>{
    const user=await User.findById(userId).select('email name role')
    if(!user){
        throw new Error('User not found')
    }
    return user
}


export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Find user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return { message: 'Password changed successfully' };
}