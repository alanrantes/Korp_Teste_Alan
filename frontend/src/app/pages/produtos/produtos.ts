import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto, ProdutoService } from '../../services/produto';

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

  constructor(private produtoService: ProdutoService) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      next: (dados) => {
        this.produtos = dados;
      },
      error: () => {
        this.mensagem = 'Erro ao carregar produtos.';
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
          },
          error: (erro) => {
            this.mensagem =
              erro.error ?? 'Erro ao atualizar produto.';
          },
        });

      return;
    }

    this.produtoService.criar(this.produtoForm).subscribe({
      next: () => {
        this.mensagem = 'Produto cadastrado com sucesso.';
        this.limparFormulario();
        this.carregarProdutos();
      },
      error: (erro) => {
        this.mensagem =
          erro.error ?? 'Erro ao cadastrar produto.';
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
      },
      error: () => {
        this.mensagem = 'Erro ao excluir produto.';
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
