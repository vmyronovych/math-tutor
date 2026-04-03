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

const CELL_SIZE = 30;
const FONT_SIZE = 18;
const SMALL_FONT = 14;

export class KonvaCanvas {
    constructor(containerId) {
        this.containerId = containerId;
        this.stage = null;
        this.layer = null;
        this.cellSize = CELL_SIZE;
        this.fontSize = FONT_SIZE;
        this.startX = 60;
        this.startY = 30;
    }

    init(operation) {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '';

        const { operands, finalResult } = operation;
        const maxDigits = Math.max(
            operands[0].digitCount,
            operands[1].digitCount,
            finalResult.digits.length
        );
        const numPartialRows = operands[1].digitCount;

        const width = (maxDigits + 3) * this.cellSize + 80;
        const height = (numPartialRows + 5) * this.cellSize + 100;

        this.stage = new Konva.Stage({
            container: this.containerId,
            width: width,
            height: height
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
    }

    clear() {
        if (this.layer) {
            this.layer.destroyChildren();
        }
    }

    commit() {
        if (this.layer) {
            this.layer.draw();
        }
    }

    drawDigit(layer, x, y, digit, type = 'normal') {
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
            width: this.cellSize,
            height: this.cellSize,
            fill: bgColor,
            stroke: COLORS.border,
            strokeWidth: 1
        }));

        group.add(new Konva.Text({
            text: digit,
            x: 0,
            y: 0,
            width: this.cellSize,
            height: this.cellSize,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: this.fontSize,
            fontStyle: 'normal',
            fill: textColor
        }));

        layer.add(group);
    }

    drawText(layer, x, y, text, type = 'normal') {
        let color = COLORS.digit;
        if (type === 'result') {
            color = COLORS.result;
        } else if (type === 'partial') {
            color = COLORS.partial;
        }

        layer.add(new Konva.Text({
            x, y,
            width: this.cellSize,
            height: this.cellSize,
            text,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: this.fontSize,
            fontStyle: 'bold',
            fill: color
        }));
    }

    drawDecimal(layer, x, y) {
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        
        layer.add(new Konva.Text({
            x: centerX,
            y: centerY - this.fontSize / 2,
            text: '.',
            fontSize: this.fontSize,
            fontStyle: 'bold',
            fill: COLORS.result
        }));
    }

    drawCarry(layer, x, y, value) {
        layer.add(new Konva.Text({
            x: x + this.cellSize - 15,
            y: y - 5,
            text: value.toString(),
            fontSize: SMALL_FONT,
            fontStyle: 'bold',
            fill: COLORS.carry
        }));
    }

    drawLine(layer, x1, y1, x2, y2, strokeWidth = 1) {
        layer.add(new Konva.Line({
            points: [x1, y1, x2, y2],
            stroke: COLORS.border,
            strokeWidth: strokeWidth
        }));
    }
}
