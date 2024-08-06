import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { SHORTEN_STRATEGY, ShortenStrategy } from './shorten-strategy';
import { InjectModel } from '@nestjs/mongoose';
import { ShortUrl } from './schemas/shorten-url.schema';
import { Model } from 'mongoose';

@Injectable()
export class ShortenUrlService {

  constructor(
    @Inject()
    private httpService: HttpService,
    @Inject(SHORTEN_STRATEGY)
    private readonly shortenStrategy: ShortenStrategy,
    @InjectModel(ShortUrl.name) private shortUrlModel: Model<ShortUrl>
  ) {
    // console.log(this.shortenStrategy.calculate('123123'))
  }

  /**
   * 生產7碼的短網址
   * key 產生方式抉擇
   * 1. random 7碼 的 base62，會有 62^7 的空間可儲存url，相對的同一個url會有不同的result，視專案需求。
   * 2. MD5後base62 encode後取前7碼，優點是同樣的url會有同樣的result，缺點是速度慢，且實做user管理自己的短網址時，db結構會較為複雜。
   * @param url
   * @returns shorten url
   */
  async generatorShortUrl(url: string) {
    return await this.shortenStrategy.calculate(url)
  }

  private async retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    let attempts = 0;
    while (attempts < retries) {
      try {
        return await fn();
      } catch (error) {
        attempts++;
        if (attempts === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async fetchUrlPreview(url: string) {
    try {
      const { data } = await firstValueFrom(this.httpService.get(url, { timeout: 5000 }));
      const $ = cheerio.load(data);

      // 提取Open Graph信息
      const title = $('meta[property="og:title"]').attr('content') || $('title').text();
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const image = $('meta[property="og:image"]').attr('content') || '';

      // 創建DOMPurify實例
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      // 清理和消毒HTML
      const cleanTitle = DOMPurify.sanitize(title);
      const cleanDescription = DOMPurify.sanitize(description);

      return {
        title: cleanTitle,
        description: cleanDescription,
        image
      };
    } catch (error) {
      if (error.response) {
        // 服務器返回了一個非2xx的響應
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        // 沒有收到響應
        console.error('No response received:', error.request);
      } else {
        // 設置請求時出現錯誤
        console.error('Error setting up request:', error.message);
      }
      throw new HttpException(`Failed to fetch URL preview: ${error.cause}`, HttpStatus.INTERNAL_SERVER_ERROR);
      // return null;
    }
  }

  /**
   * generator short url, retry防碰撞
   * @param originalUrl
   * @param userId
   * @returns
   */
  async createShortUrl(originalUrl: string, userId: string): Promise<ShortUrl> {
    const { title, description, image } = await this.fetchUrlPreview(originalUrl);
    const shortUrl = await this.generatorShortUrl(originalUrl);
    return this.retry<ShortUrl>(() => this.shortUrlModel.create({ originalUrl, shortUrl, userId, title, description, image }));
    // return newShortUrl.save();
  }

  async getUserShortUrls(userId: string): Promise<Array<ShortUrl>> {
    return this.shortUrlModel.find({ userId }).exec();
  }

  async getShortUrl(shortUrl: string): Promise<ShortUrl> {
    return this.shortUrlModel.findOne({ shortUrl }).exec();
  }

  async updateShortUrl(shortUrl: string, updateData: Partial<ShortUrl>): Promise<ShortUrl> {
    return this.shortUrlModel.findOneAndUpdate({ shortUrl }, updateData, { new: true }).exec();
  }

  async deleteShortUrl(shortUrl: string): Promise<ShortUrl> {
    return this.shortUrlModel.findOneAndDelete({ shortUrl }).exec();
  }
}
