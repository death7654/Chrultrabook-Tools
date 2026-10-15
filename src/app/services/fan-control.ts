export interface FanCurveRequest {
  requestId: string;
  name: string;
  array: number[];
}

export interface FanCurveResult {
  requestId: string;
  applied: boolean;
}

export function validCurve(array: unknown): array is number[] {
  return Array.isArray(array) && array.length >= 12 && array.every((value) =>
    Number.isInteger(value) && value >= 0 && value <= 100);
}
