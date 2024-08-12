import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { SHORTEN_STRATEGY, ShortenStrategy } from './shorten-strategy';
import { InjectModel } from '@nestjs/mongoose';
import { ShortUrl } from './schemas/shorten-url.schema';
import { Model } from 'mongoose';
import { UsageStat } from './schemas/usage-state.schema';
import moment from 'moment';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ShortenUrlService {

  constructor(
    @Inject()
    private httpService: HttpService,
    @Inject(SHORTEN_STRATEGY)
    private readonly shortenStrategy: ShortenStrategy,
    @InjectModel(ShortUrl.name) private shortUrlModel: Model<ShortUrl>,
    @InjectModel(UsageStat.name) private readonly usageStatModel: Model<UsageStat>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // console.log(this.shortenStrategy.calculate('123123'))
  }

  /**
   * 生產7碼的短網址
   * key 產生方式抉擇
   * 1. random 7碼 的 base62，會有 62^7 的空間可儲存url，相對的同一個url會有不同的result，視專案需求。
   * 2. MD5後base62 encode後取前7碼，優點是同樣的url會有同樣的result，缺點是速度慢，且實做user管理自己的短網址時，db結構會較為複雜。
   * @param url
   * @returns hashed key
   */
  async generatorKey(url: string) {
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

  async updateUsageCount(key: string): Promise<void> {
    const date = moment().format('YYYY-MM-DD');
    // console.log('bull goooooooooooooooo')
    await this.usageStatModel.findOneAndUpdate(
      { key, date },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    ).exec()
  }

  async fetchUrlPreview(url: string) {
    try {
      const { data } = await firstValueFrom(this.httpService.get(url, { timeout: 5000 }));
      const $ = cheerio.load(data);

      // 提取Open Graph信息
      const title = $('meta[property="og:title"]').attr('content') || $('title').text();
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      const image = $('meta[property="og:image"]').attr('content') || '';

      // 抓取 icon
      let icon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';
      if (icon && !icon.startsWith('http')) {
        icon = new URL(icon, url).href;  // 如果是相對路徑，轉換為絕對路徑
      } else if (!icon) {
        icon = `${new URL(url).origin}/favicon.ico`;  // 如果沒有找到，使用默認的 /favicon.ico
      }

      // 創建DOMPurify實例
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      // 清理和消毒HTML
      const cleanTitle = DOMPurify.sanitize(title);
      const cleanDescription = DOMPurify.sanitize(description);

      return {
        title: cleanTitle,
        description: cleanDescription,
        image,
        icon
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
      console.error(`Failed to fetch URL preview: ${error.cause}`, error.message);
      return { title: '', description: '', image: '', icon: '' };
    }
  }

  /**
   * generator short url, retry防碰撞
   * @param originalUrl
   * @param userId
   * @returns
   */
  async createShortUrl(originalUrl: string, userId: string): Promise<ShortUrl> {
    const { title, description, image, icon } = await this.fetchUrlPreview(originalUrl);
    const key = await this.generatorKey(originalUrl);
    return this.retry<ShortUrl>(() => this.shortUrlModel.create({ originalUrl, key, userId, title, description, image, icon }));
    // return newShortUrl.save();
  }

  async getUserShortUrls(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const urls = await this.shortUrlModel
      .find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return {
      pageNo: page,
      pageSize: urls.length,
      data: urls
    }
  }

  async getShortUrl(key: string): Promise<ShortUrl> {
    const cachedShortUrl = await this.cacheManager.get<ShortUrl>(key);
    if (cachedShortUrl) {
      // console.log('get it from cache')
      return cachedShortUrl;
    }

    const shortUrlDoc = await this.shortUrlModel.findOne({ key }).exec();
    if (shortUrlDoc) {
      await this.cacheManager.set(key, shortUrlDoc, 60 * 60 * 1000); // Cache for 1 hour
    }
    return shortUrlDoc;
  }

  async getShortUrlDeatils(key: string): Promise<ShortUrl> {
    const resArr = await this.shortUrlModel.aggregate([
      { $match: { key } },
      {
        $lookup: {
          from: 'usagestats', // Ensure this matches the actual collection name
          localField: 'key',
          foreignField: 'key',
          as: 'usageStats',
          pipeline: [
            { $sort: { date: 1 } } // Sort usageStats by date in ascending order
          ],
        },
      },
    ]).exec()
    return (resArr && resArr.length) === 0 ? null : resArr[0];
  }

  async updateShortUrl(key: string, updateData: Partial<ShortUrl>): Promise<ShortUrl> {
    return this.shortUrlModel.findOneAndUpdate({ key }, updateData, { new: true }).exec();
  }

  async deleteShortUrl(key: string): Promise<ShortUrl> {
    return this.shortUrlModel.findOneAndDelete({ key }).exec();
  }
}
