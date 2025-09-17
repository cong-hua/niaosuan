# Codex Implementation Plan

## 1. MVP 目标
- 完成“拍照/上传 → 识别食物 → 查询嘌呤风险 → 展示判定卡片”的闭环。
- 所有敏感 API 调用放在服务端 Route Handler，避免前端暴露密钥。
- 页面遵循 PRD 样式：中心上传按钮、结果卡片三色状态、移动端底部导航。
- 为后续尿酸记录页与未来功能页预留路由和组件结构。

## 2. 技术栈与运行环境
- **框架**：Next.js 14（App Router）。
- **样式**：Tailwind CSS + PostCSS。
- **图表**：未来使用 Chart.js（本阶段可留空）。
- **识图服务**：通义千问 VL-Max（REST API）。
- **数据库**：Supabase（Postgres + Auth）。
- **部署**：Vercel，使用环境变量注入第三方密钥。

## 3. 目录结构（初始）
```
ai-gout-health-assistant/
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ page.tsx
│  ├─ api/
│  │  ├─ identify/route.ts
│  │  └─ purine/route.ts
│  ├─ records/page.tsx
│  └─ future/page.tsx
├─ components/
│  ├─ upload-button.tsx
│  ├─ result-card.tsx
│  └─ loading-overlay.tsx
├─ lib/
│  ├─ ali-vl.ts
│  ├─ supabase.ts
│  └─ constants.ts
├─ public/
├─ styles/
│  └─ tailwind.css (可选，若需拆分 layer)
├─ env.d.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ next.config.js
├─ package.json
└─ README.md
```

## 4. 功能实现细节
### 4.1 首页（`app/page.tsx`）
1. 上传按钮组件 `UploadButton`：支持点击选择和拖拽（可后续迭代）。
2. 选中文件后立即在前端生成预览（`URL.createObjectURL`）。
3. 触发 `POST /api/identify`，传入 FormData（`file` 字段）。
4. 接收食物识别结果后调用 `GET /api/purine?name=`。
5. 将结果传入 `ResultCard`，依据风险级别显示背景色与固定提示语。
6. Loading 状态使用 `LoadingOverlay` 覆盖按钮区域。
7. 移动端底部导航可以使用简单 `<nav>` 结构，PC 隐藏。

### 4.2 API 接口
- `POST /api/identify`
  - 校验 multipart/form-data 中的图片文件。
  - 调用 `lib/ali-vl.ts` 封装，向通义千问发送请求（Base64 或 buffer）。
  - 解析返回 JSON，提取主要食物名称（考虑后续多候选）。
  - 若失败，返回 502 + 错误提示文本。

- `GET /api/purine`
  - 接收 `name` 查询参数，统一转小写/去空格。
  - 调用 `lib/supabase.ts` 使用 service key 查询 `food_library`。
  - 匹配策略：先精确匹配，再尝试 `ilike` 模糊；无结果时返回 `status: "unknown"`。
  - 构造响应：`{name, purine_level, purine_mg?, suggestion}`，`suggestion` 由固定模板提供。

### 4.3 辅助库
- `lib/ali-vl.ts`
  - 导出 `identifyFood(imageBuffer: Buffer): Promise<string>`。
  - 内部创建 axios/SDK 客户端，设置 `Authorization`，默认超时 10s。
  - 如需 Base64，`imageBuffer.toString("base64")` 加 `data:` 前缀。

- `lib/supabase.ts`
  - 使用 `@supabase/supabase-js` 创建 `createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)`。
  - 提供 `getFoodRisk(name: string)`，返回 `purine_level` 与 `purine_mg`。

- `lib/constants.ts`
  - `export const PURINE_LABELS = { low: "能吃", mid: "少吃", high: "别吃" }`。
  - `export const PURINE_MESSAGES = { low: "嘌呤含量低，可放心食用。", mid: "嘌呤偏中等，建议控制摄入量并多喝水。", high: "嘌呤含量高，尽量避免，以免诱发痛风。", unknown: "数据库暂无，建议手动查询或咨询医生。" }`。

### 4.4 组件
- `UploadButton`
  - props：`onFileSelected(file: File)`。
  - Tailwind 实现渐变按钮（参考 PRD 中颜色方案）。

- `ResultCard`
  - props：`status`、`foodName`、`message`、`purineMg?`。
  - 背景色：Green / Yellow / Red / Gray。

- `LoadingOverlay`
  - 简单全屏 `div` + Spinner（Tailwind animation）或 `material-symbols`。

### 4.5 尿酸记录与未来功能（后续）
- 先保留 `records/page.tsx`、`future/page.tsx` 简易骨架，可显示 “Under Construction”。
- 等 MVP 跑通后，再加入 LocalStorage 记录与 Chart.js 折线图。

## 5. 环境变量 & 配置
- `ALIYUN_API_KEY` / `ALIYUN_APP_ID`（或对应凭证字段）。
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`（若后续前端需要读写）。
- 在 `env.d.ts` 中声明类型，方便 TypeScript 校验。

## 6. 部署要点
1. Vercel 项目连接 Git 仓库，自动构建。
2. 在 Vercel Dashboard 配置环境变量，上线前验证 `POST /api/identify` 是否可访问外部网络。
3. 若通义千问 API 需要特定地区访问，可考虑设置服务器中转或使用 Vercel Edge Functions（只在区域可行时）。

## 7. 验证流程
- 本地运行 `npm run dev`，使用示例图片上传，观察识别返回。
- Supabase 建好 `food_library` 表并导入最少数据集（例如 10 条常见食物）。
- 检查不同风险等级的 UI 呈现。
- 异常场景：网络失败 → 提示“识别失败，请稍后再试”；数据库缺失 → 显示 unknown 卡片。

## 8. 迭代方向（MVP 后）
- 登录与 Supabase Auth 集成，允许跨设备同步尿酸记录。
- Chart.js 折线图展示历史记录，并加入目标阈值线 (<6 mg/dL)。
- 多候选食物选择、手动搜索补录。
- 接入天气预警/社区等 PRD 中的延后功能。
- 优化通义千问调用（缓存、并发限制、体验提升）。
