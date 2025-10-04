/**
 * SERIALIZATION UTILITIES
 * 
 * Purpose:
 * Automatically serialize Prisma Decimal objects to numbers for client components.
 * Handles nested objects and arrays recursively.
 * 
 * Why:
 * Next.js can't pass Decimal objects from Server to Client Components.
 * Manual serialization is error-prone and repetitive.
 * 
 * Usage:
 * const serialized = serializeDecimals(prismaResult);
 */

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Recursively serialize all Decimal objects to numbers
 */
export function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Decimal objects - check for both instance and duck typing
  if (obj instanceof Decimal || (typeof obj === 'object' && 'constructor' in obj && obj.constructor?.name === 'Decimal')) {
    return Number(obj) as any;
  }

  // Check if it's a Decimal by looking for characteristic properties
  if (
    typeof obj === 'object' &&
    's' in obj &&
    'e' in obj &&
    'd' in obj &&
    !Array.isArray(obj) &&
    !(obj instanceof Date)
  ) {
    // This is likely a Decimal object (has sign, exponent, digits)
    return Number(obj) as any;
  }

  // Handle Date objects (keep as-is, serializable)
  if (obj instanceof Date) {
    return obj;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDecimals(item)) as any;
  }

  // Handle Objects (but not functions)
  if (typeof obj === 'object' && obj.constructor?.name === 'Object') {
    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeDecimals(obj[key]);
      }
    }
    return serialized;
  }

  // Primitive types (string, number, boolean)
  return obj;
}

/**
 * Type-safe wrapper for serializing Prisma results
 * Converts Decimal fields to numbers in the type definition
 */
export type Serialized<T> = T extends Decimal
  ? number
  : T extends Date
  ? Date
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? { [K in keyof T]: Serialized<T[K]> }
  : T;

/**
 * Serialize with type inference
 * Also ensures no functions or non-serializable objects get through
 */
export function serialize<T>(data: T): Serialized<T> {
  const serialized = serializeDecimals(data);
  
  // Double-check: Use JSON round-trip to catch any remaining non-serializable values
  // This removes functions, undefined, symbols, etc.
  try {
    return JSON.parse(JSON.stringify(serialized)) as Serialized<T>;
  } catch (error) {
    console.error('Failed to serialize data:', error);
    throw new Error('Data contains non-serializable values');
  }
}

