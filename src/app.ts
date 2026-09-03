import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import helmet from "helmet";
import { AuthRoutes } from "./module/auth/auth.route";
import { PropertyRoutes } from "./module/property/property.route";
import { FlatRoutes } from "./module/flat/flat.route";
import { RoomRoutes } from "./module/room/room.route";
import { ApplicationRoutes } from "./module/application/application.route";
import { BookingRoutes } from "./module/booking/booking.route";
import { AdminRoutes } from "./module/admin/admin.route";
import { UserRoutes } from "./module/user/user.route";
import { ReviewRoutes } from "./module/review/review.route";
import { globalLimiter } from "./middleware/rateLimiter";
import { paymentRoutes } from "./module/payment/payment.route";
import passport from "./utils/passport";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);
app.use(passport.initialize());

app.get("/", (req: Request, res: Response) => {
  res.send("Nestly server is running");
});

app.use("/api/v1/auth", AuthRoutes);

app.use("/api/v1/users", UserRoutes);

app.use("/api/v1/properties", PropertyRoutes);

app.use("/api/v1/flats", FlatRoutes);

app.use("/api/v1/rooms", RoomRoutes);

app.use("/api/v1/applications", ApplicationRoutes);

app.use("/api/v1/payments", paymentRoutes);

app.use("/api/v1/bookings", BookingRoutes);

app.use("/api/v1/reviews", ReviewRoutes);

app.use("/api/v1/admin", AdminRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
