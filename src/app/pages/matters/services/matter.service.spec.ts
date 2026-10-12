import { TestBed } from '@angular/core/testing';

import { MatterService } from './matter.service';

describe('MatterService', () => {
  let service: MatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
