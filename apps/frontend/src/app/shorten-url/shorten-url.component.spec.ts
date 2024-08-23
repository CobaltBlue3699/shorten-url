import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShortenUrlComponent } from './shorten-url.component';
import { ShortenUrlService } from './shorten-url.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('ShortenUrlComponent', () => {
  let component: ShortenUrlComponent;
  let fixture: ComponentFixture<ShortenUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortenUrlComponent, RouterModule.forRoot([])],
      providers: [provideHttpClient(), provideHttpClientTesting(), ShortenUrlService],
    }).compileComponents();

    fixture = TestBed.createComponent(ShortenUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
