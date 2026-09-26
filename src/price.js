export const TAX_RATE = 0.13;

function assertFiniteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} 必须是有限数字，实际收到：${String(value)}`);
  }
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function applyDiscount(price, percentOff) {
  assertFiniteNumber(price, 'price');
  assertFiniteNumber(percentOff, 'percentOff');
  if (percentOff < 0 || percentOff > 100) {
    throw new RangeError(`percentOff 必须在 0 到 100 之间，实际收到：${percentOff}`);
  }
  return round2(price * (1 - percentOff / 100));
}

export function addTax(price, rate = TAX_RATE) {
  assertFiniteNumber(price, 'price');
  assertFiniteNumber(rate, 'rate');
  return round2(price * (1 + rate));
}

export function formatCNY(amount) {
  assertFiniteNumber(amount, 'amount');
  return `¥${round2(amount).toFixed(2)}`;
}
