# CI/CD 示例项目

一个**零第三方依赖**的 Node.js 小项目，用来演示 GitHub Actions 的完整流水线：
**push 代码 → 自动测试 → 自动构建 → 自动部署到 GitHub Pages**。

零依赖是有意为之：CI 里不用下载几百个包，一条流水线几十秒跑完，方便你观察每一步。

## 目录结构

```
.
├── .github/workflows/
│   ├── ci.yml          # 构建 + 测试（PR 和 push 都触发）
│   └── deploy.yml      # 部署到 GitHub Pages（只有 main 分支触发）
├── scripts/build.mjs   # 构建脚本：生成 dist/index.html
├── src/
│   ├── price.js        # 打折、加税、金额格式化
│   └── report.js       # 订单汇总 + HTML 渲染
├── test/
│   ├── price.test.js
│   └── report.test.js
├── package.json
└── package-lock.json   # CI 的 npm ci 和依赖缓存都依赖它，必须提交
```

## 本地运行

```bash
npm ci          # 按 lockfile 安装依赖
npm test        # 跑 13 个测试
npm run build   # 生成 dist/index.html
```

打开 `dist/index.html` 就能看到构建出来的页面。

## 让流水线跑起来：三步

1. **建仓库并推送**

   ```bash
   git init
   git add .
   git commit -m "初始化 CI/CD 示例"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

2. **开启 GitHub Pages**
   仓库页面 → `Settings` → `Pages` → **Source 选 `GitHub Actions`**（不是 "Deploy from a branch"）。
   这一项没改的话，deploy 任务会成功但访问不到页面。

3. **看结果**
   仓库页面 → `Actions` 标签页。你会看到两条工作流：
   - `CI`：在 Node 20 和 22 上各跑一遍测试，然后构建并上传产物
   - `部署到 GitHub Pages`：测试 + 构建 + 发布，完成后 `github-pages` 环境卡片上会给出访问链接

之后你每次改代码 push 到 `main`，页面都会自动更新。想验证的话，改一下 `scripts/build.mjs` 里的 `PERCENT_OFF`，提交后看页面数字变没变。

## 两条流水线的分工

| | `ci.yml` | `deploy.yml` |
|---|---|---|
| 触发 | push / PR / 手动 | 仅 main 分支 push / 手动 |
| 作用 | 验证代码没写坏 | 把产物发到线上 |
| 测试 | Node 20、22 双版本矩阵 | 跑一遍 |
| 部署 | 不部署 | 部署到 Pages |

`deploy.yml` 里又跑了一次测试，这是刻意的：**部署前的最后一道防线**，防止有人直接给 main 推了坏代码。

## 几个容易踩的坑

- **`cache: npm` 需要 `package-lock.json`**，锁文件没提交的话这一步会报错
- **`npm ci` 比 `npm install` 更适合 CI**：严格按锁文件装，装出来的一定和本地一致
- **`permissions` 和 `concurrency` 别删**：前者是最小权限，后者防止重复 push 时多个部署任务打架
- **PR 不会部署**：这是设计如此，避免别人提个 PR 就把线上改了

## 想换成自己的项目

- 换语言：改 `actions/setup-node` 为对应的 `setup-python` / `setup-java`，构建和测试命令一并替换
- 换部署目标：把 `deploy.yml` 的 deploy job 换成你的方式（传对象存储、SSH 到服务器、推 Docker 镜像等），私钥一律存到 `Settings → Secrets and variables → Actions`，别写进代码
