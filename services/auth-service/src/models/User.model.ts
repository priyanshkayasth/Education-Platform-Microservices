import mongoose, { Document, Schema } from "mongoose";
import { Role } from "../utils/roles.js";
import { v4 as uuidv4 } from 'uuid';


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  provider: "local" | "google";
  points: number;
  referralCode: string;
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
  },
   points: { type: Number, default: 0 },                          
    referralCode: { type: String, unique: true, sparse: true },
},
  { timestamps: true }
);

// Auto-generate referral code before saving
userSchema.pre<IUser>("save", async function () {
  if (!this.referralCode) {
    let code: string;
    let exists = true;

    while (exists) {
      code = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();

      const existing = await User.findOne({ referralCode: code });

      if (!existing) {
        this.referralCode = code;
        exists = false;
      }
    }
  }
});
const User = mongoose.model<IUser>("User", userSchema);

export default User;
