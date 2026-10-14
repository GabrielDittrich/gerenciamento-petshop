using Microsoft.EntityFrameworkCore;
public static class AnimaisApi
{
    public static void MapAnimaisApi(this WebApplication app)
    {
        var group = app.MapGroup("/animais");


        group.MapGet("/", async (BancoDeDados db) =>
            //select * from pessoas
            await db.Animais.ToListAsync()
        );

        group.MapPost("/", async (Animal animal, BancoDeDados db) =>
        {
            var errors = AnimalValidator.Validar(animal);

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            db.Animais.Add(animal);
            //insert into...
            await db.SaveChangesAsync();

            return Results.Created($"/animais/{animal.Id}", animal);
        }
        );

        group.MapPut("/{id}", async (int id, Animal animalAlterado, BancoDeDados db) =>
        {
            //select * from pessoas where id = ?
            var animal = await db.Animais.FindAsync(id);

            if (animal is null)
            {
                return Results.NotFound();
            }

            var errors = AnimalValidator.Validar(animalAlterado);

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            animal.NomeAnimal = animalAlterado.NomeAnimal;
            animal.Raca = animalAlterado.Raca;
            animal.Porte = animalAlterado.Porte;

            //update....
            await db.SaveChangesAsync();

            return Results.NoContent();
        }
        );

        group.MapDelete("/{id}", async (int id, BancoDeDados db) =>
        {
            if (await db.Animais.FindAsync(id) is Animal animal)
            {
                //Operações de exclusão
                db.Animais.Remove(animal);
                await db.SaveChangesAsync();
                return Results.NoContent();
            }
            return Results.NotFound();
        }
        );
    }
}
