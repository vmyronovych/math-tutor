using ColumnMathTutor.API;
using ColumnMathTutor.Application.Services;
using ColumnMathTutor.Domain.Interfaces;
using ColumnMathTutor.Infrastructure.Operations;
using ColumnMathTutor.Infrastructure.Parsing;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IParser, DefaultParser>();
builder.Services.AddSingleton<IOperationStrategy, MultiplicationStrategy>();
builder.Services.AddSingleton<MathOrchestrator>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapMathEndpoints();

app.Run();
