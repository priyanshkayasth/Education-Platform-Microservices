import { Role } from "../auth/roles.enum";

declare global {
  namespace Express {
    interface User {
      userId: string;
      role: Role;
      email:string
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
