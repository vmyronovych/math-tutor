using System.Text.RegularExpressions;
using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Domain.Enums;
using ColumnMathTutor.Domain.Interfaces;

namespace ColumnMathTutor.Infrastructure.Parsing;

public sealed partial class DefaultParser : IParser
{
    private static readonly string[] Operators = ["+", "-", "*", "×", "/", "÷"];
    private static readonly string[] MultiplicationSymbols = ["*", "×"];
    private static readonly string[] DivisionSymbols = ["/", "÷"];

    public ParseResult Parse(string expression)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(expression);

        var (leftStr, operatorStr, rightStr) = SplitExpression(expression.Trim());

        var operationType = ParseOperationType(operatorStr);

        var leftOperand = Operand.FromDecimal(leftStr);
        var rightOperand = Operand.FromDecimal(rightStr);

        return new ParseResult(leftOperand, rightOperand, operationType);
    }

    private static (string Left, string Operator, string Right) SplitExpression(string expression)
    {
        for (int i = 0; i < expression.Length; i++)
        {
            char c = expression[i];
            string op = c.ToString();

            if (c == '*' || c == '×' || c == '/' || c == '÷')
            {
                string left = expression[..i].Trim();
                string right = expression[(i + 1)..].Trim();
                ValidateParts(left, right, op);
                return (left, op, right);
            }

            if (c == '+' || c == '-')
            {
                if (i == 0)
                {
                    continue;
                }

                string left = expression[..i].Trim();
                string right = expression[(i + 1)..].Trim();
                ValidateParts(left, right, op);
                return (left, op, right);
            }
        }

        throw new ArgumentException($"Invalid expression format: {expression}", nameof(expression));
    }

    private static void ValidateParts(string left, string right, string op)
    {
        if (string.IsNullOrWhiteSpace(left))
        {
            throw new ArgumentException($"Missing left operand for operator '{op}'");
        }

        if (string.IsNullOrWhiteSpace(right))
        {
            throw new ArgumentException($"Missing right operand for operator '{op}'");
        }

        if (left.TrimStart().Length > 0 && "+-*/×÷".Contains(left.TrimStart()[0]))
        {
            throw new ArgumentException($"Invalid expression format: {left}");
        }

        if (right.TrimStart().Length > 0 && "+-*/×÷".Contains(right.TrimStart()[0]))
        {
            throw new ArgumentException($"Invalid expression format: {right}");
        }
    }

    private static OperationType ParseOperationType(string op)
    {
        return op switch
        {
            "+" => OperationType.Addition,
            "-" => OperationType.Subtraction,
            "*" or "×" => OperationType.Multiplication,
            "/" or "÷" => OperationType.Division,
            _ => throw new ArgumentException($"Unsupported operator: {op}")
        };
    }
}
