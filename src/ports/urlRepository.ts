import { ShortUrl } from "../domain/entities/shortUrl";

export interface UrlRepository {
  create(originalUrl: string, shortCode?: string): Promise<ShortUrl>;
  updateShortCode(id: number, shortCode: string): Promise<ShortUrl>;
  findByShortCode(shortCode: string): Promise<ShortUrl | null>;
  incrementClick(shortCode: string, ipAddress?: string): Promise<void>;
  getClickStats(params: { shortCode?: string; originalUrl?: string }): Promise<{ totalClicks: number; ipAddresses: string[] }>;
  findByOriginalUrl(originalUrl: string): Promise<ShortUrl | null>;
}