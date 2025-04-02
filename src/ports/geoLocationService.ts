export interface GeoLocationData {
    ip: string;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
}
export interface GeoLocationService {
    getLocationFromIp(ip: string): Promise<GeoLocationData>;
}