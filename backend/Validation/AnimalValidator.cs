public static class AnimalValidator
{
    public static Dictionary<string, string[]> Validar(Animal animal)
    {
        var errors = new ValidationErrors();

        errors.Required(
            "nomeAnimal", animal.NomeAnimal, "Informe o nome do pet.", 100);

        errors.Required(
            "raca", animal.Raca, "Informe a raça.", 100);

        errors.Required(
            "porte", animal.Porte, "Informe o porte.", 50);

        return errors.ToDictionary();
    }
}
