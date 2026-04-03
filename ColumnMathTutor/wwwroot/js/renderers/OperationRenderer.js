import { DigitOperationRenderer, CarryRenderer, ShiftRenderer } from './StepRenderer.js';

export class OperationRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.stepRenderers = [
            new DigitOperationRenderer(),
            new CarryRenderer(),
            new ShiftRenderer()
        ];
    }

    render(operation) {
        this.canvas.clear();
        this.canvas.init(operation);

        this.renderOperands(operation);
        this.renderOperationsLine(operation);
        this.renderPartialProducts(operation);
        this.renderAdditionLine(operation);
        this.renderResult(operation);
        // this.renderCarries(operation);

        this.canvas.commit();
    }

    renderOperands(operation) {
        const { operands, type } = operation;
        const [left, right] = operands;
        const maxDigits = Math.max(left.digitCount, right.digitCount);

        const opSymbol = this.getOperatorSymbol(type);
        const startX = this.canvas.startX;
        const topY = this.canvas.startY;

        for (let i = 0; i < left.digitCount; i++) {
            const col = maxDigits - left.digitCount + 1 + i;
            this.canvas.drawDigit(
                this.canvas.layer,
                startX + col * this.canvas.cellSize,
                topY,
                left.digits[i]
            );
        }

        for (let i = 0; i < right.digitCount; i++) {
            const col = maxDigits - right.digitCount + 1 + i;
            this.canvas.drawDigit(
                this.canvas.layer,
                startX + col * this.canvas.cellSize,
                topY + this.canvas.cellSize,
                right.digits[i]
            );
        }

        this.canvas.drawText(
            this.canvas.layer,
            startX,
            topY + this.canvas.cellSize - (this.canvas.cellSize/2),
            opSymbol
        );
    }

    renderOperationsLine(operation) {
        const { operands, finalResult } = operation;
        const right = operands[1];
        const maxDigits = Math.max(
            operands[0].digitCount,
            operands[1].digitCount,
            finalResult.digits.length
        );

        const startX = this.canvas.startX;
        const startY = 0;
        const lineRow = startY + right.digitCount * this.canvas.cellSize;

        this.canvas.drawLine(
            this.canvas.layer,
            startX + this.canvas.cellSize,
            lineRow + this.canvas.cellSize,
            startX + (maxDigits + 1) * this.canvas.cellSize,
            lineRow + this.canvas.cellSize,
            2
        );
    }

    renderPartialProducts(operation) {
        const { operands, partialProductValues } = operation;
        const left = operands[0];
        const right = operands[1];
        const maxDigits = Math.max(
            left.digitCount,
            right.digitCount,
            operation.finalResult.digits.length
        );

        const startX = this.canvas.startX;
        const startY = this.canvas.startY;

        for (let row = 0; row < partialProductValues.length; row++) {
            const ppDigits = partialProductValues[row];
            const shift = row;
            const y = startY + (row + 2) * this.canvas.cellSize;

            const rightmostCol = maxDigits - shift;
            const startCol = rightmostCol - ppDigits.length + 1;

            for (let i = 0; i < ppDigits.length; i++) {
                const x = startX + (startCol + i - 1) * this.canvas.cellSize;
                this.canvas.drawDigit(this.canvas.layer, x, y, ppDigits[i].toString(), 'partial');
            }

            if (row > 0) {
                const x = (startX + this.canvas.cellSize * (partialProductValues.length - row)) - this.canvas.cellSize;
                this.canvas.drawText(this.canvas.layer, x, y - this.canvas.cellSize, '+', 'partial');
            }
        }
    }

    renderAdditionLine(operation) {
        const { operands, finalResult } = operation;
        const right = operands[1];
        const maxDigits = Math.max(
            operands[0].digitCount,
            operands[1].digitCount,
            finalResult.digits.length
        );

        const startX = this.canvas.startX;
        const startY = this.canvas.startY;
        const lineRow = startY + (right.digitCount + 2) * this.canvas.cellSize;

        this.canvas.drawLine(
            this.canvas.layer,
            startX + this.canvas.cellSize,
            lineRow + this.canvas.cellSize / 2,
            startX + (maxDigits + 1) * this.canvas.cellSize,
            lineRow + this.canvas.cellSize / 2,
            2
        );
    }

    renderResult(operation) {
        const { operands, finalResult } = operation;
        const right = operands[1];
        const maxDigits = Math.max(
            operands[0].digitCount,
            operands[1].digitCount,
            finalResult.integerDigits.length + finalResult.fractionalDigits.length + (finalResult.needsLeadingZero ? 1 : 0)
        );

        const startX = this.canvas.startX - this.canvas.cellSize;
        const startY = this.canvas.startY;
        const lineRow = startY + (right.digitCount + 2) * this.canvas.cellSize;
        const resultRow = startY + (right.digitCount + 3) * this.canvas.cellSize;

        this.canvas.drawLine(
            this.canvas.layer,
            startX + this.canvas.cellSize,
            resultRow - this.canvas.cellSize / 2,
            startX + (maxDigits + 1) * this.canvas.cellSize,
            resultRow - this.canvas.cellSize / 2,
            3
        );

        let col = maxDigits - (finalResult.integerDigits.length + finalResult.fractionalDigits.length + (finalResult.needsLeadingZero ? 1 : 0)) + 1;

        if (finalResult.needsLeadingZero) {
            this.canvas.drawDigit(
                this.canvas.layer,
                startX + col * this.canvas.cellSize,
                resultRow,
                '0',
                'result'
            );
            col++;
        }

        for (const digit of finalResult.integerDigits) {
            this.canvas.drawDigit(
                this.canvas.layer,
                startX + col * this.canvas.cellSize,
                resultRow,
                digit,
                'result'
            );
            col++;
        }

        if (finalResult.decimalPlaces > 0) {
            // this.canvas.drawDigit(
            //     this.canvas.layer,
            //     startX + col * this.canvas.cellSize,
            //     resultRow,
            //     '.',
            //     'result'
            // );
            // col++;

            for (const digit of finalResult.fractionalDigits) {
                this.canvas.drawDigit(
                    this.canvas.layer,
                    startX + col * this.canvas.cellSize,
                    resultRow,
                    digit,
                    'result'
                );
                col++;
            }
        }
    }

    renderCarries(operation) {
        const { carrySteps, operands } = operation;
        const left = operands[0];
        const maxDigits = Math.max(left.digitCount, operation.finalResult.digits.length);

        const startX = this.canvas.startX;
        const startY = this.canvas.startY;

        for (const carry of carrySteps) {
            const x = startX + (maxDigits - carry.column + 1) * this.canvas.cellSize;
            const y = startY + 2 * this.canvas.cellSize;
            this.canvas.drawCarry(this.canvas.layer, x, y, carry.value);
        }
    }

    getOperatorSymbol(type) {
        const symbols = {
            'multiplication': '×',
            'division': '÷',
            'subtraction': '−',
            'addition': '+'
        };
        return symbols[type] || '+';
    }
}
