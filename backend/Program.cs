using DotNetEnv;
using Microsoft.EntityFrameworkCore;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), "conexao.env");

if (File.Exists(envPath))
{
    Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policyBuilder =>
    {
        policyBuilder.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString =
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION");
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Configure a conexão do banco em ConnectionStrings:DefaultConnection, " +
        "ConnectionStrings__DefaultConnection ou DB_CONNECTION.");
}

builder.Services.AddDbContext<BancoDeDados>(options =>
    options.UseMySQL(connectionString));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BancoDeDados>();

    db.Database.Migrate();

    if (!db.Pessoas.Any())
    {
        db.Pessoas.AddRange(
            new Pessoa
            {
                Nome = "Maria Oliveira",
                Telefone = "41999990000",
                Email = "maria@email.com"
            },
            new Pessoa
            {
                Nome = "João Santos",
                Telefone = "41988880000",
                Email = "joao@email.com"
            }
        );
    }

    if (!db.Animais.Any())
    {
        db.Animais.AddRange(
            new Animal
            {
                NomeAnimal = "Belinha",
                Raca = "Pinscher",
                Porte = "Pequeno"
            },
            new Animal
            {
                NomeAnimal = "Thor",
                Raca = "Golden Retriever",
                Porte = "Grande"
            }
        );
    }

    if (!db.Produtos.Any())
    {
        db.Produtos.AddRange(
            new Produto
            {
                NomeProduto = "Shampoo Antialérgico",
                Descricao = "Produto para peles sensíveis",
                Preco = 29.90m
            },
            new Produto
            {
                NomeProduto = "Ração Premium",
                Descricao = "Ração para cães adultos",
                Preco = 119.90m
            }
        );
    }

    db.SaveChanges();
}

app.UseCors("AllowSpecificOrigin");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "PetShopManagement.Api");

app.MapPessoasApi();
app.MapAnimaisApi();
app.MapProdutosApi();

app.Run();
