import mongoose, { Document, Schema } from "mongoose";
import { Role } from "../utils/roles.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  provider: "local" | "google";
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },
     provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  }
},
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
