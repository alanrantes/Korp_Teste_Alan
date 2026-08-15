using Estoque.Api.Data;
using Estoque.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProdutosController : ControllerBase
{
    private readonly EstoqueDbContext _context;

    public ProdutosController(EstoqueDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> ListarProdutos()
    {
        var produtos = await _context.Produtos.ToListAsync();

        return Ok(produtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> BuscarProdutoPorId(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);

        if (produto is null)
        {
            return NotFound();
        }

        return Ok(produto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> AtualizarProduto(int id, Produto produto)
    {
        if (id != produto.Id)
        {
            return BadRequest("O ID informado na URL é diferente do ID do produto.");
        }

        var produtoExistente = await _context.Produtos.FindAsync(id);

        if (produtoExistente is null)
        {
            return NotFound();
        }

        var codigoJaExiste = await _context.Produtos
            .AnyAsync(p => p.Codigo == produto.Codigo && p.Id != id);

        if (codigoJaExiste)
        {
            return Conflict("Já existe outro produto cadastrado com esse código.");
        }

        produtoExistente.Codigo = produto.Codigo;
        produtoExistente.Descricao = produto.Descricao;
        produtoExistente.Saldo = produto.Saldo;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ExcluirProduto(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);

        if (produto is null)
        {
            return NotFound();
        }

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Produto>> CriarProduto(Produto produto)
    {
        var codigoJaExiste = await _context.Produtos
            .AnyAsync(p => p.Codigo == produto.Codigo);

        if (codigoJaExiste)
        {
            return Conflict("Já existe um produto cadastrado com esse código.");
        }

        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(BuscarProdutoPorId),
            new { id = produto.Id },
            produto
        );
    }
}