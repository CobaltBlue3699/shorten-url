import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export class Pagination<T> {
  pageNo = 1;
  pageSize = 10;
  data!: T;
}

export type DailyStat = {
  key: string;
  date: string;
  count: number;
};

export type CountryStat = {
  key: string;
  countryCode: string;
  count: number;
};

export type ShortUrl = {
  createdAt: string;
  description: string;
  image: string;
  originalUrl: string;
  shortUrl: string;
  key: string;
  title: string;
  updatedAt: string;
  userId: string;
  icon: string;
  __v: number;
  _id: string;
};

export type ShortUrlDetails = ShortUrl & {
  dailyUsageStats: DailyStat[];
  countryUsageStats: CountryStat[];
};

export type ShortenUrlRequest = Pick<ShortUrl, 'originalUrl'>;

@Injectable({
  providedIn: 'root',
})
export class ShortenUrlService {
  http = inject(HttpClient);

  generateShortUrl(req: ShortenUrlRequest): Observable<ShortUrl> {
    return this.http.post<ShortUrl>('/urls', req);
  }

  getUserUrls(pageNo = 1, pageSize = 10) {
    return this.http.get<Pagination<ShortUrlDetails[]>>('/urls', {
      params: {
        pageNo,
        pageSize,
      },
    });
  }

  getUrlDetails(key: string) {
    return this.http.get<ShortUrlDetails>(`/urls/${key}`);
  }

  deleteUrl(key: string) {
    return this.http.delete<ShortUrl>(`/urls/${key}`);
  }

  // updateUrl(req: ShortenUrl): Observable<ShortenUrl> {
  //   return this.http.put<ShortenUrl>('/s', req);
  // }
}
