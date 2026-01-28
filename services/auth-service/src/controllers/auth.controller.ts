import type { Request, Response } from "express";
import * as authService from '../services/auth.service.js'
import { HttpError } from "../utils/httpError.js";
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        // const user = await authService.registerUser({ name, email, password, role:'STUDENT' })
        const user = await authService.registerUser({ name, email, password })
        return res.status(201).json({
            message: 'User created successfully', user
        })
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({
                message: error.message
            })
        }

        console.error(error)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }

}


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }
        const data = await authService.loginUser(email, password)

      res.cookie("access_token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in prod
      maxAge: 15 * 60 * 1000,
      path:'/'
    });

    return res.status(200).json({
      user: data.user,
      message: "Login successful",
    });
        // return res.status(200).json({
        //     ...data,
        //     message: 'Login succesfully'
        // })
    } catch (error) {
        if (error instanceof HttpError) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Error logging in:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export const me = (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user,
  });
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Logout failed",
    });
  }


}