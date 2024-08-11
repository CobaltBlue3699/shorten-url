import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export class Pagination<T> {
  pageNo = 1;
  pageSize = 10;
  data!: T
}

export type UsageStat = {
  _id: string;
  shortUrl: string;
  date: string;
  count: number;
}

export type ShortUrl = {
  createdAt: string,
  description: string,
  image: string,
  originalUrl: string,
  shortUrl: string,
  title: string,
  updatedAt: string,
  userId: string,
  icon: string
  __v: number
  _id: string
}

export type ShortUrlDetails = ShortUrl & {
  usageStats: UsageStat[]
}

export type ShortenUrlRequest = Pick<ShortUrl, 'originalUrl'>;


@Injectable({
  providedIn: 'root'
})
export class ShortenUrlService {

  http = inject(HttpClient);

  generateShortUrl(req: ShortenUrlRequest): Observable<ShortUrl> {
    return this.http.post<ShortUrl>('/s', req);
  }

  getUserUrls(pageNo = 1, pageSize = 10) {
    return this.http.get<Pagination<ShortUrlDetails[]>>('/s', {
      params: {
        pageNo,
        pageSize
      }
    });
  }

  getUrlDetails(shortUrl: string) {
    return this.http.get<ShortUrlDetails>(`/s/details/${shortUrl}`)
  }

  // updateUrl(req: ShortenUrl): Observable<ShortenUrl> {
  //   return this.http.put<ShortenUrl>('/s', req);
  // }

}
