import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderAndTextComponent } from './slider-and-text.component';

describe('SliderAndTextComponent', () => {
  let component: SliderAndTextComponent;
  let fixture: ComponentFixture<SliderAndTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderAndTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliderAndTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
