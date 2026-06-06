# 学习加速器

学习加速器是一个以 `Markdown 知识库` 为核心，逐步扩展 `AI 总结`、`训练`、`反馈` 与 `复盘` 能力的个人学习系统。

当前仓库处于 `V1.1 前端开发 + V1.0 后端知识库底座` 的并行阶段，已经可以本地运行：

- 后端知识库 API
- 前端工作台页面
- 本地 JSON 持久化
- 附件上传与导出导入

## 项目状态

当前已经完成的部分：

- V1.0 / V1.1 设计文档与开发计划
- 本地优先知识库存储设计
- 后端知识库零依赖基础骨架
- Prisma 首版 schema
- 知识空间、笔记、文件夹、标签、搜索的最小服务实现
- 自动化测试基线
- V1.1 前端工作台壳层
- 知识库模块主页面框架
- Markdown 预览与源码并排编辑能力
- 统一样式令牌与复用组件基础

当前还未完成的部分：

- NestJS 正式启动骨架
- Next.js 正式页面骨架
- PostgreSQL / Redis 真正接入
- Prisma migration 执行
- 用户注册登录完整流程
- 知识库前端与真实后端 API 的完整对接

## 仓库结构

```text
Study/
├── apps/
│   ├── api/       # 后端应用与知识库 API
│   └── web/       # 前端工作台页面
├── packages/
│   └── shared/    # 共享类型与公共契约预留
├── prisma/        # Prisma schema
├── docs/          # 设计文档与开发文档
├── storage/       # 本地数据、附件、导出文件
├── .env.example   # 环境变量样例
└── package.json   # workspace 根配置
```

## 本地优先部署方式

V1.0 / V1.1 推荐采用 `本地优先` 部署方案。

这意味着：

- 核心知识数据默认保存在本机
- 不依赖云数据库才能运行
- 后续可以平滑迁移到云端 PostgreSQL

推荐的本地运行架构：

```text
浏览器
  ↓
Web 工作台（当前为本地 Node 页面服务，后续可迁移到 Next.js）
  ↓
API 服务（本地知识库服务）
  ↓
PostgreSQL（未来接入）

Redis（未来接入）

storage/（本地目录）
  ├── uploads/
  ├── exports/
  └── temp/
```

## 运行环境

- Node.js `>= 24`
- npm `>= 11`

## 当前可直接运行的方式

当前仓库已经提供两个可独立启动的本地服务：

- API 服务，默认端口 `3001`
- Web 工作台，默认端口 `3000`

### 1. 运行测试

在项目根目录执行：

```bash
npm test
```

当前测试覆盖：

- 本地优先存储配置
- `Note` 领域对象校验
- `NoteService` 创建、更新、软删除
- `FolderService`
- `TagService`
- `KnowledgeSpaceService`
- `SearchService`

如果环境正常，预期输出类似：

```text
All 111 test(s) passed.
```

### 2. 启动 API 服务

在项目根目录执行：

```bash
npm run dev:api
```

或者：

```bash
npm run start:api
```

启动后访问：

- `http://localhost:3001/`
- `http://localhost:3001/api/health`

当前 API 可用能力：

- 初始化默认知识空间
- 创建、查询、更新、删除笔记
- 笔记软删除与恢复
- 笔记收藏
- 批量删除与批量打标签
- 笔记搜索
- Markdown 导入与批量导入
- 创建、编辑、删除文件夹
- 文件夹树展示
- 创建、编辑、删除标签
- 标签绑定、解绑与整组同步
- 本地附件上传、展示、打开与删除
- 知识库 JSON 导出与导入
- 本地 JSON 文件持久化

本地数据文件默认写入：

```text
storage/data/knowledge-base.json
```

### 3. 启动 Web 工作台

在项目根目录执行：

```bash
npm run dev:web
```

启动后访问：

- `http://localhost:3000/`

如果 `3000` 已经被占用，Web 服务会自动顺延到下一个可用端口，并在终端里打印实际地址。

当前 Web 页面特点：

- 左侧窄图标栏常驻
- 鼠标悬停显示功能名称
- 顶部全局栏
- 底部状态栏与快捷操作
- 知识库模块默认是内容中心布局
- Markdown 默认以预览模式展示
- 点击按钮后可展开源码编辑器，并与预览并排显示
- 样式和组件尽量统一管理，避免硬编码和重复造轮子

### 4. 前后端分别启动

如果你希望同时看前端和 API，可以打开两个终端分别执行：

```bash
npm run dev:api
```

```bash
npm run dev:web
```

## 目标部署方式

当依赖安装完整后，标准本地部署方式应继续朝下面的方向演进：

1. 完成 API 的正式框架化
2. 接入 Prisma Client 和数据库仓储层
3. 补齐知识库 CRUD 与 DTO
4. 让 Web 页面改为真正的前端框架页面
5. 接入本地 PostgreSQL 与 Redis

## 数据保存方式

当前设计下，知识库数据建议这样保存：

- `PostgreSQL`
  - 用户
  - 知识空间
  - 文件夹
  - 笔记
  - 标签
  - 文档切片
  - AI 任务记录
- `pgvector`
  - 向量检索数据
- `Redis`
  - 队列和缓存
- `storage/`
  - 上传文件
  - 导出文件
  - 临时文件

不建议把系统核心知识数据只保存在本地 Markdown 文件里。

## 关键文档

- [学习加速器项目总控文档.md](/D:/A-Projects/Study/docs/学习加速器项目总控文档.md)
- [2026-06-01-V1.0设计文档.md](/D:/A-Projects/Study/docs/2026-06-01-V1.0设计文档.md)
- [2026-06-01-V1.0开发计划.md](/D:/A-Projects/Study/docs/2026-06-01-V1.0开发计划.md)
- [2026-06-01-本地优先知识库存储设计.md](/D:/A-Projects/Study/docs/知识库模块/2026-06-01-本地优先知识库存储设计.md)
- [v1.1.0开发计划.md](/D:/A-Projects/Study/docs/v1.1.0开发计划.md)
- [2026-06-03-V1.1前端实现方案.md](/D:/A-Projects/Study/docs/2026-06-03-V1.1前端实现方案.md)
- [2026-06-03-UI开发规范.md](/D:/A-Projects/Study/docs/2026-06-03-UI开发规范.md)

## 下一步开发建议

推荐继续按以下顺序推进：

1. 让前端工作台接入真实 API 数据
2. 完成知识库模块的真实 CRUD 页面
3. 补齐组件复用和统一主题系统
4. 接入 Prisma Client 和数据库仓储层
5. 再逐步接入 PostgreSQL 与 Redis

这样可以保持“先稳定底座，再扩功能”的节奏。
