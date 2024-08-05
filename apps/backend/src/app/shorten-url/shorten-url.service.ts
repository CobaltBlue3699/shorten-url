import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

@Injectable()
export class ShortenUrlService {

  // http = Inject(HttpService);

  constructor(
    @Inject() private httpService: HttpService
  ) {

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
}
