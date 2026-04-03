import { Operation } from './domain/Operation.js';
import { KonvaCanvas } from './canvas/KonvaCanvas.js';
import { OperationRenderer } from './renderers/OperationRenderer.js';

const API_URL = '/api/math';

class MathTutorApp {
    constructor() {
        this.canvas = new KonvaCanvas('container');
        this.renderer = new OperationRenderer(this.canvas);
        this.currentOperation = null;
        this.currentStep = 0;
    }

    async calculate() {
        const expression = document.getElementById('expression').value.trim();
        if (!expression) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression })
            });

            if (!response.ok) {
                const error = await response.json();
                this.showError(error.error || 'An error occurred');
                return;
            }

            const dto = await response.json();
            this.currentOperation = Operation.fromDto(dto);
            this.hideError();
            this.renderer.render(this.currentOperation);
            this.updateResultInfo();
            this.currentStep = 0;
            this.showStep(0);

        } catch (e) {
            this.showError('Could not connect to server. Make sure it is running.');
        }
    }

    showError(message) {
        const el = document.getElementById('error');
        el.textContent = message;
        el.style.display = 'block';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    updateResultInfo() {
        const { operands, finalResult } = this.currentOperation;
        document.getElementById('result-info').textContent =
            `${operands[0].value} × ${operands[1].value} = ${finalResult.formatted}`;
    }

    showStep(index) {
        const digitSteps = this.currentOperation?.digitSteps || [];
        if (index >= digitSteps.length || index < 0) {
            document.getElementById('step-info').style.display = 'none';
            return;
        }

        this.currentStep = index;
        const step = digitSteps[index];
        document.getElementById('step-info').style.display = 'block';
        document.getElementById('step-explanation').textContent =
            `Step ${index + 1}: ${step.leftDigit} × ${step.rightDigit} = ${step.result}` +
            (step.carryOver ? ` (carry ${step.carryOver})` : '');
    }

    nextStep() {
        this.showStep(this.currentStep + 1);
    }

    prevStep() {
        this.showStep(this.currentStep - 1);
    }
}

const app = new MathTutorApp();

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        app.nextStep();
    } else if (e.key === 'ArrowLeft') {
        app.prevStep();
    }
});

document.getElementById('calculate-btn')?.addEventListener('click', () => app.calculate());

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.calculate());
} else {
    setTimeout(() => app.calculate(), 100);
}

window.mathTutorApp = app;

export { app };
