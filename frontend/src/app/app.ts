import { Component } from '@angular/core';
import { Produtos } from './pages/produtos/produtos';
import { NotasFiscais } from './pages/notas-fiscais/notas-fiscais';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Produtos, NotasFiscais],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App { }
