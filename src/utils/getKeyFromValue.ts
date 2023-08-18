/** @format */

/**
 * Gets the key from a value in an object.
 * @param {Record<string, TValueType>} object The object to search in.
 * @param {TValueType} value The value to search for.
 * @returns {string} The key of the value.
 * @example
 * ```ts
 * const obj = { a: 1, b: 2, c: 3 };
 * getKeyFromValue(obj, 2); // Returns "b"
 * getKeyFromValue(obj, 4); // Returns undefined
 * getKeyFromValue(obj, 1); // Returns "a"
 * ```
 */
export function getKeyFromValue<TValueType>(
  object: { [s: string]: TValueType },
  value: TValueType
): string {
  const key = Object.keys(object).find((key) => Object.is(object[key], value));
  if (!key)
    throw new Error("Key was not found. Please ensure key will always exist.");
  return key;
}
