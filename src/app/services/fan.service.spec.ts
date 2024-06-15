import { TestBed } from '@angular/core/testing';

import { FanService } from './fan.service';

describe('FanService', () => {
  let service: FanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
