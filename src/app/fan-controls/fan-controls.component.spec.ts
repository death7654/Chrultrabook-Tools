import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanControlsComponent } from './fan-controls.component';

describe('FanControlsComponent', () => {
  let component: FanControlsComponent;
  let fixture: ComponentFixture<FanControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FanControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
