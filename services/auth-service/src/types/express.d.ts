import { Role } from "../utils/roles";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
