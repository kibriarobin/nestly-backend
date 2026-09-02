import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT!,
  node_env: process.env.NODE_ENV!,
  database_url: process.env.DATABASE_URL!,
  app_url: process.env.APP_URL!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION!,
  jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION!,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
};
