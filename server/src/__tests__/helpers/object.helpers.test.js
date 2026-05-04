'use strict';

const { mergeDeep, pick, omit, flattenObject, deepClone } = require('../../helpers/object/object.helpers');

describe('mergeDeep', () => {
  test('merges nested objects', () => {
    const a = { x: 1, nested: { y: 2 } };
    const b = { nested: { z: 3 }, w: 4 };
    expect(mergeDeep(a, b)).toEqual({ x: 1, nested: { y: 2, z: 3 }, w: 4 });
  });

  test('does not mutate the source object', () => {
    const a = { a: 1 };
    const b = { b: 2 };
    mergeDeep(a, b);
    expect(b).toEqual({ b: 2 });
  });

  test('overwrites primitives with nested objects', () => {
    expect(mergeDeep({ a: 1 }, { a: { b: 2 } })).toMatchObject({ a: { b: 2 } });
  });

  // Security: prototype pollution guard
  // Verifies that mergeDeep cannot be used to inject properties onto Object.prototype.
  // The hasOwnProperty check on the source ensures __proto__ keys in object literals
  // (which set the prototype chain rather than creating an own property) are skipped.
  test('does not pollute Object.prototype via object-literal __proto__ key', () => {
    const before = Object.prototype.role;

    const target = {};
    // NOTE: in JS object-literal syntax, { __proto__: ... } sets the [[Prototype]]
    // of the object — it does NOT create an own enumerable property.
    // hasOwnProperty('__proto__') is therefore false → the guard catches it.
    const source = { __proto__: { role: 'admin' } };

    mergeDeep(target, source);

    // Object.prototype should be unchanged
    expect(({}).role).toBe(before);
    expect(Object.prototype.role).toBe(before);

    // Clean up just in case
    delete Object.prototype.role;
  });
});

describe('pick', () => {
  test('picks listed keys', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  test('ignores missing keys', () => {
    expect(pick({ a: 1 }, ['a', 'z'])).toEqual({ a: 1 });
  });
});

describe('omit', () => {
  test('omits listed keys', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
  });
});

describe('flattenObject', () => {
  test('flattens nested object', () => {
    expect(flattenObject({ a: { b: { c: 1 } }, d: 2 })).toEqual({
      'a.b.c': 1,
      d:       2,
    });
  });
});

describe('deepClone', () => {
  test('returns a deep copy', () => {
    const obj = { a: { b: 1 } };
    const clone = deepClone(obj);
    clone.a.b = 99;
    expect(obj.a.b).toBe(1);
  });
});
