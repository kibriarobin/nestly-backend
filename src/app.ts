import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import helmet from "helmet";
import { AuthRoutes } from "./module/auth/auth.route";
import { PropertyRoutes } from "./module/property/property.route";

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

app.get("/", (req: Request, res: Response) => {
  res.send("Nestly server is running");
});

app.use("/api/auth", AuthRoutes);

app.use("/api/properties", PropertyRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
