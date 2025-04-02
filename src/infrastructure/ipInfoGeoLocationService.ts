import axios from "axios";
import { GeoLocationData, GeoLocationService } from "../ports/geoLocationService";

export class IpInfoGeoLocationService implements GeoLocationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getLocationFromIp(ip: string): Promise<GeoLocationData> {
    // กรณี IP เป็น localhost หรือ IP ส่วนตัว
    console.log("Fetching location for IP:", ip); // เพิ่ม log เพื่อ debug
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        ip,
        country: 'Local Network',
        city: 'Localhost',
        latitude: 0,
        longitude: 0
      };
    }

    try {
      const response = await axios.get(`https://ipinfo.io/${ip}/json?token=${this.apiKey}`);
      const [latitude, longitude] = response.data.loc
        ? response.data.loc.split(",").map(Number)
        : [0, 0];
      return {
        ip,
        country: response.data.country || "Unknown",
        city: response.data.city || "Unknown",
        latitude,
        longitude,
      };
    } catch (error) {
      console.error(`Error getting location for IP ${ip}:`, error);
      return {
        ip,
        country: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0
      };
    }
  }
}