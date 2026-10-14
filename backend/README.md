# PetShop Management API

API ASP.NET Core do sistema de gerenciamento de petshop.

## Funcionalidades

- Cadastro, listagem, edição e exclusão de pessoas/clientes
- Cadastro, listagem, edição e exclusão de animais
- Cadastro, listagem, edição e exclusão de produtos
- Persistência de dados com MySQL
- Migrations com Entity Framework Core
- Documentação com Swagger
- Dados iniciais para demonstração
- Testes manuais com `Request.http`

## Estrutura

```text
backend
├── APIs
├── Migrations
├── Models
├── Validation
├── Properties
├── BancoDeDados.cs
├── Program.cs
├── Dockerfile
├── Request.http
├── appsettings.json
├── appsettings.Development.json
├── .env.example
└── PetShopManagement.Api.csproj
```

## Requisitos

- .NET SDK 8
- MySQL 8 ou compatível
- Entity Framework CLI
- Docker, opcional para executar com Docker Compose

## Configuração local

Você pode configurar a conexão com o banco de três formas:

1. Copiando `.env.example` para `conexao.env`
2. Ajustando `ConnectionStrings:DefaultConnection` em `appsettings.Development.json`
3. Definindo a variável de ambiente `ConnectionStrings__DefaultConnection`

Exemplo de conexão local usando o MySQL do Docker exposto na porta `3307`:

```env
DB_CONNECTION=server=localhost;port=3307;database=petshopdb;user=root;password=sua_senha
```

## Executar localmente

Aplique as migrations:

```bash
dotnet ef database update
```

Execute a API:

```bash
dotnet run
```

Swagger:

```text
http://localhost:5119/swagger
```

## Testando endpoints

O arquivo `Request.http` possui exemplos de requisições para testar animais, pessoas/clientes e produtos pelo VS Code com a extensão REST Client.

## Executar com Docker

Na raiz do repositório, execute:

```bash
docker compose up --build
```

A API ficará disponível em:

```text
http://localhost:5119
```

## Dados de demonstração

Ao iniciar a aplicação, a API aplica as migrations pendentes e cria alguns dados iniciais caso o banco esteja vazio.

Isso facilita a visualização do sistema no frontend e ajuda na apresentação do projeto como portfólio.

## Observações

- O `README.md` da raiz explica o projeto completo.
- O arquivo `conexao.env` não deve ser enviado para o GitHub.
- Ao usar Docker Compose, a API acessa o banco pelo serviço `db`.
