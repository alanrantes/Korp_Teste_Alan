namespace Estoque.Api.Models;

public class BaixaEstoqueRequest
{
    public int ProdutoId { get; set; }

    public int Quantidade { get; set; }
}