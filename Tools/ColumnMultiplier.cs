using MathCanvasAgent.Models;

namespace MathCanvasAgent.Tools;

public class ColumnMultiplier
{
    public (ColumnMultiplicationResult, List<string>) MultiplyWithSteps(decimal a, decimal b)
    {
        var steps = new List<string>();

        int decA = GetDecimals(a);
        int decB = GetDecimals(b);

        int intA = (int)(a * (decimal)Math.Pow(10, decA));
        int intB = (int)(b * (decimal)Math.Pow(10, decB));

        steps.Add($"{a} -> {intA}");
        steps.Add($"{b} -> {intB}");

        var result = new ColumnMultiplicationResult
        {
            A = intA,
            B = intB,
            DecimalPlaces = decA + decB
        };

        var digits = intB.ToString().Reverse().ToArray();

        for (int i = 0; i < digits.Length; i++)
        {
            int d = int.Parse(digits[i].ToString());
            int partial = intA * d;

            result.Steps.Add(new ColumnStep { Partial = partial, Shift = i });
            steps.Add($"{intA} * {d} = {partial}");
        }

        result.Result = intA * intB;
        steps.Add($"Result = {result.Result}");

        return (result, steps);
    }

    private int GetDecimals(decimal d)
    {
        var s = d.ToString();
        return s.Contains('.') ? s.Length - s.IndexOf('.') - 1 : 0;
    }
}
