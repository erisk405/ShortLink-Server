import { ShortUrl } from "../domain/entities/shortUrl";
import { GeoLocationData } from "./geoLocationService";

export interface LocationStats {
  totalClicks: number;
  latestGeoLocation: GeoLocationData | null;
  locations: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    count: number;
  }[];
}

export interface UrlHistoryItem {
  id: number;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clickCount: number;
}

export interface UrlRepository {
  create(originalUrl: string, shortCode?: string): Promise<ShortUrl>;
  updateShortCode(id: number, shortCode: string): Promise<ShortUrl>;
  findByShortCode(shortCode: string): Promise<ShortUrl | null>;
  incrementClick(shortCode: string, ipAddress?: string): Promise<number>;
  // getClickStats(params: { shortCode?: string; originalUrl?: string }): Promise<{ totalClicks: number; ipAddresses: string[] }>;
  findByOriginalUrl(originalUrl: string): Promise<ShortUrl | null>;
  saveGeoLocation(clickId: number, geoData: GeoLocationData): Promise<void>;
  getLocationStats(params: { shortCode?: string; originalUrl?: string }): Promise<LocationStats>;
  getLatestGeoLocation(shortUrlId: number): Promise<GeoLocationData | null>;
  getAllUrlsWithClickCount(): Promise<UrlHistoryItem[]>;
}