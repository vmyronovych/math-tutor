using ColumnMathTutor.Domain.Entities;
using ColumnMathTutor.Domain.Enums;

namespace ColumnMathTutor.Domain.Interfaces;

public interface IOperationStrategy
{
    OperationType OperationType { get; }
    OperationResult Execute(Operand left, Operand right);
}
