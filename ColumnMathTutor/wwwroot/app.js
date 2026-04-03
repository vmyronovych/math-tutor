const API_URL = '/api/math';

const COLORS = {
    digit: '#333333',
    digitBg: '#f0f0f0',
    carry: '#ff9800',
    result: '#4caf50',
    resultBg: '#e8f5e9',
    partial: '#9c27b0',
    partialBg: '#f3e5f5',
    border: '#333333'
};

const CELL_SIZE = 50;
const FONT_SIZE = 24;

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

    const leftDigits = data.operands[0].value.split('');
    const rightDigits = data.operands[1].value.split('');
    const resultDigits = data.finalResult.value.split('');

    const numPartialRows = rightDigits.length;
    const maxDigits = Math.max(leftDigits.length, rightDigits.length, resultDigits.length);
    const numCols = maxDigits + 2;

    const width = numCols * CELL_SIZE + 80;
    const height = (numPartialRows + 5) * CELL_SIZE + 100;

    stage = new Konva.Stage({
        container: 'container',
        width: width,
        height: height
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const startX = 60;
    const startY = 30;

    drawOperands(layer, startX, startY, leftDigits, rightDigits, maxDigits, data.operation);

    drawPartialProducts(layer, startX, startY, leftDigits, rightDigits, maxDigits);

    drawAdditionLine(layer, startX, startY, numPartialRows);

    drawResult(layer, startX, startY, resultDigits, data.finalResult.decimalPlaces, maxDigits, rightDigits.length);

    layer.draw();

    document.getElementById('result-info').textContent =
        `${leftDigits.join('')} × ${rightDigits.join('')} = ${data.finalResult.formatted}`;
}

function drawOperands(layer, startX, startY, leftDigits, rightDigits, maxDigits, operation) {
    const opSymbol = getOperatorSymbol(operation);

    for (let i = 0; i < leftDigits.length; i++) {
        const col = maxDigits - leftDigits.length + 1 + i;
        drawDigit(layer, startX + col * CELL_SIZE, startY, leftDigits[i]);
    }

    drawText(layer, startX + (maxDigits - rightDigits.length) * CELL_SIZE, startY + CELL_SIZE, opSymbol);

    for (let i = 0; i < rightDigits.length; i++) {
        const col = maxDigits - rightDigits.length + 1 + i;
        drawDigit(layer, startX + col * CELL_SIZE, startY + CELL_SIZE, rightDigits[i]);
    }
}

function drawPartialProducts(layer, startX, startY, leftDigits, rightDigits, maxDigits) {
    const digitSteps = currentData.steps.filter(s => s.type === 'digit_operation' && s.leftDigit !== null);

    for (let ppRow = 0; ppRow < rightDigits.length; ppRow++) {
        const shift = ppRow;
        const row = startY + (ppRow + 2) * CELL_SIZE;

        const rowDigits = [];
        for (let i = 0; i < leftDigits.length; i++) {
            const stepIdx = ppRow * leftDigits.length + i;
            if (stepIdx < digitSteps.length) {
                rowDigits.push(digitSteps[stepIdx].result);
            }
        }

        rowDigits.reverse();

        const rightmostCol = maxDigits - ppRow;
        const startCol = rightmostCol - rowDigits.length + 1;

        for (let i = 0; i < rowDigits.length; i++) {
            const col = startCol + i;
            drawDigit(layer, startX + col * CELL_SIZE, row, rowDigits[i].toString(), 'partial');
        }

        if (ppRow > 0) {
            drawText(layer, startX, row, '+', COLORS.partial);
        }
    }
}

function drawAdditionLine(layer, startX, startY, numPartialRows) {
    const lineRow = startY + (numPartialRows + 2) * CELL_SIZE;

    layer.add(new Konva.Line({
        points: [
            startX + CELL_SIZE, lineRow + CELL_SIZE / 2,
            startX + (numPartialRows + 3) * CELL_SIZE, lineRow + CELL_SIZE / 2
        ],
        stroke: COLORS.border,
        strokeWidth: 2
    }));
}

function drawResult(layer, startX, startY, resultDigits, decimalPlaces, maxDigits, numPartialRows) {
    const lineRow = startY + (numPartialRows + 2) * CELL_SIZE;
    const resultRow = startY + (numPartialRows + 3) * CELL_SIZE;

    layer.add(new Konva.Line({
        points: [
            startX + CELL_SIZE, lineRow + CELL_SIZE / 2,
            startX + (maxDigits + 1) * CELL_SIZE, lineRow + CELL_SIZE / 2
        ],
        stroke: COLORS.border,
        strokeWidth: 3
    }));

    for (let i = 0; i < resultDigits.length; i++) {
        const col = maxDigits - resultDigits.length + 1 + i;

        if (decimalPlaces > 0 && i === resultDigits.length - decimalPlaces) {
            drawText(layer, startX + (col - 1) * CELL_SIZE, resultRow, '.');
        }

        drawDigit(layer, startX + col * CELL_SIZE, resultRow, resultDigits[i], 'result');
    }
}

function drawDigit(layer, x, y, digit, type = 'normal') {
    let bgColor = COLORS.digitBg;
    let textColor = COLORS.digit;

    if (type === 'result') {
        bgColor = COLORS.resultBg;
        textColor = COLORS.result;
    } else if (type === 'partial') {
        bgColor = COLORS.partialBg;
        textColor = COLORS.partial;
    }

    const group = new Konva.Group({ x, y });

    group.add(new Konva.Rect({
        width: CELL_SIZE,
        height: CELL_SIZE,
        fill: bgColor,
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
        fill: textColor
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

function getOperatorSymbol(op) {
    switch (op) {
        case 'multiplication': return '×';
        case 'division': return '÷';
        case 'subtraction': return '−';
        default: return '+';
    }
}

function showStep(index) {
    const digitSteps = currentData?.steps?.filter(s => s.type === 'digit_operation' && s.leftDigit !== null) || [];
    if (index >= digitSteps.length) {
        document.getElementById('step-info').style.display = 'none';
        return;
    }

    const step = digitSteps[index];
    document.getElementById('step-info').style.display = 'block';
    document.getElementById('step-explanation').textContent =
        `Step ${index + 1}: ${step.leftDigit} × ${step.rightDigit} = ${step.result}`;
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calculate);
} else {
    setTimeout(calculate, 100);
}
