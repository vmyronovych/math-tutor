using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Domain.Enums;
using ColumnMathTutor.Domain.Interfaces;

namespace ColumnMathTutor.Infrastructure.Operations;

public sealed class MultiplicationStrategy : IOperationStrategy
{
    public OperationType OperationType => OperationType.Multiplication;

    public OperationResult Execute(Operand left, Operand right)
    {
        int maxDecimalPlaces = left.DecimalPlaces + right.DecimalPlaces;

        string leftDigits = Reverse(left.Value);
        string rightDigits = Reverse(right.Value);

        var steps = new List<Step>();
        int stepOrder = 0;

        int resultLen = left.Value.Length + right.Value.Length;
        var result = new int[resultLen];

        for (int rightIdx = 0; rightIdx < rightDigits.Length; rightIdx++)
        {
            int rightDigit = rightDigits[rightIdx] - '0';

            for (int leftIdx = 0; leftIdx < leftDigits.Length; leftIdx++)
            {
                int leftDigit = leftDigits[leftIdx] - '0';
                int product = leftDigit * rightDigit;
                int pos = rightIdx + leftIdx;

                int currentCarry = result[pos] + product;
                int digitResult = currentCarry % 10;
                int carryOut = currentCarry / 10;

                result[pos] = digitResult;
                if (carryOut > 0)
                {
                    result[pos + 1] += carryOut;
                }

                steps.Add(new DigitOperationStep(
                    stepOrder++,
                    rightIdx,
                    leftDigit,
                    rightDigit,
                    digitResult,
                    carryOut > 0 ? carryOut : null,
                    $"{leftDigit} × {rightDigit} = {product}"));
            }
        }

        int finalCarry = result[resultLen - 1] / 10;
        result[resultLen - 1] %= 10;

        if (finalCarry > 0)
        {
            steps.Add(new CarryStep(
                stepOrder++,
                resultLen - 1,
                finalCarry,
                $"Final carry: {finalCarry}"));
        }

        var finalChars = result.Reverse().Select(d => (char)('0' + d)).ToArray();
        string finalValue = new string(finalChars).TrimStart('0');
        if (finalValue == "")
        {
            finalValue = "0";
        }

        steps.Add(new ShiftStep(
            stepOrder++,
            0,
            0,
            0,
            "Multiplication complete"));

        return new OperationResult(steps, finalValue, maxDecimalPlaces);
    }

    private static string Reverse(string s)
    {
        char[] chars = s.ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }
}
