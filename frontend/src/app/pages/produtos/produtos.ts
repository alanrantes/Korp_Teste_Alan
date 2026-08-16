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

  produtoForm: Produto = {
    id: 0,
    codigo: '',
    descricao: '',
    saldo: 0,
  };

  editando = false;
  mensagem = '';

  constructor(
    private produtoService: ProdutoService,
    private atualizacao: Atualizacao,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarProdutos();

    this.atualizacao.estoqueAtualizado$.subscribe(() => {
      this.carregarProdutos();
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

  salvar(): void {
    if (this.editando) {
      this.produtoService
        .atualizar(this.produtoForm.id, this.produtoForm)
        .subscribe({
          next: () => {
            this.mensagem = 'Produto atualizado com sucesso.';
            this.limparFormulario();
            this.carregarProdutos();
            this.cdr.markForCheck();
          },
          error: (erro) => {
            this.mensagem =
              erro.error ?? 'Erro ao atualizar produto.';
            this.cdr.markForCheck();
          },
        });

      return;
    }

    this.produtoService.criar(this.produtoForm).subscribe({
      next: () => {
        this.mensagem = 'Produto cadastrado com sucesso.';
        this.limparFormulario();
        this.carregarProdutos();
        this.cdr.markForCheck();
      },
      error: (erro) => {
        this.mensagem =
          erro.error ?? 'Erro ao cadastrar produto.';
        this.cdr.markForCheck();
      },
    });
  }

  editar(produto: Produto): void {
    this.produtoForm = { ...produto };
    this.editando = true;
  }

  excluir(id: number): void {
    this.produtoService.excluir(id).subscribe({
      next: () => {
        this.mensagem = 'Produto excluído com sucesso.';
        this.carregarProdutos();
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagem = 'Erro ao excluir produto.';
        this.cdr.markForCheck();
      },
    });
  }

  limparFormulario(): void {
    this.produtoForm = {
      id: 0,
      codigo: '',
      descricao: '',
      saldo: 0,
    };

    this.editando = false;
  }
}
