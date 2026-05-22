import { TestBed } from '@angular/core/testing';

import { Filme } from './filme';

describe('Filme', () => {
  let service: Filme;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Filme);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
