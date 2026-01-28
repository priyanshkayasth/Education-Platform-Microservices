import type { Request, Response } from "express"
import { getUserByIdService } from "../services/user.service.js"

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