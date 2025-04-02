import { Request, Response } from "express";
import { UrlService } from "../../domain/services/urlService";

export class UrlController {
  constructor(private urlService: UrlService) { }

  async shorten(req: Request, res: Response): Promise<void> {
    try {
      const { originalUrl } = req.body as { originalUrl: string };
      const shortUrl = await this.urlService.shortenUrl(originalUrl);
      res.json({ shortUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async redirect(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;
      // ดึง IP จาก X-Forwarded-For และเลือก IP แรก (client IP)
      const forwardedFor = req.headers["x-forwarded-for"];
      const ipAddress = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.toString().split(",")[0].trim() || req.ip;
      console.log("Detected IP:", ipAddress); // Log IP ที่เลือก
      const originalUrl = await this.urlService.redirectUrl(shortCode, ipAddress);
      res.redirect(301, originalUrl);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }


  async getLocationStats(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode, originalUrl } = req.query as { shortCode?: string; originalUrl?: string };
      const locationStats = await this.urlService.getLocationStats({ shortCode, originalUrl });
      res.json(locationStats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getUrlHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await this.urlService.getUrlHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}