using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

public static class PessoaValidator
{
    public static string NormalizarTelefone(string? telefone)
    {
        return Regex.Replace(telefone ?? "", @"\D", "");
    }
    public static Dictionary<string, string[]> Validar(Pessoa pessoa)
    {
        var errors = new ValidationErrors();

        errors.Required("nome", pessoa.Nome, "Informe o nome.", 100);

        var telefoneInformado = errors.Required(
            "telefone",
            pessoa.Telefone,
            "Informe o telefone.",
            20);

        if (telefoneInformado)
        {
            var digits = NormalizarTelefone(pessoa.Telefone);

            if (digits.Length is not (10 or 11))
            {
                errors.Add(
                    "telefone",
                    "Informe um telefone com DDD e 10 ou 11 dígitos.");
            }
        }

        var emailInformado = errors.Required(
            "email",
            pessoa.Email,
            "Informe o e-mail.",
            254);

        if (emailInformado &&
            !new EmailAddressAttribute().IsValid(pessoa.Email))
        {
            errors.Add("email", "Informe um endereço de e-mail válido.");
        }

        return errors.ToDictionary();
    }
}
