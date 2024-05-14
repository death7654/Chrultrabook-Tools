import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardExtraComponent } from './keyboard-extra.component';

describe('KeyboardExtraComponent', () => {
  let component: KeyboardExtraComponent;
  let fixture: ComponentFixture<KeyboardExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyboardExtraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KeyboardExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
