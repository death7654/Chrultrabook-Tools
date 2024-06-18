import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanDataComponent } from './fan-data.component';

describe('FanDataComponent', () => {
  let component: FanDataComponent;
  let fixture: ComponentFixture<FanDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FanDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
