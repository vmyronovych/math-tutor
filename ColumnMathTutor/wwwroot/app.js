const API_URL = '/api/math';

const COLORS = {
    background: '#ffffff',
    grid: '#e0e0e0',
    digit: '#333333',
    digitBg: '#f0f0f0',
    highlight: '#4a90d9',
    highlightBg: '#e3f2fd',
    carry: '#ff9800',
    result: '#4caf50',
    resultBg: '#e8f5e9',
    border: '#333333'
};

const CELL_SIZE = 50;
const FONT_SIZE = 24;
const SMALL_FONT = 14;

const ROW_TOP = 0;
const ROW_OP = 1;
const ROW_LINE = 2;
const ROW_RESULT = 3;

let stage = null;
let currentData = null;
let currentStep = 0;

async function calculate() {
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
            showError(error.error || 'An error occurred');
            return;
        }

        currentData = await response.json();
        hideError();
        renderOperation(currentData);
        currentStep = 0;
        showStep(currentStep);

    } catch (e) {
        showError('Could not connect to server. Make sure it is running.');
    }
}

function showError(message) {
    const el = document.getElementById('error');
    el.textContent = message;
    el.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function renderOperation(data) {
    const container = document.getElementById('container');
    container.innerHTML = '';

    const steps = data.steps.filter(s => s.type === 'digit_operation');
    
    const leftDigits = data.operands[0].value.split('');
    const rightDigits = data.operands[1].value.split('');
    const resultDigits = data.finalResult.value.split('');

    const maxDigits = Math.max(leftDigits.length, rightDigits.length, resultDigits.length);
    const numCols = maxDigits + 2;

    const width = numCols * CELL_SIZE + 80;
    const height = 4 * CELL_SIZE + 100;

    stage = new Konva.Stage({
        container: 'container',
        width: width,
        height: height
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const startX = 40;
    const topY = 30;

    drawOperands(layer, startX, topY, leftDigits, rightDigits, data.operation);
    drawResult(layer, startX, topY, resultDigits, data.finalResult.decimalPlaces);
    drawSteps(layer, startX, topY, steps, maxDigits);

    layer.draw();

    document.getElementById('result-info').textContent =
        `Result: ${data.finalResult.formatted} | Steps: ${steps.length} operations`;
}

function drawOperands(layer, startX, topY, leftDigits, rightDigits, operation) {
    const opSymbol = getOperatorSymbol(operation);
    const maxLen = Math.max(leftDigits.length, rightDigits.length);

    const rightCol = startX + (maxLen - rightDigits.length + 1) * CELL_SIZE;
    for (let i = 0; i < rightDigits.length; i++) {
        drawDigit(layer, rightCol + i * CELL_SIZE, topY + ROW_TOP * CELL_SIZE, rightDigits[i]);
    }

    drawText(layer, startX + (maxLen - leftDigits.length) * CELL_SIZE - CELL_SIZE, topY + ROW_OP * CELL_SIZE, opSymbol);

    for (let i = 0; i < leftDigits.length; i++) {
        drawDigit(layer, startX + (maxLen - leftDigits.length + 1 + i) * CELL_SIZE, topY + ROW_OP * CELL_SIZE, leftDigits[i]);
    }
}

function drawResult(layer, startX, topY, resultDigits, decimalPlaces) {
    const lineStartX = startX + CELL_SIZE;
    const lineEndX = startX + (resultDigits.length + 1) * CELL_SIZE;

    layer.add(new Konva.Line({
        points: [lineStartX, topY + ROW_LINE * CELL_SIZE + CELL_SIZE / 2,
                 lineEndX, topY + ROW_LINE * CELL_SIZE + CELL_SIZE / 2],
        stroke: COLORS.border,
        strokeWidth: 2
    }));

    const padding = 1;
    for (let i = 0; i < resultDigits.length; i++) {
        const digit = resultDigits[i];
        const col = startX + (padding + i) * CELL_SIZE;
        const row = topY + ROW_RESULT * CELL_SIZE;

        if (decimalPlaces > 0 && i === resultDigits.length - decimalPlaces) {
            drawText(layer, col - CELL_SIZE, row, '.');
        }

        drawDigit(layer, col, row, digit, 'result');
    }
}

function drawSteps(layer, startX, topY, steps, maxDigits) {
    for (const step of steps) {
        if (step.carryOver !== null) {
            const carryCol = startX + (maxDigits - step.column) * CELL_SIZE;
            drawCarry(layer, carryCol + CELL_SIZE, topY + ROW_OP * CELL_SIZE, step.carryOver);
        }
    }
}

function drawDigit(layer, x, y, digit, type = 'normal') {
    const group = new Konva.Group({ x, y });

    group.add(new Konva.Rect({
        width: CELL_SIZE,
        height: CELL_SIZE,
        fill: type === 'result' ? COLORS.resultBg : COLORS.digitBg,
        stroke: COLORS.border,
        strokeWidth: 2,
        cornerRadius: 4
    }));

    group.add(new Konva.Text({
        text: digit,
        x: 0,
        y: 0,
        width: CELL_SIZE,
        height: CELL_SIZE,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: FONT_SIZE,
        fontStyle: 'bold',
        fill: type === 'result' ? COLORS.result : COLORS.digit
    }));

    layer.add(group);
}

function drawText(layer, x, y, text, color = COLORS.digit) {
    layer.add(new Konva.Text({
        x, y,
        width: CELL_SIZE,
        height: CELL_SIZE,
        text,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: FONT_SIZE,
        fontStyle: 'bold',
        fill: color
    }));
}

function drawCarry(layer, x, y, value) {
    layer.add(new Konva.Text({
        x, y: y - 10,
        text: value.toString(),
        fontSize: SMALL_FONT,
        fontStyle: 'bold',
        fill: COLORS.carry
    }));
}

function getOperatorSymbol(op) {
    switch (op) {
        case 'multiplication': return '×';
        case 'division': return '÷';
        case 'subtraction': return '−';
        default: return '+';
    }
}

function showStep(index) {
    const steps = currentData?.steps?.filter(s => s.type === 'digit_operation') || [];
    if (index >= steps.length) {
        document.getElementById('step-info').style.display = 'none';
        return;
    }

    const step = steps[index];
    document.getElementById('step-info').style.display = 'block';
    document.getElementById('step-explanation').textContent =
        `Step ${index + 1}: ${step.leftDigit} × ${step.rightDigit} = ${step.result}` +
        (step.carryOver ? ` (carry ${step.carryOver})` : '');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        currentStep++;
        showStep(currentStep);
    } else if (e.key === 'ArrowLeft') {
        currentStep = Math.max(0, currentStep - 1);
        showStep(currentStep);
    }
});

calculate();
