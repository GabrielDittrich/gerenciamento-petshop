using Microsoft.EntityFrameworkCore;

public static class ProdutosApi
{

    public static void MapProdutosApi(this WebApplication app)
    {

        var group = app.MapGroup("/produtos");


        group.MapGet("/", async (BancoDeDados db) =>
            //select * from produtos
            await db.Produtos.ToListAsync()
        );

        group.MapPost("/", async (Produto produto, BancoDeDados db) =>
        {
            var errors = ProdutoValidator.Validar(produto);

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }
            db.Produtos.Add(produto);
            await db.SaveChangesAsync();

            var produtoSalvo = await db.Produtos
                .AsNoTracking()
                .FirstAsync(p => p.Id == produto.Id);

            return Results.Created($"/produtos/{produto.Id}", produtoSalvo);
        });

        group.MapPut("/{id}", async (int id, Produto produtoAlterada, BancoDeDados db) =>
        {
            //select * from produtos where id = ?
            var produto = await db.Produtos.FindAsync(id);


            if (produto is null)
            {
                return Results.NotFound();
            }

            var errors = ProdutoValidator.Validar(produtoAlterada);
            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            produto.NomeProduto = produtoAlterada.NomeProduto;
            produto.Descricao = produtoAlterada.Descricao;
            produto.Preco = produtoAlterada.Preco;

            //update....
            await db.SaveChangesAsync();

            return Results.NoContent();
        }
        );

        group.MapDelete("/{id}", async (int id, BancoDeDados db) =>
        {
            if (await db.Produtos.FindAsync(id) is Produto produto)
            {
                //Operações de exclusão
                db.Produtos.Remove(produto);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
            return Results.NotFound();
        }
        );
    }
}
