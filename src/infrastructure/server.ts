import express, { Express } from "express";
import cors from "cors";
import { UrlService } from "../domain/services/urlService";
import { PrismaUrlRepository } from "../adapters/repositories/prismaUrlRepository";
import { UrlController } from "../adapters/controllers/urlController";
import * as dotenv from "dotenv";
import { IpInfoGeoLocationService } from "./ipInfoGeoLocationService";

dotenv.config();
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "8080", 10);
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:3000"];
const urlRepository = new PrismaUrlRepository();
const geoLocationService = new IpInfoGeoLocationService(process.env.IPINFO_API_KEY || "");
const urlService = new UrlService(urlRepository, geoLocationService);
const urlController = new UrlController(urlService);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }, methods: ["GET", "POST"], allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.post("/shorten", urlController.shorten.bind(urlController));
app.get("/location-stats", urlController.getLocationStats.bind(urlController));
app.get("/history", urlController.getUrlHistory.bind(urlController));
app.get("/:shortCode", urlController.redirect.bind(urlController));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});