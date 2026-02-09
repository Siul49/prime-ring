import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDaysInMonth } from './utils.ts';

describe('getDaysInMonth', () => {
  it('should return 31 for January', () => {
    assert.equal(getDaysInMonth(2023, 0), 31);
  });

  it('should return 28 for February in a non-leap year', () => {
    assert.equal(getDaysInMonth(2023, 1), 28);
  });

  it('should return 29 for February in a leap year', () => {
    assert.equal(getDaysInMonth(2024, 1), 29);
  });

  it('should return 29 for February in a leap year (2000)', () => {
    assert.equal(getDaysInMonth(2000, 1), 29);
  });

  it('should return 28 for February in a non-leap year (1900)', () => {
    assert.equal(getDaysInMonth(1900, 1), 28);
  });

  it('should return 31 for March', () => {
    assert.equal(getDaysInMonth(2023, 2), 31);
  });

  it('should return 30 for April', () => {
    assert.equal(getDaysInMonth(2023, 3), 30);
  });

  it('should return 31 for May', () => {
    assert.equal(getDaysInMonth(2023, 4), 31);
  });

  it('should return 30 for June', () => {
    assert.equal(getDaysInMonth(2023, 5), 30);
  });

  it('should return 31 for July', () => {
    assert.equal(getDaysInMonth(2023, 6), 31);
  });

  it('should return 31 for August', () => {
    assert.equal(getDaysInMonth(2023, 7), 31);
  });

  it('should return 30 for September', () => {
    assert.equal(getDaysInMonth(2023, 8), 30);
  });

  it('should return 31 for October', () => {
    assert.equal(getDaysInMonth(2023, 9), 31);
  });

  it('should return 30 for November', () => {
    assert.equal(getDaysInMonth(2023, 10), 30);
  });

  it('should return 31 for December', () => {
    assert.equal(getDaysInMonth(2023, 11), 31);
  });

  it('should handle month overflow (next year January)', () => {
      // Month 12 is January of next year
      assert.equal(getDaysInMonth(2023, 12), 31);
  });

  it('should handle month underflow (previous year December)', () => {
      // Month -1 is December of previous year
      assert.equal(getDaysInMonth(2023, -1), 31);
  });
});
