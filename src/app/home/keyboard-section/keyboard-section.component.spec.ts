import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardSectionComponent } from './keyboard-section.component';

describe('KeyboardSectionComponent', () => {
  let component: KeyboardSectionComponent;
  let fixture: ComponentFixture<KeyboardSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyboardSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KeyboardSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
