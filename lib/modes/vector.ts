import { dimensionError, mathError } from "@/lib/engine";

export type Vector = number[];

function checkSameSize(a: Vector, b: Vector): void {
  if (a.length !== b.length)
    throw dimensionError("Vector dimensions do not match");
}

export function vAdd(a: Vector, b: Vector): Vector {
  checkSameSize(a, b);
  return a.map((value, index) => value + b[index]!);
}

export function vSub(a: Vector, b: Vector): Vector {
  checkSameSize(a, b);
  return a.map((value, index) => value - b[index]!);
}

export function dot(a: Vector, b: Vector): number {
  checkSameSize(a, b);
  return a.reduce((sum, value, index) => sum + value * b[index]!, 0);
}

export function cross(a: Vector, b: Vector): Vector {
  if (a.length !== 3 || b.length !== 3)
    throw dimensionError("Cross product requires 3D vectors");
  return [
    a[1]! * b[2]! - a[2]! * b[1]!,
    a[2]! * b[0]! - a[0]! * b[2]!,
    a[0]! * b[1]! - a[1]! * b[0]!,
  ];
}

export function magnitude(a: Vector): number {
  return Math.hypot(...a);
}

/** Angle between two vectors, in radians. */
export function angleBetween(a: Vector, b: Vector): number {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) throw mathError("Angle is undefined for a zero vector");
  const cosine = Math.min(1, Math.max(-1, dot(a, b) / denom));
  return Math.acos(cosine);
}

export function unitVector(a: Vector): Vector {
  const mag = magnitude(a);
  if (mag === 0) throw mathError("Cannot normalise a zero vector");
  return a.map((value) => value / mag);
}

export function isVector(value: number[] | undefined): value is Vector {
  return Array.isArray(value) && value.length > 0;
}
