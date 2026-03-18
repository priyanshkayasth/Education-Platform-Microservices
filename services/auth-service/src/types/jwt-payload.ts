import type { Role } from "../utils/roles.js";

export interface JwtPayloadUser {
  userId: string;
  role: Role;
  email?: string;
  iat?: number;
  exp?: number;
}
