import { TestBed } from '@angular/core/testing';

import { FileSaverServiceService } from './file-saver-service.service';

describe('FileSaverServiceService', () => {
  let service: FileSaverServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSaverServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
