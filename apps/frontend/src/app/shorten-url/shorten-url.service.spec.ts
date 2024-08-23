import { TestBed } from '@angular/core/testing';

import { ShortenUrlService } from './shorten-url.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ShortenUrlService', () => {
  let service: ShortenUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShortenUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
