namespace ColumnMathTutor.Domain.Entities;

public sealed class ShiftStep : Step
{
    public int FromRow { get; }
    public int ToRow { get; }
    public int ShiftAmount { get; }

    public ShiftStep(int order, int fromRow, int toRow, int shiftAmount, string explanation)
        : base(order, explanation)
    {
        FromRow = fromRow;
        ToRow = toRow;
        ShiftAmount = shiftAmount;
    }
}
