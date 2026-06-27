# CodePilot - AI辅助编程选题博客平台

## 项目概览

基于扣子低代码平台构建的AI辅助编程选题项目，整合PC博客网站、移动端小程序风格界面及管理员后台系统，实现数据同步与AI辅助功能。

### 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + RLS)
- **AI**: coze-coding-dev-sdk (doubao-seed-2-0-lite-260215)
- **Auth**: JWT (jose) + bcryptjs

## 目录结构

```
├── public/                          # 静态资源
├── src/
│   ├── app/                         # 页面路由
│   │   ├── page.tsx                 # 博客首页
│   │   ├── layout.tsx               # 根布局
│   │   ├── article/[id]/page.tsx    # 文章详情页
│   │   ├── categories/page.tsx      # 分类列表页
│   │   ├── about/page.tsx           # 关于我页
│   │   ├── contact/page.tsx         # 联系页
│   │   ├── admin/                   # 管理后台
│   │   │   ├── login/               # 登录页
│   │   │   ├── dashboard/           # 数据看板
│   │   │   ├── articles/            # 文章管理 (列表/新建/编辑)
│   │   │   ├── categories/          # 分类管理
│   │   │   ├── messages/            # 留言管理
│   │   │   ├── config/              # 配置管理
│   │   │   └── ai/                  # AI助手
│   │   └── api/                     # API 路由
│   │       ├── admin/               # 认证 (login/verify)
│   │       ├── articles/            # 文章 CRUD + 阅读量
│   │       ├── categories/          # 分类 CRUD
│   │       ├── messages/            # 留言 CRUD + 审核
│   │       ├── site-config/         # 站点配置
│   │       ├── stats/               # 数据统计
│   │       └── ai/                  # AI (generate/polish/topic)
│   ├── components/                  # 组件
│   │   ├── ui/                      # shadcn/ui 组件库
│   │   ├── blog-nav.tsx             # 博客导航栏
│   │   ├── blog-footer.tsx          # 博客页脚
│   │   ├── home-content.tsx         # 首页内容
│   │   ├── article-detail.tsx       # 文章详情
│   │   ├── categories-content.tsx   # 分类页内容
│   │   ├── auth-provider.tsx        # 认证上下文
│   │   ├── admin-shell.tsx          # 后台侧边栏布局
│   │   ├── admin-dashboard.tsx      # 数据看板
│   │   ├── admin-articles.tsx       # 文章列表管理
│   │   ├── article-editor.tsx       # 文章编辑器 (含AI写作)
│   │   ├── admin-categories.tsx     # 分类管理
│   │   ├── admin-messages.tsx       # 留言审核
│   │   ├── admin-config.tsx         # 配置面板
│   │   └── ai-assistant.tsx         # AI助手 (选题/生成/润色)
│   ├── hooks/                       # 自定义 Hooks
│   ├── lib/
│   │   ├── auth.ts                  # JWT 签名/验证
│   │   ├── types.ts                 # 全局类型定义
│   │   └── utils.ts                 # 工具函数
│   └── storage/database/
│       ├── shared/schema.ts         # 数据库 Schema
│       ├── shared/relations.ts      # 表关联定义
│       └── supabase-client.ts       # Supabase 客户端
├── DESIGN.md                        # 设计规范
└── AGENTS.md                        # 本文件
```

## 数据库表结构

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `admins` | 管理员账户 | username, password_hash, email, role, is_active |
| `articles` | 文章 | title, slug, content, summary, category_id(FK), author, view_count, status, is_top |
| `categories` | 分类 | name, slug, description, sort_order |
| `messages` | 留言 | name, email, content, status(pending/approved/rejected), reply |
| `site_config` | 站点配置 | config_key, config_value, description |

### 关联关系

- `articles.category_id` → `categories.id` (多对一)
- 所有表已启用 RLS，后端使用 service_role_key 操作

## API 接口清单

| 路径 | 方法 | 认证 | 功能 |
|------|------|------|------|
| `/api/admin/login` | POST | 否 | 管理员登录 |
| `/api/admin/verify` | GET | 是 | 验证 Token |
| `/api/articles` | GET | 否 | 文章列表 (支持分页/筛选) |
| `/api/articles` | POST | 是 | 创建文章 |
| `/api/articles/[id]` | GET | 否 | 文章详情 |
| `/api/articles/[id]` | PUT | 是 | 更新文章 |
| `/api/articles/[id]` | DELETE | 是 | 删除文章 |
| `/api/articles/[id]/view` | POST | 否 | 增加阅读量 |
| `/api/categories` | GET | 否 | 分类列表 |
| `/api/categories` | POST | 是 | 创建分类 |
| `/api/categories/[id]` | PUT | 是 | 更新分类 |
| `/api/categories/[id]` | DELETE | 是 | 删除分类 |
| `/api/messages` | GET | 是 | 留言列表 |
| `/api/messages` | POST | 否 | 提交留言 |
| `/api/messages/[id]` | PUT | 是 | 审核留言 |
| `/api/site-config` | GET | 否 | 获取站点配置 |
| `/api/site-config` | PUT | 是 | 更新站点配置 |
| `/api/stats` | GET | 是 | 数据统计 |
| `/api/ai/generate` | POST | 是 | AI生成文章 (SSE流式) |
| `/api/ai/polish` | POST | 是 | AI润色内容 (SSE流式) |
| `/api/ai/topic` | POST | 是 | AI选题推荐 |

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发环境
coze dev

# 构建
coze build

# 生产环境
coze start

# 类型检查
pnpm ts-check

# Lint
pnpm lint
```

## 管理员账号

- 用户名: `admin`
- 密码: `admin123`
- 角色: `super_admin`

## 编码规范

- TypeScript strict 模式，禁止隐式 any
- 函数参数和返回值必须有类型标注
- 使用 `getSupabaseClient()` 获取数据库客户端（后端 service_role_key）
- AI 接口必须使用 SSE 流式输出
- 认证接口通过 `authenticateRequest(request)` 验证 JWT
- 所有 API 路由遵循 Next.js App Router 规范
- UI 组件优先使用 shadcn/ui

## 设计规范

详见 `DESIGN.md` - 深色科技风 + 琥珀金点缀，JetBrains Mono 代码字体
