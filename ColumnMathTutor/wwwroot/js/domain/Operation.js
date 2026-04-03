export class Operand {
    constructor(value, decimalPlaces) {
        this.value = value;
        this.decimalPlaces = decimalPlaces;
        this.digits = value.split('');
    }

    static fromDto(dto) {
        return new Operand(dto.value, dto.decimalPlaces);
    }

    get digitCount() {
        return this.digits.length;
    }
}

export class DigitOperationStep {
    constructor(order, column, leftDigit, rightDigit, result, carryOver, explanation) {
        this.order = order;
        this.column = column;
        this.leftDigit = leftDigit;
        this.rightDigit = rightDigit;
        this.result = result;
        this.carryOver = carryOver;
        this.explanation = explanation;
    }

    static fromDto(dto) {
        return new DigitOperationStep(
            dto.order,
            dto.column,
            dto.leftDigit,
            dto.rightDigit,
            dto.result,
            dto.carryOver,
            dto.explanation
        );
    }

    get type() { return 'digit_operation'; }
}

export class CarryStep {
    constructor(order, column, value, explanation) {
        this.order = order;
        this.column = column;
        this.value = value;
        this.explanation = explanation;
    }

    static fromDto(dto) {
        return new CarryStep(dto.order, dto.column, dto.result, dto.explanation);
    }

    get type() { return 'carry_over'; }
}

export class ShiftStep {
    constructor(order, fromRow, toRow, shiftAmount, explanation) {
        this.order = order;
        this.fromRow = fromRow;
        this.toRow = toRow;
        this.shiftAmount = shiftAmount;
        this.explanation = explanation;
    }

    static fromDto(dto) {
        return new ShiftStep(dto.order, dto.fromRow, dto.toRow, dto.result, dto.explanation);
    }

    get type() { return 'shift'; }
}

export class Operation {
    constructor(type, operands, steps, finalResult, hints) {
        this.type = type;
        this.operands = operands;
        this.steps = steps;
        this.finalResult = finalResult;
        this.hints = hints;
    }

    static fromDto(dto) {
        const operands = dto.operands.map(o => Operand.fromDto(o));
        const steps = dto.steps.map(s => StepFactory.create(s));
        const finalResult = new FinalResult(dto.finalResult.value, dto.finalResult.decimalPlaces, dto.finalResult.formatted);
        
        return new Operation(dto.operation, operands, steps, finalResult, dto.hints);
    }

    get digitSteps() {
        return this.steps.filter(s => s instanceof DigitOperationStep);
    }

    get carrySteps() {
        return this.steps.filter(s => s instanceof CarryStep);
    }

    get partialProducts() {
        const products = [];
        const digitSteps = this.digitSteps;
        const numMultiplierDigits = this.operands[1].digitCount;
        const numMultiplicandDigits = this.operands[0].digitCount;

        for (let row = 0; row < numMultiplierDigits; row++) {
            const rowDigits = [];
            for (let col = 0; col < numMultiplicandDigits; col++) {
                const idx = row * numMultiplicandDigits + col;
                if (idx < digitSteps.length) {
                    rowDigits.push(digitSteps[idx]);
                }
            }
            rowDigits.reverse();
            products.push(rowDigits);
        }
        return products;
    }

    get partialProductValues() {
        return this.partialProducts.map(row => row.map(s => s.result));
    }
}

export class FinalResult {
    constructor(value, decimalPlaces, formatted) {
        this.value = value;
        this.decimalPlaces = decimalPlaces;
        this.formatted = formatted;
        this.digits = value.split('');
    }

    get integerDigits() {
        if (this.decimalPlaces === 0) {
            return this.digits;
        }
        return this.digits.slice(0, -this.decimalPlaces);
    }

    get fractionalDigits() {
        if (this.decimalPlaces === 0) {
            return [];
        }
        return this.digits.slice(-this.decimalPlaces);
    }

    get needsLeadingZero() {
        return this.decimalPlaces > 0 && this.integerDigits.length === 0;
    }
}

class StepFactory {
    static create(dto) {
        switch (dto.type) {
            case 'digit_operation':
                return DigitOperationStep.fromDto(dto);
            case 'carry_over':
                return CarryStep.fromDto(dto);
            case 'shift':
                return ShiftStep.fromDto(dto);
            default:
                throw new Error(`Unknown step type: ${dto.type}`);
        }
    }
}

export { StepFactory as StepFactory };
