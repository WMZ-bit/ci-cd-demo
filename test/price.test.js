import assert from 'node:assert/strict';
import test from 'node:test';

import { addTax, applyDiscount, formatCNY, round2 } from '../src/price.js';

test('applyDiscount 按百分比打折', () => {
  assert.equal(applyDiscount(100, 10), 90);
  assert.equal(applyDiscount(259.5, 10), 233.55);
});

test('applyDiscount 边界：0% 与 100%', () => {
  assert.equal(applyDiscount(88, 0), 88);
  assert.equal(applyDiscount(88, 100), 0);
});

test('applyDiscount 拒绝越界的折扣', () => {
  assert.throws(() => applyDiscount(100, 101), RangeError);
  assert.throws(() => applyDiscount(100, -1), RangeError);
});

test('addTax 默认税率与自定义税率', () => {
  assert.equal(addTax(100), 113);
  assert.equal(addTax(100, 0.06), 106);
});

test('数值入参必须是有限数字', () => {
  assert.throws(() => applyDiscount('100', 10), TypeError);
  assert.throws(() => addTax(Number.NaN), TypeError);
});

test('round2 四舍五入到分', () => {
  assert.equal(round2(1.006), 1.01);
  assert.equal(round2(2.674), 2.67);
  // 注意：1.005 * 100 在二进制浮点里是 100.49999...，所以结果是 1 而不是 1.01
  assert.equal(round2(1.005), 1);
});

test('formatCNY 输出两位小数的人民币', () => {
  assert.equal(formatCNY(113), '¥113.00');
  assert.equal(formatCNY(233.554), '¥233.55');
});
