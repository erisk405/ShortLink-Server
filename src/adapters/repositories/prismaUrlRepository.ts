import { PrismaClient } from "@prisma/client";
import { UrlRepository } from "../../ports/urlRepository";
import { ShortUrl } from "../../domain/entities/shortUrl";

const prisma = new PrismaClient();

export class PrismaUrlRepository implements UrlRepository {
  async create(originalUrl: string, shortCode?: string): Promise<ShortUrl> {
    const result = await prisma.shortUrl.create({
      data: { originalUrl, shortCode: shortCode || "" },
    });
    return new ShortUrl(result.id, result.originalUrl, result.shortCode);
  }

  async updateShortCode(id: number, shortCode: string): Promise<ShortUrl> {
    const result = await prisma.shortUrl.update({
      where: { id },
      data: { shortCode },
    });
    return new ShortUrl(result.id, result.originalUrl, result.shortCode);
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    // console.log("Finding by shortCode:", shortCode);
    const result = await prisma.shortUrl.findUnique({
      where: { shortCode: shortCode },
    });
    // console.log("Result from findByShortCode:", result);
    return result ? new ShortUrl(result.id, result.originalUrl, result.shortCode) : null;
  }

  async findByOriginalUrl(originalUrl: string): Promise<ShortUrl | null> {
    // console.log("Finding by originalUrl:", originalUrl);
    const result = await prisma.shortUrl.findFirst({
      where: { originalUrl: originalUrl },
    });
    // console.log("Result from findByOriginalUrl:", result);
    return result ? new ShortUrl(result.id, result.originalUrl, result.shortCode) : null;
  }

  async incrementClick(shortCode: string, ipAddress?: string): Promise<void> {
    console.log("Incrementing click for shortCode:", shortCode, "IP:", ipAddress);
    const url = await this.findByShortCode(shortCode);
    if (url) {
      const click = await prisma.click.create({
        data: {
          shortUrlId: url.id,
          ipAddress,
        },
      });
      console.log("Click recorded:", click);
    } else {
      console.log("Short URL not found for:", shortCode);
    }
  }

  async getClickStats({ shortCode, originalUrl }: { shortCode?: string; originalUrl?: string }): Promise<{ totalClicks: number; ipAddresses: string[] }> {
    console.log("Fetching stats with:", { shortCode, originalUrl });
    let clicks;
    if (shortCode) {
      clicks = await prisma.click.findMany({
        where: { shortUrl: { shortCode } },
        select: { ipAddress: true },
      });
    } else if (originalUrl) {
      clicks = await prisma.click.findMany({
        where: { shortUrl: { originalUrl } },
        select: { ipAddress: true },
      });
    } else {
      throw new Error("Must provide either shortCode or originalUrl");
    }
    console.log("Clicks found:", clicks);
    const totalClicks = clicks.length;
    const ipAddresses = [...new Set(clicks.map(click => click.ipAddress || "unknown"))];
    return { totalClicks, ipAddresses };
  }
}