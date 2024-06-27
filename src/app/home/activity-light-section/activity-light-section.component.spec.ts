import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivityLightSectionComponent } from "./activity-light-section.component";

describe("ActivityLightSectionComponent", () => {
  let component: ActivityLightSectionComponent;
  let fixture: ComponentFixture<ActivityLightSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLightSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityLightSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
