import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto, ProdutoService } from '../../services/produto';
import { Atualizacao } from '../../services/atualizacao';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
})
export class Produtos implements OnInit {
  produtos: Produto[] = [];
  termoBusca = '';
  editando = false;
  mensagem = '';

  produtoForm: Produto = this.novoProduto();

  constructor(
    private produtoService: ProdutoService,
    private atualizacao: Atualizacao,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarProdutos();

    this.atualizacao.estoqueAtualizado$.subscribe(() =>
      this.carregarProdutos()
    );
  }

  get produtosFiltrados(): Produto[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return termo
      ? this.produtos.filter(({ codigo, descricao }) =>
        codigo.toLowerCase().includes(termo) ||
        descricao.toLowerCase().includes(termo)
      )
      : this.produtos;
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

  salvar(): void {
    if (this.editando) {
      this.atualizarProduto();
      return;
    }

    this.produtoService.criar(this.produtoForm).subscribe({
      next: () => this.finalizarAcao('Produto cadastrado com sucesso.'),
      error: (erro) =>
        this.definirMensagem(erro.error ?? 'Erro ao cadastrar produto.'),
    });
  }

  editar(produto: Produto): void {
    this.produtoForm = { ...produto };
    this.editando = true;
  }

  excluir(id: number): void {
    this.produtoService.excluir(id).subscribe({
      next: () => this.finalizarAcao('Produto excluído com sucesso.', false),
      error: () => this.definirMensagem('Erro ao excluir produto.'),
    });
  }

  limparFormulario(): void {
    this.produtoForm = this.novoProduto();
    this.editando = false;
  }

  limparBusca(): void {
    this.termoBusca = '';
  }

  private atualizarProduto(): void {
    this.produtoService
      .atualizar(this.produtoForm.id, this.produtoForm)
      .subscribe({
        next: () => this.finalizarAcao('Produto atualizado com sucesso.'),
        error: (erro) =>
          this.definirMensagem(erro.error ?? 'Erro ao atualizar produto.'),
      });
  }

  private finalizarAcao(mensagem: string, limparFormulario = true): void {
    this.mensagem = mensagem;

    if (limparFormulario) {
      this.limparFormulario();
    }

    this.carregarProdutos();
  }

  private definirMensagem(mensagem: string): void {
    this.mensagem = mensagem;
    this.atualizarTela();
  }

  private atualizarTela(): void {
    this.cdr.markForCheck();
  }

  private novoProduto(): Produto {
    return {
      id: 0,
      codigo: '',
      descricao: '',
      saldo: 0,
    };
  }
}
