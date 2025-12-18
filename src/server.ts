import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { openAPIRouter } from "./api-docs/openAPIRouter";
import errorHandler from "./common/middleware/errorHandler";
import { userRouter } from "./api/user/userRouter";
import rateLimiter from "./common/middleware/rateLimiter";
import { healthCheckRouter } from "./api/healthCheck/healthCheckRouter";
import { tableRouter } from "./api/table/tableRouter";
import { menuItemRouter } from "./api/menuItem/menuItemRouter";
import { reservationRouter } from "./api/reservation/reservationRouter";
import { allergenRouter } from "./api/allergen/allergenRouter";

const app: Express = express();
const server = http.createServer(app);

// Middlewares
app.use(helmet());
app.use(rateLimiter);
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", userRouter);
app.use("/api", healthCheckRouter);
app.use("/api", tableRouter);
app.use("/api", menuItemRouter);
app.use("/api", reservationRouter);
app.use("/api", allergenRouter);

// OpenAPI Documentation
app.use(openAPIRouter);

app.use(errorHandler());

export { server };