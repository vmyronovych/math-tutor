export class StepRenderer {
    render(context, step) {
        throw new Error('render() must be implemented');
    }

    canRender(step) {
        return false;
    }
}

export class DigitOperationRenderer extends StepRenderer {
    canRender(step) {
        return step.type === 'digit_operation';
    }

    render(context, step) {
        const { layer, x, y, cellSize } = context;

        context.canvas.drawDigit(layer, x, y, step.result.toString(), 'partial');

        if (step.carryOver !== null) {
            context.canvas.drawCarry(layer, x + cellSize, y - 15, step.carryOver);
        }
    }
}

export class CarryRenderer extends StepRenderer {
    canRender(step) {
        return step.type === 'carry_over';
    }

    render(context, step) {
        const { layer, x, y } = context;
        context.canvas.drawCarry(layer, x, y, step.value);
    }
}

export class ShiftRenderer extends StepRenderer {
    canRender(step) {
        return step.type === 'shift';
    }

    render(context, step) {
        // Shift steps are informational, visual rendering handled by layout
    }
}
