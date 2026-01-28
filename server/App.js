import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./Routes/User.routes.js";
import jobRouter from "./Routes/Job.routes.js";
import proposalRouter from "./Routes/Proposal.routes.js";
import escrowRouter from "./Routes/Escrow.routes.js";
import releaseRouter from "./Routes/Release.routes.js";
import paymentRouter from "./Routes/Payment.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/users", userRouter);
app.use("/api/job", jobRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/escrow", escrowRouter);
app.use("/api/release", releaseRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("Running...");
});

const PORT = process.env.PORT || 7070;

// Connect to MongoDB
mongoose.connect(process.env.DB_URL);

// Only listen on PORT if not in serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
}

export default app;
