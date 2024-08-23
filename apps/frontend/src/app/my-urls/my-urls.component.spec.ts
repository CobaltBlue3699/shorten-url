import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyUrlsComponent } from './my-urls.component';
import { ShortenUrlService } from '../shorten-url/shorten-url.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MyUrlComponent', () => {
  let component: MyUrlsComponent;
  let fixture: ComponentFixture<MyUrlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUrlsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), ShortenUrlService],
    }).compileComponents();

    fixture = TestBed.createComponent(MyUrlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
