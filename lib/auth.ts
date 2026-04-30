import jwt, { type JwtPayload } from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: "admin" | "user";
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

export function signToken(payload: AuthTokenPayload): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret) as JwtPayload;

  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.userId !== "string" ||
    typeof decoded.email !== "string" ||
    (decoded.role !== "admin" && decoded.role !== "user")
  ) {
    throw new Error("Invalid token payload");
  }

  return decoded as AuthTokenPayload;
}
