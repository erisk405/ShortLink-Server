import { UrlRepository } from "../../ports/urlRepository";
import base62 from "base62";
import crypto from "crypto";

export class UrlService {
  constructor(private urlRepository: UrlRepository) {}

  async shortenUrl(originalUrl: string): Promise<string> {
    const existingUrl = await this.urlRepository.findByOriginalUrl(originalUrl);
    if (existingUrl) {
      return `http://localhost:8080/${existingUrl.shortCode}`;
    }

    const newUrl = await this.urlRepository.create(originalUrl, "");
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0);
    const uniqueNum = newUrl.id * 1000000 + (randomValue % 1000000);
    const shortCode = base62.encode(uniqueNum);
    await this.urlRepository.updateShortCode(newUrl.id, shortCode);
    return `http://localhost:8080/${shortCode}`;
  }

  async redirectUrl(shortCode: string, ipAddress?: string): Promise<string> {
    const url = await this.urlRepository.findByShortCode(shortCode);
    if (!url) throw new Error("Short URL not found");
    await this.urlRepository.incrementClick(shortCode, ipAddress);
    return url.originalUrl;
  }

  async getClickStats({ shortCode, originalUrl }: { shortCode?: string; originalUrl?: string }): Promise<{ totalClicks: number; ipAddresses: string[] }> {
    // console.log("getClickStats called with:", { shortCode, originalUrl });
    if (!shortCode && !originalUrl) {
      throw new Error("Must provide either shortCode or originalUrl");
    }
    const url = shortCode 
      ? await this.urlRepository.findByShortCode(shortCode) 
      : await this.urlRepository.findByOriginalUrl(originalUrl!);
    // console.log("Found URL:", url);
    if (!url) throw new Error(shortCode ? "Short URL not found" : "Original URL not found");
    return this.urlRepository.getClickStats({ shortCode, originalUrl });
  }
}