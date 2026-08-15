using System.Net;
using System.Net.Http.Json;
using Faturamento.Api.Data;
using Faturamento.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Faturamento.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasFiscaisController : ControllerBase
{
    private readonly FaturamentoDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public NotasFiscaisController(
        FaturamentoDbContext context,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotaFiscal>>> ListarNotas()
    {
        var notas = await _context.NotasFiscais
            .Include(n => n.Itens)
            .ToListAsync();

        return Ok(notas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NotaFiscal>> BuscarNotaPorId(int id)
    {
        var nota = await _context.NotasFiscais
            .Include(n => n.Itens)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (nota is null)
        {
            return NotFound();
        }

        return Ok(nota);
    }

    [HttpPost]
    public async Task<ActionResult<NotaFiscal>> CriarNota(NotaFiscal nota)
    {
        if (nota.Itens is null || nota.Itens.Count == 0)
        {
            return BadRequest("A nota fiscal deve possuir pelo menos um item.");
        }

        var client = _httpClientFactory.CreateClient("EstoqueApi");

        try
        {
            foreach (var item in nota.Itens)
            {
                var response = await client.GetAsync($"api/Produtos/{item.ProdutoId}");

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return BadRequest($"O produto de ID {item.ProdutoId} não existe.");
                }

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(
                        StatusCodes.Status503ServiceUnavailable,
                        "Não foi possível validar os produtos no serviço de estoque."
                    );
                }
            }
        }
        catch (HttpRequestException)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "O serviço de estoque está indisponível no momento. Tente novamente mais tarde."
            );
        }

        nota.Numero = await _context.NotasFiscais.AnyAsync()
            ? await _context.NotasFiscais.MaxAsync(n => n.Numero) + 1
            : 1;

        nota.Status = "Aberta";
        nota.DataCriacao = DateTime.Now;

        _context.NotasFiscais.Add(nota);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(BuscarNotaPorId),
            new { id = nota.Id },
            nota
        );
    }

    [HttpPost("{id}/fechar")]
    public async Task<IActionResult> FecharNota(int id)
    {
        var nota = await _context.NotasFiscais
            .Include(n => n.Itens)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (nota is null)
        {
            return NotFound("Nota fiscal não encontrada.");
        }

        if (nota.Status != "Aberta")
        {
            return Conflict("Somente notas com status Aberta podem ser fechadas.");
        }

        var client = _httpClientFactory.CreateClient("EstoqueApi");

        try
        {
            foreach (var item in nota.Itens)
            {
                var request = new BaixaEstoqueRequest
                {
                    ProdutoId = item.ProdutoId,
                    Quantidade = item.Quantidade
                };

                var response = await client.PostAsJsonAsync(
                    "api/Produtos/baixar-estoque",
                    request
                );

                if (!response.IsSuccessStatusCode)
                {
                    var erro = await response.Content.ReadAsStringAsync();

                    return StatusCode(
                        (int)response.StatusCode,
                        $"Erro ao atualizar estoque: {erro}"
                    );
                }
            }
        }
        catch (HttpRequestException)
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "O serviço de estoque está indisponível no momento. A nota permanece aberta."
            );
        }

        nota.Status = "Fechada";

        await _context.SaveChangesAsync();

        return Ok(nota);
    }
}