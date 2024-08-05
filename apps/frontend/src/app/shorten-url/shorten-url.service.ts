import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type ShortenUrlRequest = {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShortenUrlService {

  http = inject(HttpClient);

  shortenUrl(req: ShortenUrlRequest) {
    return this.http.post('/api/shorten-url', req);
  }

  urlPreview(url: string) {
    return this.http.get('/api/shorten-url/preview', {
      params: { url }
    })
  }

}
