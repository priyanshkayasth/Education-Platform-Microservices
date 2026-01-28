import type { NextFunction, Request, Response } from "express";
import type { Role } from "../utils/roles.js";

export const authorize=(...roles:Role[])=>(req:Request,res:Response,next:NextFunction)=>{
    if(!req.user || !roles.includes(req.user.role)){
        return res.status(403).json({
            message:'Forbidden'
        })
    }
    next()
}