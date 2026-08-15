using Estoque.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Api.Data;

public class EstoqueDbContext : DbContext
{
    public EstoqueDbContext(DbContextOptions<EstoqueDbContext> options)
        : base(options)
    {
    }

    public DbSet<Produto> Produtos { get; set; }
}