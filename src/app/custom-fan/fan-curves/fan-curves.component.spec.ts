import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FanCurvesComponent } from "./fan-curves.component";

describe("FanCurvesComponent", () => {
  let component: FanCurvesComponent;
  let fixture: ComponentFixture<FanCurvesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FanCurvesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FanCurvesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
