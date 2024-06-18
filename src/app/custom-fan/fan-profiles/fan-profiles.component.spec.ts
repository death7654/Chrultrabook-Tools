import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanProfilesComponent } from './fan-profiles.component';

describe('FanProfilesComponent', () => {
  let component: FanProfilesComponent;
  let fixture: ComponentFixture<FanProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanProfilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FanProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
