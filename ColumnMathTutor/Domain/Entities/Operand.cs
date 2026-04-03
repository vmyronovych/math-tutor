namespace ColumnMathTutor.Domain.Entities;

public sealed class Operand
{
    public string Value { get; }
    public int DecimalPlaces { get; }

    public Operand(string value, int decimalPlaces)
    {
        Value = value;
        DecimalPlaces = decimalPlaces;
    }

    public static Operand FromDecimal(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        value = value.Trim();

        int decimalIndex = value.IndexOf('.');
        if (decimalIndex == -1)
        {
            return new Operand(value.TrimStart('0') == "" ? "0" : value.TrimStart('0'), 0);
        }

        string intPart = value[..decimalIndex].TrimStart('0');
        string fracPartOriginal = value[(decimalIndex + 1)..];
        string fracPart = fracPartOriginal.TrimStart('0');

        if (intPart == "")
        {
            intPart = "0";
        }

        string combinedValue = intPart == "0" && fracPartOriginal.Length > 0
            ? fracPart
            : intPart + fracPart;

        return new Operand(combinedValue, fracPartOriginal.Length);
    }

    public string ToDecimalString()
    {
        if (DecimalPlaces == 0)
        {
            return Value;
        }

        string paddedValue = Value.PadLeft(DecimalPlaces, '0');
        string intPart = paddedValue[..^DecimalPlaces];
        string fracPart = paddedValue[^DecimalPlaces..];

        if (intPart == "")
        {
            intPart = "0";
        }

        return $"{intPart}.{fracPart.TrimEnd('0')}";
    }
}
