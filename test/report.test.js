import assert from 'node:assert/strict';
import test from 'node:test';

import { escapeHtml, renderOrderHtml, summarize, totalOf } from '../src/report.js';

const ITEMS = [
  { name: '键盘', price: 399, qty: 1 },
  { name: '支架', price: 100, qty: 2 },
];

test('summarize 计算折后价与含税小计', () => {
  const lines = summarize(ITEMS, { percentOff: 10 });
  assert.equal(lines[0].discounted, 359.1);
  assert.equal(lines[0].total, 405.78);
  assert.equal(lines[1].total, 203.4); // (100 * 0.9) * 2 * 1.13
});

test('summarize 默认 qty 为 1', () => {
  const [line] = summarize([{ name: '线材', price: 50 }]);
  assert.equal(line.qty, 1);
});

test('summarize 校验入参', () => {
  assert.throws(() => summarize('不是数组'), TypeError);
  assert.throws(() => summarize([{ price: 1, qty: 1 }]), TypeError);
  assert.throws(() => summarize([{ name: 'x', price: 1, qty: 0 }], {}), RangeError);
});

test('totalOf 汇总所有小计', () => {
  const lines = summarize(ITEMS, { percentOff: 10 });
  assert.equal(totalOf(lines), 609.18); // 405.78 + 203.40
});

test('escapeHtml 转义危险字符', () => {
  assert.equal(escapeHtml('<img src=x onerror=1>'), '&lt;img src=x onerror=1&gt;');
  assert.equal(escapeHtml(`a"b'c&d`), 'a&quot;b&#39;c&amp;d');
});

test('renderOrderHtml 生成的表格包含转义后的内容', () => {
  const lines = summarize([{ name: '<script>', price: 100 }], { percentOff: 0 });
  const html = renderOrderHtml(lines);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('<table>'));
  assert.ok(html.includes('113.00'));
});
