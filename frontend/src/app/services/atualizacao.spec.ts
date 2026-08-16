import { TestBed } from '@angular/core/testing';

import { Atualizacao } from './atualizacao';

describe('Atualizacao', () => {
  let service: Atualizacao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Atualizacao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
