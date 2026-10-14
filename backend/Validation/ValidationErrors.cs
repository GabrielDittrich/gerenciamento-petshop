using System.Collections.Generic;
using System.Linq;

internal sealed class ValidationErrors
{
    private readonly Dictionary<string, List<string>> _errors = new();

    public bool Required(
        string field,
        string? value,
        string message,
        int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            Add(field, message);
            return false;
        }

        if (value.Trim().Length > maxLength)
        {
            Add(field, $"O campo deve ter no máximo {maxLength} caracteres.");
        }

        return true;
    }

    public void Add(string field, string message)
    {
        if (!_errors.TryGetValue(field, out var messages))
        {
            messages = new List<string>();
            _errors[field] = messages;
        }

        messages.Add(message);
    }

    public Dictionary<string, string[]> ToDictionary()
    {
        return _errors.ToDictionary(
            item => item.Key,
            item => item.Value.ToArray());
    }
}
