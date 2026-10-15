/** Calculator error taxonomy, mirroring the messages the physical device surfaces. */

export type ErrorCode =
  | "Syntax Error"
  | "Math Error"
  | "Domain Error"
  | "Dimension Error"
  | "Variable Error"
  | "Argument Error"
  | "Range Error"
  | "Stack Error";

export class CalculatorError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? code);
    this.name = "CalculatorError";
    this.code = code;
  }
}

export const syntaxError = (message?: string): CalculatorError =>
  new CalculatorError("Syntax Error", message);

export const mathError = (message?: string): CalculatorError =>
  new CalculatorError("Math Error", message);

export const domainError = (message?: string): CalculatorError =>
  new CalculatorError("Domain Error", message);

export const dimensionError = (message?: string): CalculatorError =>
  new CalculatorError("Dimension Error", message);

export const variableError = (message?: string): CalculatorError =>
  new CalculatorError("Variable Error", message);

export const argumentError = (message?: string): CalculatorError =>
  new CalculatorError("Argument Error", message);

export function isCalculatorError(value: unknown): value is CalculatorError {
  return value instanceof CalculatorError;
}

/** Best-effort mapping from an arbitrary thrown value to a Casio-style error. */
export function toCalculatorError(error: unknown): CalculatorError {
  if (isCalculatorError(error)) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (/undefined symbol/i.test(message))
    return new CalculatorError("Variable Error", message);
  if (/dimension/i.test(message))
    return new CalculatorError("Dimension Error", message);
  if (
    /unexpected|syntax|end of expression|parenthesis|operator/i.test(message)
  ) {
    return new CalculatorError("Syntax Error", message);
  }
  if (/infinity|nan|divide|division|overflow|out of range/i.test(message)) {
    return new CalculatorError("Math Error", message);
  }
  return new CalculatorError("Math Error", message);
}
