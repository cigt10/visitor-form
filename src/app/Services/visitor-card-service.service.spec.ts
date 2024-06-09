import { TestBed } from '@angular/core/testing';

import { VisitorCardServiceService } from './visitor-card-service.service';

describe('VisitorCardServiceService', () => {
  let service: VisitorCardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitorCardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
