import { Component } from '@angular/core';
import { Produtos } from './pages/produtos/produtos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Produtos],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App { }
