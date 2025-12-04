# opcode macOS 应用打包与部署指南

本文档详细记录了 opcode 应用在 macOS Intel 平台上的打包过程、部署方法和相关技术要点。

## 📋 目录

- [前置要求](#前置要求)
- [项目结构](#项目结构)
- [打包流程](#打包流程)
- [部署说明](#部署说明)
- [故障排除](#故障排除)
- [技术要点](#技术要点)

## 🔧 前置要求

### 系统要求
- macOS 10.15+ (Catalina 或更高版本)
- Intel x86_64 处理器
- Xcode Command Line Tools
- 管理员权限

### 必需工具
```bash
# 安装 Rust 和 Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Node.js 和 npm
brew install node

# 验证安装
rustc --version
npm --version
```

## 📁 项目结构

```
opcode/
├── src/                    # React 前端源码
├── src-tauri/             # Rust 后端源码
│   ├── Cargo.toml        # Rust 项目配置
│   ├── tauri.conf.json   # Tauri 应用配置
│   ├── icons/            # 应用图标资源
│   └── target/           # 编译输出目录
│       └── release/      # 发布版本
├── dist/                 # 前端构建输出
└── package.json         # Node.js 项目配置
```

## 🚀 打包流程

### 1. 准备工作

首先确保项目代码是最新的，并且没有运行的开发服务器：

```bash
# 停止所有运行的开发服务器
pkill -f "npm run tauri dev" || true
pkill -f "npm run dev" || true
```

### 2. 构建后端 (Rust)

```bash
# 进入 Tauri 项目目录
cd src-tauri

# 清理之前的构建
cargo clean

# 构建优化的 Release 版本
cargo build --release
```

构建成功后，可执行文件将生成在：
- `src-tauri/target/release/opcode` (主程序)
- `src-tauri/target/release/opcode-web` (Web 服务器版本)

### 3. 构建前端 (React/Vite)

如果 `dist/` 目录不存在或需要更新：

```bash
# 返回项目根目录
cd ..

# 安装依赖 (如果需要)
npm install

# 构建前端
npm run build
```

### 4. 创建 macOS 应用包结构

#### 4.1 创建目录结构
```bash
mkdir -p src-tauri/target/release/bundle/macos/opcode.app/Contents/MacOS
mkdir -p src-tauri/target/release/bundle/macos/opcode.app/Contents/Resources
```

#### 4.2 创建 Info.plist
在 `src-tauri/target/release/bundle/macos/opcode.app/Contents/` 创建 `Info.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>opcode</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
    <key>CFBundleIdentifier</key>
    <string>com.asterisk.opcode</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>opcode</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.2.1</string>
    <key>CFBundleVersion</key>
    <string>0.2.1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
</dict>
</plist>
```

#### 4.3 复制文件到应用包
```bash
# 复制可执行文件
cp src-tauri/target/release/opcode src-tauri/target/release/bundle/macos/opcode.app/Contents/MacOS/

# 复制前端资源
cp -r dist src-tauri/target/release/bundle/macos/opcode.app/Contents/Resources/

# 复制应用图标
cp src-tauri/icons/icon.icns src-tauri/target/release/bundle/macos/opcode.app/Contents/Resources/
```

### 5. 创建 DMG 安装包

#### 5.1 准备 DMG 内容
```bash
mkdir -p src-tauri/target/release/bundle/dmg
cp -R src-tauri/target/release/bundle/macos/opcode.app src-tauri/target/release/bundle/dmg/
```

#### 5.2 创建 DMG 镜像
```bash
cd src-tauri/target/release/bundle

# 创建压缩的 DMG 文件
hdiutil create -volname "opcode" -srcfolder dmg -ov -format UDZO opcode-0.2.1.dmg
```

## 📦 部署说明

### 生成的文件

打包完成后，您将获得以下文件：

1. **应用包 (APP)**: `src-tauri/target/release/bundle/macos/opcode.app`
   - 完整的 macOS 应用程序
   - 包含所有必要的依赖和资源
   - 约 13.6 MB

2. **安装包 (DMG)**: `src-tauri/target/release/bundle/opcode-0.2.1.dmg`
   - 可分发的磁盘镜像
   - 便于用户安装和分发
   - 约 9.6 MB

### 安装方法

#### 方法一：直接运行
```bash
# 直接启动应用
open src-tauri/target/release/bundle/macos/opcode.app
```

#### 方法二：DMG 安装
1. 双击 `opcode-0.2.1.dmg` 文件
2. 在弹出的挂载窗口中，将 `opcode.app` 拖拽到 "应用程序" 文件夹
3. 从 Launchpad 或 Applications 文件夹启动应用

#### 方法三：命令行安装
```bash
# 复制应用到应用程序文件夹
cp -R opcode.app /Applications/

# 启动应用
open /Applications/opcode.app
```

### 分发建议

1. **内部测试**：直接分享 `.app` 文件
2. **正式发布**：使用 `.dmg` 文件
3. **代码签名**：对于分发，建议进行 Apple 代码签名
4. **公证**：用于 Gatekeeper 验证

## 🔧 故障排除

### 常见问题

#### 1. 版本不匹配错误
**问题**: Tauri CLI 和依赖版本不匹配
```
Error: Found version mismatched Tauri packages
```

**解决方案**:
```bash
# 更新 package.json 中的 Tauri 版本
"@tauri-apps/api": "^2.6.0",
"@tauri-apps/cli": "^2.6.0",

# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

#### 2. 前端构建失败
**问题**: TypeScript 编译错误或缺少依赖
```
npm ERR! tsc: command not found
```

**解决方案**:
```bash
# 安装 TypeScript
npm install -g typescript

# 或使用 npx
npx tsc && npx vite build
```

#### 3. 权限错误
**问题**: 无法启动应用，权限被拒绝
```
Error: Permission denied
```

**解决方案**:
```bash
# 设置可执行权限
chmod +x src-tauri/target/release/bundle/macos/opcode.app/Contents/MacOS/opcode

# 如果是沙盒问题，允许应用运行
xattr -d com.apple.quarantine opcode.app
```

#### 4. 图标不显示
**问题**: 应用图标显示为默认图标

**解决方案**:
- 确保 `icon.icns` 文件存在且格式正确
- 检查 `Info.plist` 中的 `CFBundleIconFile` 配置
- 重新构建应用包

### 调试技巧

#### 1. 验证应用包结构
```bash
# 检查应用包内容
find opcode.app -type f

# 验证可执行文件
file opcode.app/Contents/MacOS/opcode

# 检查 Info.plist
plutil -lint opcode.app/Contents/Info.plist
```

#### 2. 测试 DMG 文件
```bash
# 挂载 DMG 文件
hdiutil attach opcode-0.2.1.dmg -readonly

# 检查挂载内容
ls -la /Volumes/opcode/

# 卸载 DMG
hdiutil detach /Volumes/opcode
```

## 📚 技术要点

### Tauri 应用架构

Tauri 应用采用了前后端分离的架构：

1. **前端 (WebView)**: 基于 React/Vite 的 Web 界面
2. **后端 (Rust)**: 提供系统级功能和 API 接口
3. **IPC 通信**: 通过 Tauri 的 IPC 机制进行前后端通信

### 应用包结构说明

```
opcode.app/
├── Contents/
│   ├── Info.plist          # 应用元数据配置
│   ├── MacOS/
│   │   └── opcode          # 主可执行文件
│   └── Resources/
│       ├── icon.icns       # 应用图标
│       └── dist/           # 前端资源文件
```

### 关键配置项

#### Info.plist 重要字段
- `CFBundleExecutable`: 可执行文件名
- `CFBundleIdentifier`: 应用唯一标识符
- `LSMinimumSystemVersion`: 最低系统版本要求
- `NSHighResolutionCapable`: 支持高分辨率显示

#### tauri.conf.json 配置
```json
{
  "bundle": {
    "identifier": "com.asterisk.opcode",
    "icon": ["icons/icon.icns"],
    "category": "DeveloperTool",
    "macOS": {
      "minimumSystemVersion": "10.15"
    }
  }
}
```

### 构建优化

1. **Rust 优化**: 使用 `--release` 标志进行生产构建
2. **前端优化**: Vite 自动进行代码分割和压缩
3. **资源优化**: 图标和资源文件被适当压缩
4. **DMG 压缩**: 使用 UDZO 格式减少文件大小

## 📄 许可证信息

- 应用采用 AGPL-3.0 许可证
- 分发时请包含许可证文件
- 遵守相关的开源许可证要求

---

**注意**: 本指南基于 opcode 项目的具体配置编写，其他 Tauri 项目可能需要根据实际情况调整配置。