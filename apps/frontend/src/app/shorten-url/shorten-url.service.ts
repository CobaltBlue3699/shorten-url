import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type ShortUrl = {
  createdAt: string,
  description: string,
  image: string,
  originalUrl: string,
  shortUrl: string,
  title: string,
  updatedAt: string,
  usageCount: number,
  userId: string,
  icon: string
  __v: number
  _id: string
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

  getUserUrls(): Observable<ShortUrl[]> {
    return this.http.get<ShortUrl[]>('/s');
  }

  getUrlDetails(shortUrl: string) {
    return this.http.get(`/s/details/${shortUrl}`)
  }

  // updateUrl(req: ShortenUrl): Observable<ShortenUrl> {
  //   return this.http.put<ShortenUrl>('/s', req);
  // }

}
