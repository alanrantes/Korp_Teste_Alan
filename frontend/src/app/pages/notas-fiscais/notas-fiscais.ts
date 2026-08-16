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

  buscaNota = '';

  itens: {
    produtoId: number;
    quantidade: number;
  }[] = [];

  mensagem = '';
  notaProcessandoId: number | null = null;

  // Controla a exibição do modal de rascunho
  modalRascunhoAberto = false;

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

  get notasFiltradas(): NotaFiscal[] {
    const termo = this.buscaNota
      .trim()
      .toLowerCase();

    if (!termo) {
      return this.notas;
    }

    return this.notas.filter((nota) => {
      const numeroNota = String(nota.numero).toLowerCase();

      const encontrouNota =
        numeroNota.includes(termo) ||
        `#${numeroNota}`.includes(termo);

      const encontrouProduto = nota.itens.some((item) => {
        const produto = this.produtos.find(
          (p) => p.id === item.produtoId
        );

        if (!produto) {
          return String(item.produtoId).includes(termo);
        }

        return (
          produto.codigo.toLowerCase().includes(termo) ||
          produto.descricao.toLowerCase().includes(termo) ||
          `${produto.codigo} ${produto.descricao}`
            .toLowerCase()
            .includes(termo)
        );
      });

      return encontrouNota || encontrouProduto;
    });
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
      this.mensagem =
        'Selecione um produto e informe uma quantidade válida.';

      this.cdr.markForCheck();
      return;
    }

    this.itens.push({
      produtoId: this.produtoSelecionado,
      quantidade: this.quantidade,
    });

    this.produtoSelecionado = 0;
    this.quantidade = 1;
    this.mensagem = '';

    // Abre o modal automaticamente após adicionar o item
    this.abrirRascunho();

    this.cdr.markForCheck();
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);

    // Se remover o último item, fecha o modal
    if (this.itens.length === 0) {
      this.fecharRascunho();
    }

    this.cdr.markForCheck();
  }

  abrirRascunho(): void {
    if (this.itens.length === 0) {
      return;
    }

    this.modalRascunhoAberto = true;
    this.cdr.markForCheck();
  }

  fecharRascunho(): void {
    this.modalRascunhoAberto = false;
    this.cdr.markForCheck();
  }

  criarNota(): void {
    if (this.itens.length === 0) {
      this.mensagem =
        'Adicione pelo menos um item à nota fiscal.';

      this.fecharRascunho();
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
        this.mensagem =
          'Nota fiscal criada com sucesso.';

        this.itens = [];

        // Fecha o modal depois da criação
        this.fecharRascunho();

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

    this.mensagem =
      'Processando impressão da nota fiscal...';

    this.cdr.markForCheck();

    this.notaFiscalService.fechar(id).subscribe({
      next: () => {
        this.mensagem =
          'Nota fiscal impressa e fechada com sucesso.';

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

  limparBuscaNotas(): void {
    this.buscaNota = '';
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
