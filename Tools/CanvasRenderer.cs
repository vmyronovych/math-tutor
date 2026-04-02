using MathCanvasAgent.Models;

namespace MathCanvasAgent.Tools;

public class CanvasRenderer
{
    public CanvasScene Render(ColumnMultiplicationResult result, List<string> explanations)
    {
        var scene = new CanvasScene();

        float x = 50;
        float y = 50;
        float dy = 30;

        scene.Commands.Add(new DrawCommand { Type = "text", X = x, Y = y, Text = result.A.ToString() });
        scene.Commands.Add(new DrawCommand { Type = "text", X = x, Y = y + dy, Text = "x " + result.B });

        int i = 0;
        foreach (var step in result.Steps)
        {
            scene.Commands.Add(new DrawCommand
            {
                Type = "text",
                X = x + step.Shift * 20,
                Y = y + dy * (2 + i),
                Text = step.Partial.ToString()
            });
            i++;
        }

        scene.Commands.Add(new DrawCommand
        {
            Type = "text",
            X = x,
            Y = y + dy * (3 + i),
            Text = result.Result.ToString()
        });

        return scene;
    }
}
