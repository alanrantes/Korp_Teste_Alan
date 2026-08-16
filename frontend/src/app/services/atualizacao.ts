import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Atualizacao {
  private estoqueAtualizadoSubject = new Subject<void>();

  estoqueAtualizado$ = this.estoqueAtualizadoSubject.asObservable();

  notificarEstoqueAtualizado(): void {
    this.estoqueAtualizadoSubject.next();
  }
}
