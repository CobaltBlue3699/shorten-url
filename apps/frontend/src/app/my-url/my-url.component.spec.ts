import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyUrlComponent } from './my-url.component';

describe('MyUrlComponent', () => {
  let component: MyUrlComponent;
  let fixture: ComponentFixture<MyUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUrlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
