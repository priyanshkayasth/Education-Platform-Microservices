import type { Request, Response } from "express";
import * as authService from '../services/auth.service.js'
import { HttpError } from "../utils/httpError.js";
import jwt from "jsonwebtoken";

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
      sameSite: "none",
      // secure: false, // true in prod
      secure: true, // true in prod
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


// export const googleCallback = async (req: Request, res: Response) => {
//   try {
//     const user = req.user as any;

//     if (!user) {
//       return res.status(401).json({ message: "Authentication failed" });
//     }

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//         role: user.role || "user",
//       },
//       process.env.JWT_SECRET!,
//       { expiresIn: "15m" }
//     );

//     // ✅ Set cookie
//     res.cookie("access_token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 15 * 60 * 1000,
//       path: "/",
//     });

//     // ✅ HTML redirect (fix for cookie drop)
//     const FRONTEND_URL =
//       process.env.FRONTEND_URL || "http://localhost:5173";

//     return res.send(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta http-equiv="refresh" content="0;url=${FRONTEND_URL}/" />
//         </head>
//         <body>
//           <script>
//             window.location.href = "${FRONTEND_URL}/";
//           </script>
//         </body>
//       </html>
//     `);
//   } catch (error) {
//     console.error("Google callback error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "http://localhost:5173";

    // 👉 redirect with token (NO cookie here)
    return res.redirect(
      `${FRONTEND_URL}/oauth-success?token=${token}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const me = (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user,
  });
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
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


export const oauthLogin = (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "OAuth login success",
    });
  } catch (err) {
    return res.status(500).json({ message: "OAuth login failed" });
  }
};
