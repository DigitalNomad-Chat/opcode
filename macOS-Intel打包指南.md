# opcode macOS Intel 打包指南（Tauri）

**芯片**：Intel (x86_64-apple-darwin)
**前提**：Node/npm、Rustup安装。

## 快速打包（5min）
```bash
# 1. 安装Rust（首次）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
rustup target add x86_64-apple-darwin

# 2. 清理进程/依赖
pkill -f vite; pkill -f tauri; npm i

# 3. 开发测试
npm run tauri dev -- --target x86_64-apple-darwin

# 4. 生产打包（.dmg）
npm run tauri build -- --target x86_64-apple-darwin
```
**输出**：`src-tauri/target/release/bundle/dmg/opcode_x86_64.dmg`（Intel .app）

## 详细步骤
### 1. 环境
- **Rust**：stable，`rustup target add x86_64-apple-darwin`（Intel）。
- **Tauri**：`src-tauri/Cargo.toml`、`tauri.conf.json`确认。
- **Xcode**：Command Line Tools（`xcode-select --install`）。

### 2. 配置（tauri.conf.json）
```json
{
  "productName": "opcode",
  "bundle": {
    "macOS": {
      "target": "x86_64-apple-darwin"
    }
  }
}
```

### 3. 构建变体
| 命令 | 输出 | 用法 |
|------|------|------|
| `npm run tauri dev -- --target x86_64-apple-darwin` | .app (dev) | 热重载测试 |
| `npm run tauri build -- --target x86_64-apple-darwin` | .dmg/.app (release) | 分发 |
| `npm run tauri build -- --bundles dmg,app` | DMG+App | 完整 |

### 4. 签名/公证（分发）
```bash
# Developer ID（Apple开发者账号）
codesign --force --sign "Developer ID Application: Your Name" --options runtime src-tauri/target/release/bundle/osx/Opcode.app

# Notarization
xcrun notarytool submit Opcode.dmg --keychain-profile "notary-profile" --wait
```

### 5. 测试Intel Mac
- Rosetta 2：Apple Silicon自动。
- `file Opcode.app` → `Mach-O 64-bit x86_64 executable`。

### 常见问题
- **Cargo metadata失败**：`rustup update`。
- **端口冲突**：`pkill tauri`。
- **签名失败**：Keychain→Certificates→Developer ID。
- **体积优化**：`tauri.conf.json` updaters/icons。

**签名DMG**：`src-tauri/target/release/bundle/dmg/` 即用。

---
*AI生成，2025-12-03*
