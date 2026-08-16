import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Produtos } from './pages/produtos/produtos';
import { NotasFiscais } from './pages/notas-fiscais/notas-fiscais';

type Secao = 'inicio' | 'produtos' | 'faturamento';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Produtos,
    NotasFiscais
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  secaoAtual: Secao = 'inicio';

  alterarSecao(secao: Secao): void {
    this.secaoAtual = secao;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
