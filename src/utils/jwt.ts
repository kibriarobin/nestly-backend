import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import config from "../config";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

const generateAuthTokens = (payload: {
  userId: string;
  email: string;
  name: string;
  role: string;
}) => {
  const accessToken = createToken(payload, config.jwt_access_secret, config.jwt_access_expiration);
  const refreshToken = createToken(payload, config.jwt_refresh_secret, config.jwt_refresh_expiration);
  return { accessToken, refreshToken };
};

export const jwtUtils = {
  createToken,
  verifyToken,
  generateAuthTokens,
};