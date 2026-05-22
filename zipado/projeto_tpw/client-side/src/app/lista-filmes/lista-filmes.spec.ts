import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaFilmes } from './lista-filmes';

describe('ListaFilmes', () => {
  let component: ListaFilmes;
  let fixture: ComponentFixture<ListaFilmes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaFilmes],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaFilmes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
