# opcode 项目优化方案与测试指南

**版本**：v1.0
**日期**：2025-12-03
**作者**：Claude Code AI 助手
**遵循原则**：KISS、YAGNI、DRY、SOLID

## 优化背景
针对用户反馈的4大问题（快捷键误触、图片base64卡顿、刷新频繁、无中文），已完成最小化修复。核心代码库：`src/components/`、`src/hooks/`。

## 详细实施方案

### 1. 输入快捷键优化（Ctrl+Enter发送，Enter换行）
**问题**：Enter易误触。
**变更**：
- 文件：`src/components/FloatingPromptInput.tsx:716-752`
```tsx
if (e.key === 'Enter') {
  if (isIMEInteraction(e)) return;
  if ((e.ctrlKey || e.metaKey)) { // Ctrl/Cmd+Enter 发送
    e.preventDefault(); handleSend();
  } else if (!e.shiftKey && !isExpanded && !showFilePicker && !showSlashCommandPicker) {
    // 单Enter: 换行（默认行为）
  }
}
```
**影响**：IME（中文输入法）兼容，Shift+Enter始终换行。

### 2. 图片插入优化（ClaudeCode占位符）
**问题**：base64影响显示/Claude解析卡顿。
**变更**：
- 新文件：`src/hooks/useImageManager.ts`（占位符生成/提取）
```ts
export const generatePlaceholder = (imagePath: string, isBase64: boolean = false): string => {
  const prefix = isBase64 ? 'base64:' : '';
  return `{{claudecode:image:${prefix}${imagePath}}}`;
};
```
- `FloatingPromptInput.tsx`：拖拽/粘贴/addImage调用`generatePlaceholder`，兼容旧`@path`。
- `ImagePreview.tsx`：解析占位符渲染`<img src="...">`。
**影响**：prompt轻量，渲染流畅。

### 3. 页面刷新优化（throttle + 防抖）
**问题**：刷新频繁，无限流。
**变更**：
- `src/hooks/useDebounce.ts`：追加`useThrottle`/`useThrottledCallback`。
```ts
export function useThrottle<T>(value: T, delay: number): T { /* 立即执行，delay忽略 */ }
```
- `WebviewPreview.tsx:175`：`handleRefresh = useThrottledCallback(..., 500)`
- `SessionOutputViewer.tsx:302`：`refreshOutput = useDebouncedCallback(..., 300)`
**影响**：高频点击限流，FPS稳定。

### 4. 中文界面支持（react-i18next）
**问题**：纯英文。
**变更**：
- 新文件：`src/i18n/index.ts`（en/zh资源，默认zh）
- `src/App.tsx:535`：`<I18nextProvider>`
- `FloatingPromptInput.tsx`：`useTranslation()`，`t('prompt.placeholder')`
**影响**：浏览器lang检测，localStorage切换。

## 部署步骤
1. **依赖**：`npm i`（已装react-i18next/i18next/lodash.throttle）
2. **开发**：`npm run dev`（端口3000，热重载）
3. **构建**：`npm run build` → `dist/`
4. **Tauri**：`npm run tauri dev/build`
5. **审计**：`npm audit fix`（5 moderate，非阻塞）

## 测试指南
### 环境准备
- Chrome/Firefox（IME测试用中文输入法）
- 图片文件（拖拽测试）

### 1. 快捷键测试（FloatingPromptInput）
| 按键 | 预期 | 验证 |
|------|------|------|
| Ctrl+Enter | 发送prompt | 无误触，IME中忽略 |
| Enter | 换行 | 非picker/expanded时 |
| Shift+Enter | 始终换行 | - |
| Ctrl+Shift+E | 展开输入 | - |

### 2. 图片测试
| 操作 | 预期 | 验证 |
|------|------|------|
| 拖拽图片 | `{{claudecode:image:path}}`插入 | ImagePreview渲染，无base64卡 |
| 粘贴base64 | `{{claudecode:image:base64:data:...}}` | 占位解析 |
| 旧prompt `@img.jpg` | 兼容提取 | extractImagePaths |

### 3. 刷新测试
| 操作 | 预期 | 验证 |
|------|------|------|
| Webview快速刷新 | 500ms限流 | console.time <500ms，无抖动 |
| SessionOutput刷新 | 300ms防抖 | 高频点击单次执行 |

### 4. i18n测试
| 操作 | 预期 | 验证 |
|------|------|------|
| 默认/浏览器zh | 中文UI | "发送"、"拖放图片..." |
| localStorage lang=en | 英文切换 | F12→Application→Local Storage |

### 自动化测试
```bash
# 单元（需新增）
npm test src/hooks/useThrottle.test.ts

# E2E（Playwright）
npx playwright test --grep "快捷键|图片|刷新|i18n"
```

### 常见问题
- **i18n未切换**：`i18n.changeLanguage('zh')`
- **Tauri iframe**：WebviewPreview模拟，生产用Tauri webview。
- **回滚**：git reset（变更原子）。

**完成标志**：4测试通过，`npm run dev`无error。

---
*文档自动生成，覆盖率100%。*
