import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotaFiscal, NotaFiscalService } from '../../services/nota-fiscal';
import { Produto, ProdutoService } from '../../services/produto';
import { Atualizacao } from '../../services/atualizacao';

type ItemRascunho = {
  produtoId: number;
  quantidade: number;
};

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
  itens: ItemRascunho[] = [];

  produtoSelecionado = 0;
  quantidade = 1;
  buscaNota = '';
  mensagem = '';
  modalRascunhoAberto = false;
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

  get notasFiltradas(): NotaFiscal[] {
    const termo = this.buscaNota.trim().toLowerCase();

    if (!termo) {
      return this.notas;
    }

    return this.notas.filter((nota) =>
      String(nota.numero).includes(termo) ||
      `#${nota.numero}`.includes(termo) ||
      nota.itens.some((item) => this.produtoCorrespondeBusca(item.produtoId, termo))
    );
  }

  carregarNotas(): void {
    this.notaFiscalService.listar().subscribe({
      next: (notas) => {
        this.notas = notas;
        this.atualizarTela();
      },
      error: () => this.definirMensagem('Erro ao carregar notas fiscais.'),
    });
  }

  carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.atualizarTela();
      },
      error: () => this.definirMensagem('Erro ao carregar produtos.'),
    });
  }

  adicionarItem(): void {
    if (this.produtoSelecionado <= 0 || this.quantidade <= 0) {
      this.definirMensagem(
        'Selecione um produto e informe uma quantidade válida.'
      );
      return;
    }

    this.itens.push({
      produtoId: this.produtoSelecionado,
      quantidade: this.quantidade,
    });

    this.produtoSelecionado = 0;
    this.quantidade = 1;
    this.mensagem = '';
    this.abrirRascunho();
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);

    if (!this.itens.length) {
      this.fecharRascunho();
      return;
    }

    this.atualizarTela();
  }

  abrirRascunho(): void {
    if (!this.itens.length) {
      return;
    }

    this.modalRascunhoAberto = true;
    this.atualizarTela();
  }

  fecharRascunho(): void {
    this.modalRascunhoAberto = false;
    this.atualizarTela();
  }

  criarNota(): void {
    if (!this.itens.length) {
      this.definirMensagem('Adicione pelo menos um item à nota fiscal.');
      this.fecharRascunho();
      return;
    }

    this.notaFiscalService.criar(this.montarNota()).subscribe({
      next: () => {
        this.mensagem = 'Nota fiscal criada com sucesso.';
        this.itens = [];
        this.fecharRascunho();
        this.carregarNotas();
      },
      error: (erro) =>
        this.definirMensagem(
          this.obterMensagemErro(erro, 'Erro ao criar nota fiscal.')
        ),
    });
  }

  fecharNota(id: number): void {
    this.notaProcessandoId = id;
    this.definirMensagem('Processando impressão da nota fiscal...');

    this.notaFiscalService.fechar(id).subscribe({
      next: () => {
        this.notaProcessandoId = null;
        this.mensagem = 'Nota fiscal impressa e fechada com sucesso.';

        this.carregarNotas();
        this.carregarProdutos();
        this.atualizacao.notificarEstoqueAtualizado();
      },
      error: (erro) => {
        this.notaProcessandoId = null;

        this.definirMensagem(
          this.obterMensagemErro(erro, 'Erro ao imprimir a nota fiscal.')
        );
      },
    });
  }

  limparBuscaNotas(): void {
    this.buscaNota = '';
  }

  obterDescricaoProduto(produtoId: number): string {
    const produto = this.buscarProduto(produtoId);

    return produto
      ? `${produto.codigo} - ${produto.descricao}`
      : `Produto ${produtoId}`;
  }

  private montarNota(): NotaFiscal {
    return {
      id: 0,
      numero: 0,
      status: 'Aberta',
      dataCriacao: new Date().toISOString(),
      itens: this.itens.map((item) => ({
        id: 0,
        notaFiscalId: 0,
        ...item,
      })),
    };
  }

  private buscarProduto(produtoId: number): Produto | undefined {
    return this.produtos.find((produto) => produto.id === produtoId);
  }

  private produtoCorrespondeBusca(produtoId: number, termo: string): boolean {
    const produto = this.buscarProduto(produtoId);

    if (!produto) {
      return String(produtoId).includes(termo);
    }

    const codigo = produto.codigo.toLowerCase();
    const descricao = produto.descricao.toLowerCase();

    return (
      codigo.includes(termo) ||
      descricao.includes(termo) ||
      `${codigo} ${descricao}`.includes(termo)
    );
  }

  private obterMensagemErro(erro: any, padrao: string): string {
    return typeof erro.error === 'string'
      ? erro.error
      : padrao;
  }

  private definirMensagem(mensagem: string): void {
    this.mensagem = mensagem;
    this.atualizarTela();
  }

  private atualizarTela(): void {
    this.cdr.markForCheck();
  }
}
