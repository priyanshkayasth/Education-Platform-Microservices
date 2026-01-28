import type { SignOptions } from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET!;

const expiresIn: NonNullable<SignOptions["expiresIn"]> =
  (process.env.JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>) ?? "1d";

export const JWT_SIGN_OPTIONS: SignOptions = {
  expiresIn,
};
