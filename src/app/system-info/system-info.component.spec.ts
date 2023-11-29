import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInfoComponent } from './system-info.component';

describe('SystemInfoComponent', () => {
  let component: SystemInfoComponent;
  let fixture: ComponentFixture<SystemInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
