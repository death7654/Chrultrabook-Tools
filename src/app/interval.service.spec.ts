import { TestBed } from '@angular/core/testing';

import { IntervalService } from './interval.service';

describe('IntervalService', () => {
  let service: IntervalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntervalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
