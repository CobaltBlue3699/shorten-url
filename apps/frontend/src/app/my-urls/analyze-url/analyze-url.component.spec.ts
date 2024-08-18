import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyzeUrlComponent } from './analyze-url.component';

describe('AnalyzeUrlComponent', () => {
  let component: AnalyzeUrlComponent;
  let fixture: ComponentFixture<AnalyzeUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzeUrlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyzeUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
