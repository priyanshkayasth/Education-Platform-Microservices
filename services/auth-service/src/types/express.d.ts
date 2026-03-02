import { Role } from "../utils/roles";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      referralCode?: string;
      points?: number;
      name?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
