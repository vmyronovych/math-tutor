using ColumnMathTutor.Application.Services;
using ColumnMathTutor.Contracts;

namespace ColumnMathTutor.API;

public static class MathEndpoints
{
    public static void MapMathEndpoints(this WebApplication app)
    {
        app.MapPost("/api/math", (MathRequest request, MathOrchestrator orchestrator) =>
        {
            try
            {
                var result = orchestrator.Process(request.Expression);
                return Results.Ok(result);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (NotSupportedException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });
    }
}
