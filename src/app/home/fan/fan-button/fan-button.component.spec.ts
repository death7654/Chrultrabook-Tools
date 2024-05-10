import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanButtonComponent } from './fan-button.component';

describe('FanButtonComponent', () => {
  let component: FanButtonComponent;
  let fixture: ComponentFixture<FanButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FanButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
