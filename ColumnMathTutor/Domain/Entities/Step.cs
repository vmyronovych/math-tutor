namespace ColumnMathTutor.Domain.Entities;

public abstract class Step
{
    public int Order { get; }
    public string Explanation { get; }

    protected Step(int order, string explanation)
    {
        Order = order;
        Explanation = explanation;
    }
}
