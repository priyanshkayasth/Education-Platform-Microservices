import type { Role } from "../utils/roles.js";

export interface JwtPayloadUser {
  id: string;
  role: Role;
  email?: string;
  iat?: number;
  exp?: number;
}
