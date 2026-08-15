using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Faturamento.Api.Models;

public class ItemNotaFiscal
{
    public int Id { get; set; }

    public int NotaFiscalId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "O produto é obrigatório.")]
    public int ProdutoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero.")]
    public int Quantidade { get; set; }

    [JsonIgnore]
    public NotaFiscal? NotaFiscal { get; set; }
}