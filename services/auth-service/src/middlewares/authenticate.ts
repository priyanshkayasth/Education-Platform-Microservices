import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/jwt.js";
import type { JwtPayloadUser } from "../types/jwt-payload.js";
import User from "../models/User.model.js";


// export const authenticate=(req:Request,res:Response,next:NextFunction)=>{
//     const token=req.headers.authorization?.split(' ')[1]
//     if(!token){
//         return res.status(401).json({
//             message:'Unauthorized'
//         })
//     }

//     try {
//         req.user=jwt.verify(token,JWT_SECRET) as any;
//         next()
        
//     } catch (error) {
//         res.status(401).json({
//             message:'Invalid token'
//         })
//     }
// }



//



// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const token = req.cookies?.access_token;

//   if (!token) {
//     res.status(401).json({ message: "Unauthorized" });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadUser;

//     req.user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

//

// export const authenticate = async(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
// let token: string | null | undefined = null;

//     // 🔥 1. Authorization header (OAuth / mobile / cross-domain)
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.split(" ")[1];
//     }

//     // 🔥 2. Cookie fallback (your existing login system)
//     if (!token && req.cookies?.access_token) {
//       token = req.cookies.access_token;
//     }

//     if (!token) {
//       res.status(401).json({ message: "Unauthorized" });
//       return;
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadUser;

//      // ← fetch user from DB to get referralCode and points
//     const user = await User.findById(decoded.id).select('id role referralCode points name');

//      if (!user) {
//       res.status(401).json({ message: "User not found" });
//       return;
//     }

//     req.user = {
//       id: decoded.id,
//       role: decoded.role,
//       referralCode: user.referralCode,
//       points: user.points,
//       name: user.name,
//     };

//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };


//

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🔥 Read from gateway headers
    const userId = req.headers["x-user-id"] as string | undefined;
    const role = req.headers["x-user-role"] as string | undefined;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no user id header" });
    }

    // optionally fetch user from DB if you need more fields
    const user = await User.findById(userId).select("_id role referralCode points name");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: String(user._id),
      role: user.role,
      referralCode: user.referralCode,
      points: user.points,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Invalid auth context" });
  }
};