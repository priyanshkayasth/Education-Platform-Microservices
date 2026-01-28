import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { JWT_SECRET, JWT_SIGN_OPTIONS } from "../config/jwt.js";
import { HttpError } from "../utils/httpError.js";

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
      id: user._id.toString(),
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

export default registerUser;
