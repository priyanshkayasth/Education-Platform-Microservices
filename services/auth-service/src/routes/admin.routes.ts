import express, { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { Role } from '../utils/roles.js';
import { getAdminDashboard, getAdminStats, getAllUsers, updateUserRole } from '../controllers/admin.controller.js';

const router=Router();

router.use(authenticate, authorize(Role.ADMIN));

// router.get("/dashboard", (req, res) => {
//   res.json({ message: "Admin dashboard" });
// });

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.patch("/users/:userId/role",authenticate ,updateUserRole);
router.get("/stats",getAdminStats)

export default router