namespace ColumnMathTutor.Domain.Entities;

public sealed class DigitOperationStep : Step
{
    public int Column { get; }
    public int? LeftDigit { get; }
    public int? RightDigit { get; }
    public int Result { get; }
    public int? CarryOut { get; }

    public DigitOperationStep(
        int order,
        int column,
        int? leftDigit,
        int? rightDigit,
        int result,
        int? carryOut,
        string explanation)
        : base(order, explanation)
    {
        Column = column;
        LeftDigit = leftDigit;
        RightDigit = rightDigit;
        Result = result;
        CarryOut = carryOut;
    }
}
