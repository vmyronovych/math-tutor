using FluentAssertions;
using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Domain.Enums;
using ColumnMathTutor.Infrastructure.Parsing;

namespace ColumnMathTutor.Tests;

public class DefaultParserTests
{
    private readonly DefaultParser _parser = new();

    [Theory]
    [InlineData("12 + 34", "12", "34", OperationType.Addition)]
    [InlineData("12+34", "12", "34", OperationType.Addition)]
    [InlineData("12.5 + 3.7", "12.5", "3.7", OperationType.Addition)]
    [InlineData("0.5 + 0.3", "0.5", "0.3", OperationType.Addition)]
    [InlineData("0012 + 0034", "12", "34", OperationType.Addition)]
    public void Parse_Addition_ReturnsCorrectOperands(
        string expression, string expectedLeft, string expectedRight, OperationType expectedOp)
    {
        var result = _parser.Parse(expression);

        result.LeftOperand.ToDecimalString().Should().Be(expectedLeft);
        result.RightOperand.ToDecimalString().Should().Be(expectedRight);
        result.OperationType.Should().Be(expectedOp);
    }

    [Theory]
    [InlineData("12 - 34", OperationType.Subtraction)]
    [InlineData("12.5 - 3.7", OperationType.Subtraction)]
    public void Parse_Subtraction_ReturnsCorrectOperands(string expression, OperationType expectedOp)
    {
        var result = _parser.Parse(expression);

        result.OperationType.Should().Be(expectedOp);
    }

    [Theory]
    [InlineData("12 * 34", OperationType.Multiplication)]
    [InlineData("12 × 34", OperationType.Multiplication)]
    [InlineData("12.5 * 3.7", OperationType.Multiplication)]
    public void Parse_Multiplication_ReturnsCorrectOperands(string expression, OperationType expectedOp)
    {
        var result = _parser.Parse(expression);

        result.OperationType.Should().Be(expectedOp);
    }

    [Theory]
    [InlineData("12 / 34", OperationType.Division)]
    [InlineData("12 ÷ 34", OperationType.Division)]
    [InlineData("12.5 / 3.7", OperationType.Division)]
    public void Parse_Division_ReturnsCorrectOperands(string expression, OperationType expectedOp)
    {
        var result = _parser.Parse(expression);

        result.OperationType.Should().Be(expectedOp);
    }

    [Theory]
    [InlineData("12 + 34", "12", "34", 0, 0)]
    [InlineData("12.5 + 3.7", "125", "37", 1, 1)]
    [InlineData("1.23 + 4.56", "123", "456", 2, 2)]
    [InlineData("0.5 + 0.03", "5", "3", 1, 2)]
    public void Parse_Decimals_NormalizesCorrectly(
        string expression, string expectedLeftInt, string expectedRightInt, int expectedLeftDec, int expectedRightDec)
    {
        var result = _parser.Parse(expression);

        result.LeftOperand.Value.Should().Be(expectedLeftInt);
        result.LeftOperand.DecimalPlaces.Should().Be(expectedLeftDec);
        result.RightOperand.Value.Should().Be(expectedRightInt);
        result.RightOperand.DecimalPlaces.Should().Be(expectedRightDec);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("12 + ")]
    [InlineData(" + 34")]
    [InlineData("12 ++ 34")]
    [InlineData("12 34")]
    public void Parse_InvalidExpression_ThrowsArgumentException(string expression)
    {
        var action = () => _parser.Parse(expression);

        action.Should().Throw<ArgumentException>();
    }
}
