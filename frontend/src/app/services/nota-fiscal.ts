import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemNotaFiscal {
  id: number;
  notaFiscalId: number;
  produtoId: number;
  quantidade: number;
}

export interface NotaFiscal {
  id: number;
  numero: number;
  status: string;
  dataCriacao: string;
  itens: ItemNotaFiscal[];
}

@Injectable({
  providedIn: 'root',
})
export class NotaFiscalService {
  private readonly apiUrl = 'https://localhost:7202/api/NotasFiscais';

  constructor(private http: HttpClient) { }

  listar(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.apiUrl}/${id}`);
  }

  criar(nota: NotaFiscal): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.apiUrl, nota);
  }

  fechar(id: number): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(
      `${this.apiUrl}/${id}/fechar`,
      {}
    );
  }
}
