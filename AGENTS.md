# Repository Guidelines

## Project Structure & Module Organization
- 根组件 `App.tsx` 管理应用状态并在不同交互阶段切换屏幕；`index.tsx` 负责将应用挂载到 `index.html`。
- 所有界面组件存放在 `components/`，其中 `illustrations/` 提供分离的插画元素便于复用与按需加载。
- 业务能力集中在 `services/openRouterService.ts`，封装生成头像与四页故事书的 OpenRouter API 调用；公共类型定义于 `types.ts`。
- 静态元数据与运行配置集中在 `metadata.json` 与 `vite.config.ts`，共享别名 `@` 可引用仓库根目录。

## Build, Test, and Development Commands
- `npm install`：首次克隆后安装依赖。
- `npm run dev`：启动 Vite 开发服务器（默认 `http://localhost:3000`），支持 HMR。
- `npm run build`：生成生产构建产物，务必在提交前运行确保无编译错误。
- `npm run preview`：在本地以生产模式预览 `dist/`，用于回归验证。

## Coding Style & Naming Conventions
- 统一使用 TypeScript + React 19，遵循 Vite ESM 模式；缩进 2 个空格，行尾不加分号。
- React 组件命名使用帕斯卡命名法（如 `OnboardingScreen`），内部函数与变量使用驼峰命名。
- 使用函数式组件与 Hooks；共享逻辑提取至 `services/` 或 `components/illustrations/`，避免跨层依赖。
- 所有新增文件需包含必要的中文注释说明复杂逻辑或边界处理。

## Testing Guidelines
- 当前未引入自动化测试框架；提交功能改动时请在 PR 描述中附上手动验证步骤与关键截图。
- 如需新增自动化测试，优先选择 Vitest + React Testing Library，文件命名为 `*.test.tsx`，与被测文件同目录存放。
- 对 `services/` 层单测需模拟 OpenRouter 响应并覆盖失败分支，确保错误处理与日志路径可靠。

## Commit & Pull Request Guidelines
- 历史提交遵循 Conventional Commits（如 `feat: Initialize AI Picture Book Generator project`），请沿用 `type: subject` 模式。
- PR 描述需涵盖改动摘要、测试或验证方式、相关 Issue 链接；若涉及 UI 变更，附带前后对比截图或动图。
- 在合并前确保工作分支已通过 `npm run build`，并解决由 `vite.config.ts` 环境差异导致的冲突。

## Security & Configuration Tips
- 秘钥配置置于 `.env.local`，关键项为 `OPENROUTER_API_KEY`，可选项为 `OPENROUTER_SITE_URL` 与 `OPENROUTER_SITE_NAME`；Vite 会在构建期注入对应的 `process.env.*` 变量，切勿提交该文件。
- 本地截图与用户图片仅存储在浏览器内存中，如需持久化请先评估隐私合规后再提交设计方案。
