namespace ColumnMathTutor.Domain.Entities;

public sealed class CarryStep : Step
{
    public int Column { get; }
    public int Value { get; }

    public CarryStep(int order, int column, int value, string explanation)
        : base(order, explanation)
    {
        Column = column;
        Value = value;
    }
}
