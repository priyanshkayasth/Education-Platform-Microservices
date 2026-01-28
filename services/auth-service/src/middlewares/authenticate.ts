import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/jwt.js";
import type { JwtPayloadUser } from "../types/jwt-payload.js";


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



export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadUser;

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

