# GitHub 仓库推送指南

## 🚀 创建并推送项目到GitHub

### 当前状态
- ✅ Git仓库已初始化
- ✅ 代码已提交到本地main分支
- ⏳ 等待创建GitHub仓库并推送

### 📋 手动创建GitHub仓库

#### 步骤1：创建GitHub仓库
1. **访问GitHub**: 打开 https://github.com
2. **登录账户**: 使用您的GitHub账户登录
3. **创建新仓库**:
   - 点击右上角的 **"+"** 按钮
   - 选择 **"New repository"**
4. **填写仓库信息**:
   - **Repository name**: `ai-gout-assistant`
   - **Description**: `AI痛风饮食助手 - 使用通义千问VL识别食物并提供嘌呤风险分析`
   - **设置**: Public（公开仓库）
   - **不要勾选**: "Add a README file"、"Add .gitignore"、"Add license"
5. **创建仓库**: 点击 **"Create repository"**

#### 步骤2：配置远程仓库并推送
创建仓库后，运行以下命令：

```bash
# 添加远程仓库（如果还没添加）
git remote add origin https://github.com/cong-hua/ai-gout-assistant.git

# 推送到GitHub
git push -u origin main
```

### 🔧 如果遇到问题

#### 1. 认证问题
如果提示输入用户名和密码：
- **用户名**: 您的GitHub用户名
- **密码**: 使用Personal Access Token（不是账户密码）

#### 2. 创建Personal Access Token
1. 访问: https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置token名称和过期时间
4. 勾选权限：
   - `repo` (完全控制仓库)
   - `workflow` (管理GitHub Actions)
5. 点击 **"Generate token"**
6. 复制生成的token（只显示一次）

#### 3. 如果仓库已存在
如果提示仓库已存在：
```bash
# 强制推送（谨慎使用）
git push -u origin main --force

# 或者先删除远程仓库重新创建
git remote remove origin
# 然后重新添加和推送
```

### 📊 项目信息

#### 项目结构
```
尿酸助手/
├── app/                    # Next.js应用目录
│   ├── api/               # API路由
│   │   ├── identify/      # 食物识别API
│   │   └── purine/         # 嘌呤查询API
│   └── page.tsx           # 主页面
├── components/             # React组件
├── lib/                   # 核心库文件
│   ├── ali-vl.ts         # 通义千问VL集成
│   └── supabase.ts       # Supabase数据库集成
├── supabase-setup.sql     # 数据库初始化脚本
├── .env.local            # 环境变量配置
└── package.json           # 项目依赖
```

#### 技术栈
- **前端**: Next.js 14.2.4 + React 18.2.0 + TypeScript
- **AI服务**: 阿里云通义千问VL API
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS
- **部署**: 支持Vercel一键部署

### 🎯 推送完成后

#### GitHub仓库功能
- 📖 **README**: 自动生成项目说明
- 📊 **Issues**: 问题跟踪
- 🔄 **Pull Requests**: 代码审查
- 🚀 **Actions**: 自动化CI/CD
- 📦 **Packages**: 包管理

#### 后续优化
- 添加GitHub Actions自动化测试
- 配置Vercel自动部署
- 添加项目文档和Wiki
- 设置项目看板

---

**执行完上述步骤后，您的AI痛风饮食助手项目就成功托管在GitHub上了！**