import { UrlRepository, LocationStats, UrlHistoryItem } from "../../ports/urlRepository";
import { GeoLocationService } from "../../ports/geoLocationService";
import base62 from "base62";
import crypto from "crypto";

export class UrlService {
  constructor(
    private urlRepository: UrlRepository,
    private geoLocationService?: GeoLocationService
  ) { }

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

    const clickId = await this.urlRepository.incrementClick(shortCode, ipAddress);

    if (this.geoLocationService && ipAddress) {
      try {
        const geoData = await this.geoLocationService.getLocationFromIp(ipAddress);
        await this.urlRepository.saveGeoLocation(clickId, geoData);
      } catch (error) {
        console.error("Error processing geolocation:", error);
      }
    }

    return url.originalUrl;
  }

  async getClickStats({ shortCode, originalUrl }: { shortCode?: string; originalUrl?: string }): Promise<{ totalClicks: number; ipAddresses: string[] }> {
    if (!shortCode && !originalUrl) throw new Error("Must provide either shortCode or originalUrl");
    return this.urlRepository.getClickStats({ shortCode, originalUrl });
  }

  async getLocationStats({ shortCode, originalUrl }: { shortCode?: string; originalUrl?: string }): Promise<LocationStats> {
    if (!shortCode && !originalUrl) throw new Error("Must provide either shortCode or originalUrl");
    console.log("shortCode", shortCode);
    console.log("originalUrl", originalUrl);
    return this.urlRepository.getLocationStats({ shortCode, originalUrl });
  }

  async getUrlHistory(): Promise<UrlHistoryItem[]> {
    return this.urlRepository.getAllUrlsWithClickCount();
  }

  
}