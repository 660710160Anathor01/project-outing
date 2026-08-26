import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Thai phone numbers in local form: 10 digits starting with 0 (mobile),
 * or 9 digits starting with 0 (older landline).
 */
export const PHONE_REGEX = /^0\d{8,9}$/;

export const PHONE_MESSAGE =
  'must be a valid Thai phone number, e.g. 0812345678';

/**
 * Strips human separators and rewrites +66/66 prefixes to the local 0 form so
 * that "+66 81-234-5678", "(081) 234 5678" and "0812345678" all validate.
 */
export function normalizePhone(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const compact = value.replace(/[\s\-().]/g, '');

  if (compact.startsWith('+66')) {
    return `0${compact.slice(3)}`;
  }
  if (compact.startsWith('66') && compact.length === 11) {
    return `0${compact.slice(2)}`;
  }
  return compact;
}

/** Trims surrounding whitespace and collapses empty strings to undefined. */
export function trimToUndefined(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Validates that a numeric property is not greater than another numeric
 * property on the same object, e.g. `availableSeats <= totalSeats`.
 */
export function IsNotGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isNotGreaterThan',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedProperty] = args.constraints as [string];
          const related = (args.object as Record<string, unknown>)[
            relatedProperty
          ];

          // Type/presence problems are reported by the other decorators.
          if (typeof value !== 'number' || typeof related !== 'number') {
            return true;
          }
          return value <= related;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedProperty] = args.constraints as [string];
          return `${args.property} must be less than or equal to ${relatedProperty}`;
        },
      },
    });
  };
}
