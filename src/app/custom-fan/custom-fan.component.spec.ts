import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFanComponent } from './custom-fan.component';

describe('CustomFanComponent', () => {
  let component: CustomFanComponent;
  let fixture: ComponentFixture<CustomFanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomFanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
