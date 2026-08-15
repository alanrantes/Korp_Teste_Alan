using System.ComponentModel.DataAnnotations;

namespace Estoque.Api.Models;

public class Produto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O código do produto é obrigatório.")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição do produto é obrigatória.")]
    public string Descricao { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "O saldo não pode ser negativo.")]
    public int Saldo { get; set; }
}