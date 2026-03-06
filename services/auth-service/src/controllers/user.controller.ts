import type { Request, Response } from "express"
import { getUserByIdService } from "../services/user.service.js"
import User from "../models/User.model.js";

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        //  Type guard
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const user = await getUserByIdService(id)
        return res.status(200).json({
            user
        })
    } catch (error: any) {
        return res.status(404).json({
            message: error.message || 'User not found'
        })
    }
}

export const awardReferralPoints = async (req: Request, res: Response) => {
  try {
    const { referralCode, points = 10 } = req.body;

    const user = await User.findOneAndUpdate(
      { referralCode },
      { $inc: { points:Number(points) } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User with referral code not found' });
    }

    return res.json({
      message: 'Points awarded successfully',
      userId: user._id,
      points: user.points
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to award points' });
  }
}


export const deductPoints = async (req: Request, res: Response) => {
  try {
    const { studentId, points } = req.body;
    console.log('deductPoints called:', { studentId, points }); 

    const user = await User.findByIdAndUpdate(
      studentId,
      { $inc: { points: -Number(points) } }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Points deducted successfully',
      points: user.points
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to deduct points' });
  }
};

import { changePasswordService } from '../services/user.service.js';

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const result = await changePasswordService(userId, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Failed to change password' });
  }
};