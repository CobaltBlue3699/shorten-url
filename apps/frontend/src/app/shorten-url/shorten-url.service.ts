import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type ShortenUrl = {
  createdAt: string,
  description: string,
  image: string,
  originalUrl: string,
  shortUrl: string,
  title: string,
  updatedAt: string,
  usageCount: number,
  userId: string,
  __v: number
  _id: string
}

export type ShortenUrlRequest = Pick<ShortenUrl, 'originalUrl'>;


@Injectable({
  providedIn: 'root'
})
export class ShortenUrlService {

  http = inject(HttpClient);

  generateShortUrl(req: ShortenUrlRequest): Observable<ShortenUrl> {
    return this.http.post<ShortenUrl>('/s', req);
  }

  getUserUrls(): Observable<ShortenUrl[]> {
    return this.http.get<ShortenUrl[]>('/s');
  }

  getUrlDetails(shortUrl: string) {
    return this.http.get(`/s/details/${shortUrl}`)
  }

  // updateUrl(req: ShortenUrl): Observable<ShortenUrl> {
  //   return this.http.put<ShortenUrl>('/s', req);
  // }

}
