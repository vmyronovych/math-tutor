# PLAN.md — Column Method Math Tutor

## 1. Project Overview

**Name:** Column Method Math Tutor
**Objective:** Teach arithmetic operations (+, −, ×, ÷) using the column method with step-by-step visualization, including carries, borrows, and decimal handling.

---

## 2. Tech Stack

* **Backend:** .NET 10, ASP.NET Core Minimal APIs
* **Frontend:** JavaScript + Konva.js (Canvas rendering)

---

## 3. Goals

1. Visualize arithmetic operations clearly.
2. Make intermediate steps and decimal handling explicit.
3. Provide explanations and teaching hints.
4. Extensible to all basic operations.
5. Decoupled backend/frontend using JSON as the interface.
6. Clean, maintainable, and modular code.

---

## 4. Backend Architecture

### 4.1 Project Structure

```
/ColumnMathTutor
│
├─ /Domain
│   ├─ Entities: Operand.cs, OperationResult.cs, Step.cs, DigitOperationStep.cs, CarryStep.cs, ShiftStep.cs
│   ├─ Enums: OperationType.cs
│   ├─ Interfaces: IParser.cs, IOperationStrategy.cs
│
├─ /Application
│   └─ Services: MathOrchestrator.cs, StepGenerationContext.cs
│
├─ /Infrastructure
│   ├─ Parsing: DefaultParser.cs
│   └─ Operations: AdditionStrategy.cs, SubtractionStrategy.cs, MultiplicationStrategy.cs, DivisionStrategy.cs
│
├─ /Contracts
│   └─ OperationDto.cs
│
├─ /API
│   └─ MathEndpoints.cs
│
└─ Program.cs
```

---

### 4.2 Core Domain Models

**Operand:**

* Value stored as string integer
* DecimalPlaces indicates decimal position

**Step (abstract):**

* Order
* Explanation

**Derived Step Types:**

* DigitOperationStep (row/column, left/right digits, result, carry out)
* CarryStep (column, value)
* ShiftStep (row shift)

**OperationResult:**

* Steps: IReadOnlyList<Step>
* FinalValue: string
* DecimalPlaces: int

---

### 4.3 Strategy Pattern

* Each operation (add, subtract, multiply, divide) → separate class
* Implements `IOperationStrategy`
* Stateless, deterministic
* No switch/case
* Adding new operations must NOT modify existing classes

---

### 4.4 Parsing

* Accept expressions like `"12.3 + 4.56"` or `"1.23 * 22.567"`
* Convert decimals → integer strings + track decimalPlaces
* Validate input and reject invalid expressions

---

### 4.5 Algorithm Requirements

**Multiplication:**

* Digit-by-digit with carry
* Row shifts
* Decimal adjustment

**Addition/Subtraction:**

* Column-aligned, right-pad shorter operand
* Track carry/borrow

**Division:**

* Long division method
* Track partial dividends, multiply-back, remainder

---

## 5. API Layer

* Minimal APIs (ASP.NET Core)
* Endpoint: POST `/api/math`
* Input: expression string
* Output: OperationDto
* No business logic in API

---

## 6. DTO Contract

```json
{
  "operation": "multiplication|addition|subtraction|division",
  "operands": [
    { "value": "string", "decimalPlaces": int }
  ],
  "steps": [
    {
      "type": "row_operation|carry_over|final_sum|explanation",
      "position": int,
      "operands": ["string"],
      "multiplierDigit": int,
      "carryOver": "string",
      "result": "string",
      "explanation": "string"
    }
  ],
  "finalResult": {
    "value": "string",
    "decimalPlaces": int,
    "formatted": "string"
  },
  "hints": ["string"]
}
```

---

## 7. Frontend Architecture

* Convert DTO → Scene Model
* Scene Model → Canvas rendering using Konva.js
* Layers: digits, carries, row shifts
* Features: step highlighting, hover explanations, animations

---

## 8. Testing Strategy

* **Unit tests:** parser, operation strategies
* **Golden tests:** expected JSON outputs

---

## 9. Implementation Phases

1. **Project Structure:** Create folders, interfaces, domain models
2. **Parser:** Implement DefaultParser with unit tests
3. **Single Operation:** Implement MultiplicationStrategy with unit + golden tests
4. **API Layer:** Minimal API endpoint, mapping to DTO
5. **Frontend:** SceneBuilder + CanvasRenderer skeleton
6. **Extend Operations:** Add add, subtract, divide
7. **Final Release:** Include examples, tests, documentation

---

## 10. Extensibility Rules

**Backend:**

* New operation → new Strategy class → register in DI → add tests

**Frontend:**

* New step type → extend SceneBuilder + Renderer

---

## 11. Performance & Constraints

* No floating-point arithmetic
* Use string/integer math only
* Deterministic and minimal allocations

---

## 12. Deliverables

* Backend (.NET 10 + ASP.NET Core)
* Strategy implementations for all operations
* DTO contract and JSON examples
* Konva.js-based renderer
* Unit + golden tests
* Documentation for adding operations or rendering enhancements

---

END OF PLAN.md
