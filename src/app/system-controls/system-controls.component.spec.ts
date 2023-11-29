import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemControlsComponent } from './system-controls.component';

describe('SystemControlsComponent', () => {
  let component: SystemControlsComponent;
  let fixture: ComponentFixture<SystemControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
