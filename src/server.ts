import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet, { xssFilter } from "helmet";
import hpp from "hpp";
import multer from "multer";
import authRouter from "./routes/auth.route";
import companyRouter from "./routes/company.route";
import uploadRouter from "./routes/file.route";
import { checkBucket } from "./services/bucket";
import { connectToDatabase } from "./services/database";
import bookingRouter from "./routes/booking.route";

dotenv.config();
checkBucket();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xssFilter());
app.use(hpp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100000,
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.use("/api/company", companyRouter);

app.use("/api/file", upload.single("file"), uploadRouter);

app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingRouter);

const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || "";

connectToDatabase(MONGODB_URI);

app.listen(PORT, () => console.log(`Server is starting at port ${PORT}`));
