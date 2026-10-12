import { TestBed } from '@angular/core/testing';

import { ToggleFormService } from './toggle-form.service';

describe('ToggleFormService', () => {
  let service: ToggleFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
