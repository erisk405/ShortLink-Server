import { PrismaClient } from "@prisma/client";
import { ShortUrl } from "../../domain/entities/shortUrl";
import { UrlRepository, LocationStats, UrlHistoryItem } from "../../ports/urlRepository";
import { GeoLocationData } from "../../ports/geoLocationService";

export class PrismaUrlRepository implements UrlRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(originalUrl: string, shortCode?: string): Promise<ShortUrl> {
    const url = await this.prisma.shortUrl.create({
      data: { originalUrl, shortCode: shortCode || "" },
    });
    return new ShortUrl(url.id, url.originalUrl, url.shortCode);
  }

  async updateShortCode(id: number, shortCode: string): Promise<ShortUrl> {
    const url = await this.prisma.shortUrl.update({
      where: { id },
      data: { shortCode },
    });
    return new ShortUrl(url.id, url.originalUrl, url.shortCode);
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    const url = await this.prisma.shortUrl.findUnique({
      where: { shortCode },
    });
    return url ? new ShortUrl(url.id, url.originalUrl, url.shortCode) : null;
  }

  async findByOriginalUrl(originalUrl: string): Promise<ShortUrl | null> {
    const url = await this.prisma.shortUrl.findFirst({
      where: { originalUrl },
    });
    return url ? new ShortUrl(url.id, url.originalUrl, url.shortCode) : null;
  }

  async incrementClick(shortCode: string, ipAddress?: string): Promise<number> {
    const url = await this.prisma.shortUrl.findUnique({
      where: { shortCode },
    });
    if (!url) throw new Error("Short URL not found");

    const click = await this.prisma.click.create({
      data: {
        shortUrlId: url.id,
        ipAddress,
      },
    });
    return click.id; // คืนค่า clickId
  }

  // async getClickStats(params: { shortCode?: string; originalUrl?: string }): Promise<{ totalClicks: number; ipAddresses: string[] }> {
  //   const { shortCode, originalUrl } = params;
  //   const url = shortCode
      // ? await this.prisma.shortUrl.findUnique({ where: { shortCode } })
  //     : await this.prisma.shortUrl.findFirst({ where: { originalUrl } });
  //   if (!url) throw new Error("URL not found");

  //   const clicks = await this.prisma.click.findMany({
  //     where: { shortUrlId: url.id },
  //   });
    // const allIPs = clicks.map(click => click.ipAddress || "unknown");
  //   const uniqueIPs = [...new Set(clicks.map(click => click.ipAddress || "unknown"))];//ใช้ Set เพื่อกรอง IP ที่ซ้ำกันออก โดยแปลง array ของ ipAddress ให้เหลือเฉพาะ IP ที่ไม่ซ้ำ
  //   return { totalClicks: clicks.length, ipAddresses: uniqueIPs };
  // }

  async saveGeoLocation(clickId: number, geoData: GeoLocationData): Promise<void> {
    await this.prisma.geoLocation.create({
      data: {
        clickId,
        country: geoData.country,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
      },
    });
  }


  async getLocationStats(params: { shortCode?: string; originalUrl?: string }): Promise<LocationStats> {
    const { shortCode, originalUrl } = params;
    const url = shortCode
      ? await this.prisma.shortUrl.findUnique({ where: { shortCode } })
      : await this.prisma.shortUrl.findFirst({ where: { originalUrl } });
    if (!url) throw new Error("URL not found");

    const clicksWithGeoData = await this.prisma.click.findMany({
      where: { shortUrlId: url.id },
      include: { geoLocation: true },
    });

    const locationMap = new Map<string, { country: string; city: string; latitude: number; longitude: number; count: number }>();
    clicksWithGeoData.forEach((click) => {
      if (click.geoLocation) {
        const key = `${click.geoLocation.country}-${click.geoLocation.city}`;
        if (locationMap.has(key)) {
          locationMap.get(key)!.count += 1;
        } else {
          locationMap.set(key, {
            country: click.geoLocation.country || "Unknown",
            city: click.geoLocation.city || "Unknown",
            latitude: click.geoLocation.latitude || 0,
            longitude: click.geoLocation.longitude || 0,
            count: 1,
          });
        }
      }
    });

    const locations = Array.from(locationMap.values()).sort((a, b) => b.count - a.count);
    const latestGeoLocation = await this.getLatestGeoLocation(url.id);
    return {
      totalClicks: clicksWithGeoData.length,
      latestGeoLocation,
      locations,
    };
  }

  async getLatestGeoLocation(shortUrlId: number): Promise<GeoLocationData | null> {
    const data = await this.prisma.click.findFirst({
      where: { shortUrlId },
      orderBy: { clickedAt: "desc" },
      select: {
        geoLocation: {
          select: {
            country: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });
    return data?.geoLocation
      ? {
        ip: "", // ไม่มี IP ในกรณีนี้ แต่ต้อง match กับ GeoLocationData
        country: data.geoLocation.country || "Unknown",
        city: data.geoLocation.city || "Unknown",
        latitude: data.geoLocation.latitude || 0,
        longitude: data.geoLocation.longitude || 0,
      }
      : null;
  }

  async getAllUrlsWithClickCount(): Promise<UrlHistoryItem[]> {
    const urls = await this.prisma.shortUrl.findMany({
      include: { clicks: true },
      orderBy: { createdAt: "desc" }, // เรียงจาก URL ล่าสุดไปเก่าสุด
    });

    return urls.map(url => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      createdAt: url.createdAt,
      clickCount: url.clicks.length,
    }));
  }
}