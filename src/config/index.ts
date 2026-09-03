import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT!,
  node_env: process.env.NODE_ENV!,
  database_url: process.env.DATABASE_URL!,
  app_url: process.env.APP_URL!,
  frontend_url: process.env.FRONTEND_URL!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expiration: process.env.JWT_ACCESS_EXPIRATION!,
  jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION!,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
  ssl_store_id: process.env.SSL_STORE_ID!,
  ssl_store_password: process.env.SSL_STORE_PASSWORD!,
  ssl_success_url: process.env.SSL_SUCCESS_URL!,
  ssl_fail_url: process.env.SSL_FAIL_URL!,
  ssl_cancel_url: process.env.SSL_CANCEL_URL!,
  ssl_is_live: process.env.SSL_IS_LIVE === "true",
  admin_name: process.env.ADMIN_NAME!,
  admin_email: process.env.ADMIN_EMAIL!,
  admin_password: process.env.ADMIN_PASSWORD!,
};
