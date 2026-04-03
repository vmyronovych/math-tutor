namespace ColumnMathTutor.Domain.Entities;

public sealed class OperationResult
{
    public IReadOnlyList<Step> Steps { get; }
    public string FinalValue { get; }
    public int DecimalPlaces { get; }

    public OperationResult(IReadOnlyList<Step> steps, string finalValue, int decimalPlaces)
    {
        Steps = steps;
        FinalValue = finalValue;
        DecimalPlaces = decimalPlaces;
    }
}
