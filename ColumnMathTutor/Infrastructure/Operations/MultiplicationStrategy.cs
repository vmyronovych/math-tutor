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

        string leftDigits = left.Value;
        string rightDigits = right.Value;

        var steps = new List<Step>();
        int stepOrder = 0;

        var partialProducts = new List<int[]>();
        var partialProductsShifts = new List<int>();

        for (int rightIdx = rightDigits.Length - 1; rightIdx >= 0; rightIdx--)
        {
            int rightDigit = rightDigits[rightIdx] - '0';
            var productDigits = new List<int>();

            for (int leftIdx = leftDigits.Length - 1; leftIdx >= 0; leftIdx--)
            {
                int leftDigit = leftDigits[leftIdx] - '0';
                int product = leftDigit * rightDigit;

                productDigits.Add(product);

                steps.Add(new DigitOperationStep(
                    stepOrder++,
                    leftDigits.Length - 1 - leftIdx,
                    leftDigit,
                    rightDigit,
                    product,
                    null,
                    $"{leftDigit} × {rightDigit} = {product}"));
            }

            int shift = rightDigits.Length - 1 - rightIdx;
            partialProducts.Add(productDigits.ToArray());
            partialProductsShifts.Add(shift);
        }

        int maxLen = leftDigits.Length + rightDigits.Length;
        var sumResult = new int[maxLen];

        for (int ppIdx = 0; ppIdx < partialProducts.Count; ppIdx++)
        {
            var digits = partialProducts[ppIdx];
            int shift = partialProductsShifts[ppIdx];

            for (int i = 0; i < digits.Length; i++)
            {
                sumResult[i + shift] += digits[i];
            }
        }

        for (int i = 0; i < maxLen - 1; i++)
        {
            if (sumResult[i] >= 10)
            {
                int carry = sumResult[i] / 10;
                sumResult[i] %= 10;
                sumResult[i + 1] += carry;

                steps.Add(new CarryStep(stepOrder++, i, carry, $"Carry {carry}"));
            }
        }

        while (sumResult[maxLen - 1] >= 10)
        {
            int carry = sumResult[maxLen - 1] / 10;
            sumResult[maxLen - 1] %= 10;

            if (maxLen < sumResult.Length)
            {
                sumResult[maxLen] = carry;
                maxLen++;
            }
            else
            {
                break;
            }
        }

        var finalChars = new List<char>();
        int lastNonZero = maxLen - 1;
        while (lastNonZero > 0 && sumResult[lastNonZero] == 0) lastNonZero--;

        for (int i = lastNonZero; i >= 0; i--)
        {
            finalChars.Add((char)('0' + sumResult[i]));
        }

        string finalValue = new string(finalChars.ToArray());

        steps.Add(new DigitOperationStep(
            stepOrder++,
            0,
            null,
            null,
            0,
            null,
            $"Result: {finalValue}"));

        return new OperationResult(steps, finalValue, maxDecimalPlaces);
    }
}
