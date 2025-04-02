import express, { Express } from "express";
import cors from "cors";
import { UrlService } from "../domain/services/urlService";
import { PrismaUrlRepository } from "../adapters/repositories/prismaUrlRepository";
import { UrlController } from "../adapters/controllers/urlController";
import * as dotenv from "dotenv";

dotenv.config();
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "8080", 10);

// Dependency Injection
const urlRepository = new PrismaUrlRepository();
const urlService = new UrlService(urlRepository);
const urlController = new UrlController(urlService);

app.use(
  cors({
    origin: "http://localhost:5173", // อนุญาตเฉพาะ frontend ที่รันบน port 3000
    methods: ["GET", "POST"], // อนุญาตเฉพาะ GET และ POST
    allowedHeaders: ["Content-Type"], // อนุญาต header นี้
  })
);
app.use(express.json());

// Routes
app.post("/shorten", urlController.shorten.bind(urlController));
app.get("/stats", urlController.getStats.bind(urlController));
app.get("/:shortCode", urlController.redirect.bind(urlController));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});