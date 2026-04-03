using ColumnMathTutor.Contracts;
using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Domain.Enums;
using ColumnMathTutor.Domain.Interfaces;

namespace ColumnMathTutor.Application.Services;

public sealed class MathOrchestrator
{
    private readonly IParser _parser;
    private readonly Dictionary<OperationType, IOperationStrategy> _strategies;

    public MathOrchestrator(IParser parser, IEnumerable<IOperationStrategy> strategies)
    {
        _parser = parser;
        _strategies = strategies.ToDictionary(s => s.OperationType);
    }

    public OperationDto Process(string expression)
    {
        var parseResult = _parser.Parse(expression);

        if (!_strategies.TryGetValue(parseResult.OperationType, out var strategy))
        {
            throw new NotSupportedException($"Operation {parseResult.OperationType} is not supported");
        }

        var result = strategy.Execute(parseResult.LeftOperand, parseResult.RightOperand);

        return MapToDto(parseResult, result);
    }

    private static OperationDto MapToDto(ParseResult parseResult, OperationResult result)
    {
        string operationName = parseResult.OperationType switch
        {
            OperationType.Addition => "addition",
            OperationType.Subtraction => "subtraction",
            OperationType.Multiplication => "multiplication",
            OperationType.Division => "division",
            _ => "unknown"
        };

        var steps = result.Steps.Select(s => s switch
        {
            DigitOperationStep dos => new StepDto(
                Type: "digit_operation",
                Order: dos.Order,
                Column: dos.Column,
                LeftDigit: dos.LeftDigit,
                RightDigit: dos.RightDigit,
                Result: dos.Result,
                CarryOver: dos.CarryOut,
                FromRow: null,
                ToRow: null,
                Explanation: dos.Explanation
            ),
            CarryStep cs => new StepDto(
                Type: "carry_over",
                Order: cs.Order,
                Column: cs.Column,
                LeftDigit: null,
                RightDigit: null,
                Result: cs.Value,
                CarryOver: cs.Value,
                FromRow: null,
                ToRow: null,
                Explanation: cs.Explanation
            ),
            ShiftStep ss => new StepDto(
                Type: "shift",
                Order: ss.Order,
                Column: null,
                LeftDigit: null,
                RightDigit: null,
                Result: ss.ShiftAmount,
                CarryOver: null,
                FromRow: ss.FromRow,
                ToRow: ss.ToRow,
                Explanation: ss.Explanation
            ),
            _ => new StepDto(
                Type: "unknown",
                Order: s.Order,
                Column: null,
                LeftDigit: null,
                RightDigit: null,
                Result: null,
                CarryOver: null,
                FromRow: null,
                ToRow: null,
                Explanation: s.Explanation
            )
        }).ToList();

        var hints = GenerateHints(parseResult.OperationType, parseResult.LeftOperand, parseResult.RightOperand);

        var finalResultDto = new FinalResultDto(
            Value: result.FinalValue,
            DecimalPlaces: result.DecimalPlaces,
            Formatted: FormatFinalResult(result.FinalValue, result.DecimalPlaces)
        );

        return new OperationDto(
            Operation: operationName,
            Operands: new List<OperandDto>
            {
                new(parseResult.LeftOperand.Value, parseResult.LeftOperand.DecimalPlaces),
                new(parseResult.RightOperand.Value, parseResult.RightOperand.DecimalPlaces)
            },
            Steps: steps,
            FinalResult: finalResultDto,
            Hints: hints
        );
    }

    private static string FormatFinalResult(string value, int decimalPlaces)
    {
        if (decimalPlaces == 0)
        {
            return value;
        }

        string padded = value.PadLeft(decimalPlaces, '0');
        string intPart = padded[..^decimalPlaces];
        string fracPart = padded[^decimalPlaces..].TrimEnd('0');

        if (intPart == "")
        {
            intPart = "0";
        }

        if (fracPart == "")
        {
            return intPart;
        }

        return $"{intPart}.{fracPart}";
    }

    private static List<string> GenerateHints(OperationType operation, Operand left, Operand right)
    {
        var hints = new List<string>();

        hints.Add($"Start from the rightmost digit of the second number.");

        if (operation == OperationType.Multiplication)
        {
            hints.Add("Multiply each digit of the first number by each digit of the second number.");
            hints.Add("Add the partial products together, aligning them by place value.");
        }

        if (left.DecimalPlaces > 0 || right.DecimalPlaces > 0)
        {
            hints.Add($"The answer will have {left.DecimalPlaces + right.DecimalPlaces} decimal place(s).");
        }

        return hints;
    }
}
