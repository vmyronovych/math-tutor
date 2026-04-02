namespace MathCanvasAgent.Models;

public class ParsedExpression
{
    public decimal A { get; set; }
    public decimal B { get; set; }
}

public class ColumnStep
{
    public int Partial { get; set; }
    public int Shift { get; set; }
}

public class ColumnMultiplicationResult
{
    public int A { get; set; }
    public int B { get; set; }
    public List<ColumnStep> Steps { get; set; } = new();
    public int Result { get; set; }
    public int DecimalPlaces { get; set; }
}

public class DrawCommand
{
    public string Type { get; set; } = "";
    public float X { get; set; }
    public float Y { get; set; }
    public string? Text { get; set; }
}

public class CanvasScene
{
    public List<DrawCommand> Commands { get; set; } = new();
}

public class MathSolution
{
    public List<string> Explanations { get; set; } = new();
    public ColumnMultiplicationResult Data { get; set; } = new();
    public CanvasScene Scene { get; set; } = new();
}
