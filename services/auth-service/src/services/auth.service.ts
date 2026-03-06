import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { JWT_SECRET, JWT_SIGN_OPTIONS } from "../config/jwt.js";
import { HttpError } from "../utils/httpError.js";


import crypto from 'crypto';
import { publishEvent } from '../config/rabbitmq.js';

/* ---------- Interfaces ---------- */

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  // role?: string;
}

interface RegisterResponse {
  user: string;
  email: string;
  // role: string;
}

interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/* ---------- Register ---------- */

export const registerUser = async ({
  name,
  email,
  password,
  // role,
}: RegisterInput): Promise<RegisterResponse> => {
  const exists = await User.findOne({ email });

  const normalizedEmail = email.toLowerCase().trim();


  if (exists) {
    throw new HttpError("User already exists with this email", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    // role: role ?? "student",
  });

  return {
    user: user._id.toString(),
    email: user.email,
    // role: user.role,
  };
};

/* ---------- Login ---------- */

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new HttpError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new HttpError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    JWT_SIGN_OPTIONS
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};




/* ---------- Forgot Password ---------- */

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new HttpError('No account found with this email', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Send email via Notification Service
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await publishEvent('notification_queue', {
    type: 'forgot.password',
    studentEmail: user.email,
    resetLink,
    name: user.name,
  });

  return { message: 'Password reset link sent to your email' };
};

/* ---------- Reset Password ---------- */

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() }, // token not expired
  });

  if (!user) {
    throw new HttpError('Invalid or expired reset token', 400);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  return { message: 'Password reset successfully' };
};



export default registerUser;
