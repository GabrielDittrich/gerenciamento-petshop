public static class ProdutoValidator
{
    public static Dictionary<string, string[]> Validar(Produto produto)
    {
        var errors = new ValidationErrors();

        errors.Required(
            "nomeProduto",
            produto.NomeProduto,
            "Informe o nome do produto.",
            100);

        errors.Required(
            "descricao",
            produto.Descricao,
            "Informe a descrição.",
            500);

        if (produto.Preco <= 0)
        {
            errors.Add("preco", "O preço deve ser maior que zero.");
        }
        else if (produto.Preco != decimal.Round(produto.Preco, 2))
        {
            errors.Add("preco", "O preço deve ter no máximo duas casas decimais.");
        }
        else if (produto.Preco >= 100_000_000m)
        {
            errors.Add("preco", "O preço não pode ultrapassar R$ 99.999.999,99.");
        }

        return errors.ToDictionary();
    }
}
