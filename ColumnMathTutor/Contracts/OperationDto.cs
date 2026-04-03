using System.Text.Json.Serialization;

namespace ColumnMathTutor.Contracts;

public sealed record OperandDto(
    [property: JsonPropertyName("value")] string Value,
    [property: JsonPropertyName("decimalPlaces")] int DecimalPlaces
);

public sealed record StepDto(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("order")] int Order,
    [property: JsonPropertyName("column")] int? Column,
    [property: JsonPropertyName("leftDigit")] int? LeftDigit,
    [property: JsonPropertyName("rightDigit")] int? RightDigit,
    [property: JsonPropertyName("result")] int? Result,
    [property: JsonPropertyName("carryOver")] int? CarryOver,
    [property: JsonPropertyName("fromRow")] int? FromRow,
    [property: JsonPropertyName("toRow")] int? ToRow,
    [property: JsonPropertyName("explanation")] string Explanation
);

public sealed record FinalResultDto(
    [property: JsonPropertyName("value")] string Value,
    [property: JsonPropertyName("decimalPlaces")] int DecimalPlaces,
    [property: JsonPropertyName("formatted")] string Formatted
);

public sealed record OperationDto(
    [property: JsonPropertyName("operation")] string Operation,
    [property: JsonPropertyName("operands")] List<OperandDto> Operands,
    [property: JsonPropertyName("steps")] List<StepDto> Steps,
    [property: JsonPropertyName("finalResult")] FinalResultDto FinalResult,
    [property: JsonPropertyName("hints")] List<string> Hints
);

public sealed record MathRequest(
    [property: JsonPropertyName("expression")] string Expression
);
