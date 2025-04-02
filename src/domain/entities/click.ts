export class Click {
    constructor(
      public id: number,
      public shortUrlId: number,
      public clickedAt: Date,
      public ipAddress?: string,
      public geoLocation?: GeoLocation
    ) {}
  }
  
  export class GeoLocation {
    constructor(
      public id: number,
      public clickId: number,
      public country?: string,
      public city?: string,
      public latitude?: number,
      public longitude?: number
    ) {}
  }