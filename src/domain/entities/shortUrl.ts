export class ShortUrl {
  constructor(
    public id: number,
    public originalUrl: string,
    public shortCode: string
  ) {}
}

export class Click {
  constructor(
    public id: number,
    public shortUrlId: number,
    public clickedAt: Date,
    public ipAddress?: string
  ) {}
}