export const SHORTEN_STRATEGY = '__ShortenStrategy__';

/**
 * 生產7碼的短網址
 * key 產生方式抉擇
 * 1. random 7碼 的 base62，會有 62^7 的空間可儲存url，相對的同一個url會有不同的result，視專案需求。
 * 2. MD5後base62 encode後取前7碼，優點是同樣的url會有同樣的result，缺點是速度慢，且實做user管理自己的短網址時，db結構、API交互會較為複雜。
 * @param url
 * @returns shorten url
 */
export interface ShortenStrategy {
  calculate(url: string): Promise<string>;
}

export class RandomStrategy implements ShortenStrategy {
  range = '0123456789abcdefghijklmnopurstuvwxyzABCDEFGFIJKLMNOPURSTUVWXYZ';

  async calculate(url: string) {
    // console.log('RandomStrategy')
    return new Array(7)
      .fill(0)
      .map(() => {
        return this.range[this.getRandomInt(0, 61)];
      })
      .join('');
  }

  getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }
}

export class Md5Strategy implements ShortenStrategy {
  async calculate(url: string) {
    return await 'not implemented yet';
  }
}
