using Microsoft.EntityFrameworkCore;

public static class PessoasApi
{

    public static void MapPessoasApi(this WebApplication app)
    {

        var group = app.MapGroup("/pessoas");

        group.MapGet("/", async (BancoDeDados db) =>
            //select * from pessoas
            await db.Pessoas.ToListAsync()
        );

        group.MapPost("/", async (Pessoa pessoa, BancoDeDados db) =>
        {
            var errors = PessoaValidator.Validar(pessoa);

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }
            pessoa.Telefone = PessoaValidator.NormalizarTelefone(pessoa.Telefone);

            db.Pessoas.Add(pessoa);

            //insert into...
            await db.SaveChangesAsync();

            return Results.Created($"/pessoas/{pessoa.Id}", pessoa);
        }
        );

        group.MapPut("/{id}", async (int id, Pessoa pessoaAlterada, BancoDeDados db) =>
        {
            //select * from pessoas where id = ?
            var pessoa = await db.Pessoas.FindAsync(id);
            if (pessoa is null)
            {
                return Results.NotFound();
            }

            var errors = PessoaValidator.Validar(pessoaAlterada);

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            pessoa.Nome = pessoaAlterada.Nome;
            pessoa.Telefone = PessoaValidator.NormalizarTelefone(pessoaAlterada.Telefone);
            pessoa.Email = pessoaAlterada.Email;

            //update....
            await db.SaveChangesAsync();

            return Results.NoContent();
        }
        );

        group.MapDelete("/{id}", async (int id, BancoDeDados db) =>
        {
            if (await db.Pessoas.FindAsync(id) is Pessoa pessoa)
            {
                //Operações de exclusão
                db.Pessoas.Remove(pessoa);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
            return Results.NotFound();
        }
        );
    }
}
