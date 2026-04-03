# AGENT.md — Column Method Math Tutor (DDD + Clean Architecture Rules)

## 1. Mission

Build a clean, extensible system for teaching arithmetic using the column method.
The system MUST be deterministic, testable, and follow Domain-Driven Design (DDD) principles.

---

## 2. DDD & Architecture Rules (MANDATORY)

* **Domain is central:**

  * Entities, Value Objects, Aggregates live in Domain layer
  * Domain logic is PURE (no ASP.NET, no JSON, no external libs)
* **Application layer:** orchestrates use-cases, coordinates strategies
* **Infrastructure layer:** concrete implementations (parser, operation strategies)
* **API layer:** thin endpoint only; no domain logic
* **Contracts / DTOs:** separate from Domain
* **Repositories:** if used, only for persistence or external integration, not for math logic

DO NOT mix layers.

---

## 3. Core Design Constraints

* **No floating point numbers** — use string/integer arithmetic only
* Decimal handling must be explicit (decimalPlaces)
* Domain models must NOT depend on infrastructure, API, or DTOs

---

## 4. Operation Design

* Each arithmetic operation = **DDD Aggregate Root / Domain Service**
* Must implement `IOperationStrategy`
* Stateless and deterministic
* Adding new operations must NOT require modifying existing ones
* No switch/case in orchestration

---

## 5. Domain Modeling (DDD focus)

* **Entities:** Operand, OperationResult
* **Value Objects:** Step (and derived types like DigitOperationStep, CarryStep, ShiftStep)
* **Domain Services:** MathOrchestrator, StepGenerationContext
* Steps must be strongly typed; avoid string-based type flags

---

## 6. API Rules

* Minimal API (ASP.NET Core)
* Only calls application services / orchestrator
* Returns mapped DTOs
* NO business/domain logic in API

---

## 7. DTO Rules

* Domain → DTO via mapping layer
* Never expose domain objects directly
* DTOs are strictly a contract for the frontend

---

## 8. Testing Rules

* **Unit Tests:** domain logic, parser, strategies
* **Golden Tests:** expected JSON outputs
* Domain logic must be fully testable independently of API or frontend

---

## 9. Code Quality

* Small focused classes and methods
* Clear naming
* Avoid deep nesting (>3 levels)
* Immutability where possible
* Follow SOLID principles

---

## 10. Workflow Rules

* Implement incrementally:

  1. Project structure & domain interfaces
  2. Parser
  3. Single operation (e.g., multiplication)
  4. Tests
  5. API
  6. Frontend
* Wait for confirmation before next major step

---

## 11. Forbidden Patterns

* Logic in API controllers
* Switch/case for operations
* Floating point math
* Mixing domain and DTO
* Large monolithic classes (God classes)

---

## 12. Definition of Done (DDD compliant)

A feature is complete only if:

* Domain is pure and central
* Unit tests + golden tests exist and pass
* Architecture rules strictly followed
* Extensible without modifying existing domain logic

---

END OF AGENT.md
