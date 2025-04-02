import { Request, Response } from "express";
import { UrlService } from "../../domain/services/urlService";

export class UrlController {
  constructor(private urlService: UrlService) {}

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
      const ipAddress = req.ip;
      const originalUrl = await this.urlService.redirectUrl(shortCode, ipAddress);
      res.redirect(301, originalUrl);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      // console.log("req.query:", req.query); // ดูค่าที่ส่งเข้ามาทั้งหมด
      const { shortCode, originalUrl } = req.query as { shortCode?: string; originalUrl?: string };
      // console.log("Extracted shortCode:", shortCode, "originalUrl:", originalUrl);
      const stats = await this.urlService.getClickStats({ shortCode, originalUrl });
      res.json(stats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}