using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Domain.Enums;

namespace ColumnMathTutor.Domain.Interfaces;

public record ParseResult(Operand LeftOperand, Operand RightOperand, OperationType OperationType);

public interface IParser
{
    ParseResult Parse(string expression);
}
