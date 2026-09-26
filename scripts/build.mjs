import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderOrderHtml, summarize } from '../src/report.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = resolve(root, 'dist');

const ITEMS = [
  { name: '机械键盘', price: 399, qty: 1 },
  { name: '显示器支架', price: 259.5, qty: 2 },
  { name: 'USB-C 扩展坞', price: 189, qty: 1 },
];

const PERCENT_OFF = 20;

const lines = summarize(ITEMS, { percentOff: PERCENT_OFF });
const table = renderOrderHtml(lines, { percentOff: PERCENT_OFF, title: '示例订单' });
const builtAt = new Date().toISOString();

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CI/CD 示例站点</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      padding: 48px 24px;
      font-family: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
      color: #2c2c2a;
      background: #faf9f5;
      line-height: 1.6;
    }
    main { max-width: 760px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 500; margin: 0 0 8px; }
    p.sub { color: #5f5e5a; font-size: 13px; margin: 0 0 28px; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.15);
      border-radius: 12px;
      overflow: hidden;
      font-size: 14px;
    }
    caption { text-align: left; padding: 14px 16px; color: #5f5e5a; font-size: 13px; }
    th, td { padding: 10px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.08); }
    thead th { background: #f1efe8; font-weight: 500; text-align: left; }
    tbody tr:last-child td, tfoot th { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    tfoot th { background: #f1efe8; font-weight: 500; }
    footer { margin-top: 20px; color: #888780; font-size: 12px; }
    code { font-family: ui-monospace, Consolas, monospace; }
  </style>
</head>
<body>
  <main>
    <h1>CI/CD 示例站点</h1>
    <p class="sub">这个页面由 GitHub Actions 自动构建并部署，你看到的每一次更新都来自一次 <code>git push</code>。</p>
${table}
    <footer>构建时间：${builtAt}</footer>
  </main>
</body>
</html>
`;

await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'index.html'), html, 'utf8');
console.log(`构建完成：dist/index.html（${lines.length} 行订单，${PERCENT_OFF}% off）`);
