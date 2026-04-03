using FluentAssertions;
using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Infrastructure.Operations;

namespace ColumnMathTutor.Tests;

public class MultiplicationStrategyTests
{
    private readonly MultiplicationStrategy _strategy = new();

    [Theory]
    [InlineData("12", "34", "408")]
    [InlineData("5", "7", "35")]
    [InlineData("100", "100", "10000")]
    [InlineData("123", "456", "56088")]
    public void Execute_Integers_ReturnsCorrectResult(string left, string right, string expected)
    {
        var leftOperand = Operand.FromDecimal(left);
        var rightOperand = Operand.FromDecimal(right);

        var result = _strategy.Execute(leftOperand, rightOperand);

        result.FinalValue.Should().Be(expected);
    }

    [Theory]
    [InlineData("2", "3", "6", 0)]
    [InlineData("1.2", "3", "36", 1)]
    [InlineData("1.2", "3.4", "408", 2)]
    public void Execute_Decimals_ReturnsCorrectResult(
        string left, string right, string expectedValue, int expectedDecimals)
    {
        var leftOperand = Operand.FromDecimal(left);
        var rightOperand = Operand.FromDecimal(right);

        var result = _strategy.Execute(leftOperand, rightOperand);

        result.FinalValue.Should().Be(expectedValue);
        result.DecimalPlaces.Should().Be(expectedDecimals);
    }

    [Fact]
    public void Execute_ProducesSteps()
    {
        var leftOperand = new Operand("12", 0);
        var rightOperand = new Operand("34", 0);

        var result = _strategy.Execute(leftOperand, rightOperand);

        result.Steps.Should().NotBeEmpty();
        result.Steps.Should().Contain(s => s is DigitOperationStep);
    }

    [Fact]
    public void Execute_WithCarry_IncludesCarrySteps()
    {
        var leftOperand = new Operand("9", 0);
        var rightOperand = new Operand("9", 0);

        var result = _strategy.Execute(leftOperand, rightOperand);

        result.FinalValue.Should().Be("81");
    }
}
