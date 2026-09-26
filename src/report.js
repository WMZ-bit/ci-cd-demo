import { addTax, applyDiscount, round2 } from './price.js';

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export function summarize(items, options = {}) {
  const { percentOff = 0 } = options;
  if (!Array.isArray(items)) {
    throw new TypeError('items 必须是数组');
  }

  return items.map((item) => {
    if (!item || typeof item.name !== 'string' || item.name.length === 0) {
      throw new TypeError('每个商品都需要非空的 name');
    }
    if (typeof item.price !== 'number' || !Number.isFinite(item.price)) {
      throw new TypeError(`${item.name} 的 price 必须是有限数字`);
    }
    const qty = item.qty ?? 1;
    if (!Number.isInteger(qty) || qty < 1) {
      throw new RangeError(`${item.name} 的 qty 必须是不小于 1 的整数`);
    }

    const discounted = applyDiscount(item.price, percentOff);
    return {
      name: item.name,
      qty,
      unitPrice: round2(item.price),
      discounted,
      total: addTax(discounted * qty),
    };
  });
}

export function totalOf(lines) {
  if (!Array.isArray(lines)) {
    throw new TypeError('lines 必须是数组');
  }
  return round2(lines.reduce((sum, line) => sum + line.total, 0));
}

export function renderOrderHtml(lines, options = {}) {
  const { percentOff = 0, title = '订单汇总' } = options;
  const rows = lines
    .map(
      (line) => `      <tr>
        <td>${escapeHtml(line.name)}</td>
        <td class="num">${line.qty}</td>
        <td class="num">${line.discounted.toFixed(2)}</td>
        <td class="num">${line.total.toFixed(2)}</td>
      </tr>`,
    )
    .join('\n');

  return `<table>
  <caption>${escapeHtml(title)}（全场 ${percentOff}% off，含税）</caption>
  <thead>
    <tr><th>商品</th><th class="num">数量</th><th class="num">折后单价</th><th class="num">小计</th></tr>
  </thead>
  <tbody>
${rows}
  </tbody>
  <tfoot>
    <tr><th colspan="3">合计</th><th class="num">${totalOf(lines).toFixed(2)}</th></tr>
  </tfoot>
</table>`;
}
