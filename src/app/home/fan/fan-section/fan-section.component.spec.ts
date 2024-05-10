import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSectionComponent } from './fan-section.component';


describe('FanSectionComponent', () => {
  let component: FanSectionComponent;
  let fixture: ComponentFixture<FanSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FanSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
