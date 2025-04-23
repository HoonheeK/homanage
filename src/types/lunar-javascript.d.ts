declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    toDate(): Date;
  }
  export class Lunar {
    static fromDate(date: Date): Lunar;
    getSolar(): Solar;
    toDate(): Date;
  }
}
