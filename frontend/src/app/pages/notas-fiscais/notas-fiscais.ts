import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NotaFiscal,
  NotaFiscalService
} from '../../services/nota-fiscal';

import {
  Produto,
  ProdutoService
} from '../../services/produto';

import { Atualizacao } from '../../services/atualizacao';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notas-fiscais.html',
  styleUrl: './notas-fiscais.css',
})
export class NotasFiscais implements OnInit {
  notas: NotaFiscal[] = [];
  produtos: Produto[] = [];

  produtoSelecionado = 0;
  quantidade = 1;

  itens: {
    produtoId: number;
    quantidade: number;
  }[] = [];

  mensagem = '';
  notaProcessandoId: number | null = null;

  constructor(
    private notaFiscalService: NotaFiscalService,
    private produtoService: ProdutoService,
    private atualizacao: Atualizacao,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarNotas();
    this.carregarProdutos();
  }

  carregarNotas(): void {
    this.notaFiscalService.listar().subscribe({
      next: (dados) => {
        this.notas = dados;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Erro ao carregar notas fiscais.';
        this.cdr.markForCheck();
      },
    });
  }

  carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Erro ao carregar produtos.';
        this.cdr.markForCheck();
      },
    });
  }

  adicionarItem(): void {
    if (this.produtoSelecionado <= 0 || this.quantidade <= 0) {
      this.mensagem = 'Selecione um produto e informe uma quantidade válida.';
      return;
    }

    this.itens.push({
      produtoId: this.produtoSelecionado,
      quantidade: this.quantidade,
    });

    this.produtoSelecionado = 0;
    this.quantidade = 1;
    this.mensagem = '';
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);
  }

  criarNota(): void {
    if (this.itens.length === 0) {
      this.mensagem = 'Adicione pelo menos um item à nota fiscal.';
      return;
    }

    const nota: NotaFiscal = {
      id: 0,
      numero: 0,
      status: 'Aberta',
      dataCriacao: new Date().toISOString(),
      itens: this.itens.map((item) => ({
        id: 0,
        notaFiscalId: 0,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
      })),
    };

    this.notaFiscalService.criar(nota).subscribe({
      next: () => {
        this.mensagem = 'Nota fiscal criada com sucesso.';
        this.itens = [];
        this.carregarNotas();
        this.cdr.markForCheck();
      },
      error: (erro) => {
        this.mensagem =
          typeof erro.error === 'string'
            ? erro.error
            : 'Erro ao criar nota fiscal.';

        this.cdr.markForCheck();
      },
    });
  }

  fecharNota(id: number): void {
    this.notaProcessandoId = id;
    this.mensagem = 'Processando impressão da nota fiscal...';
    this.cdr.markForCheck();

    this.notaFiscalService.fechar(id).subscribe({
      next: () => {
        this.mensagem = 'Nota fiscal impressa e fechada com sucesso.';
        this.notaProcessandoId = null;

        this.carregarNotas();
        this.carregarProdutos();

        this.atualizacao.notificarEstoqueAtualizado();

        this.cdr.markForCheck();
      },
      error: (erro) => {
        this.notaProcessandoId = null;

        this.mensagem =
          typeof erro.error === 'string'
            ? erro.error
            : 'Erro ao imprimir a nota fiscal.';

        this.cdr.markForCheck();
      },
    });
  }

  obterDescricaoProduto(produtoId: number): string {
    const produto = this.produtos.find(
      (p) => p.id === produtoId
    );

    return produto
      ? `${produto.codigo} - ${produto.descricao}`
      : `Produto ${produtoId}`;
  }
}
