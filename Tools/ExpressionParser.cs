using System.Text.RegularExpressions;
using MathCanvasAgent.Models;

namespace MathCanvasAgent.Tools;

public class ExpressionParser
{
    public ParsedExpression Parse(string input)
    {
        var match = Regex.Match(input, @"([\d.]+)\s*\*\s*([\d.]+)");
        return new ParsedExpression
        {
            A = decimal.Parse(match.Groups[1].Value),
            B = decimal.Parse(match.Groups[2].Value)
        };
    }
}
