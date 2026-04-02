using MathCanvasAgent.Models;
using MathCanvasAgent.Tools;

namespace MathCanvasAgent.Agent;

public class MathAgent
{
    private readonly ExpressionParser _parser = new();
    private readonly ColumnMultiplier _multiplier = new();
    private readonly CanvasRenderer _renderer = new();

    public MathSolution Solve(string input)
    {
        var parsed = _parser.Parse(input);
        var (result, steps) = _multiplier.MultiplyWithSteps(parsed.A, parsed.B);
        var scene = _renderer.Render(result, steps);

        return new MathSolution
        {
            Data = result,
            Explanations = steps,
            Scene = scene
        };
    }
}
