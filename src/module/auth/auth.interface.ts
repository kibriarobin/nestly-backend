import type { UserRole } from "../../../generated/prisma/enums";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "OWNER" | "TENANT">;
  phone?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}