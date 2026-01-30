import type { NextFunction, Request, Response } from "express";
// controllers/admin.controller.ts
import { adminService } from "../services/admin.service.js";


export const getAdminDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.json({ message: "Admin dashboard" });
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { role } = req.body as { role: string };
    const userIdParam = req.params.userId;

    // ✅ Type guard
    if (typeof userIdParam !== "string") {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    await adminService.updateUserRole(
      req.user.id,
      userIdParam, // now string
      role
    );

    res.json({
      message: "Role updated successfully. User must re-login.",
    });
  } catch (error) {
    next(error);
  }
};



export const getAdminStats = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};
