using MathCanvasAgent.Agent;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/scene", (string expr) =>
{
    var agent = new MathAgent();
    var result = agent.Solve(expr);
    return Results.Json(result.Scene);
});

app.Run();