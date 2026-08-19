# GIP - 光粒智能平台 V1.0

北汽集团光粒AI平台第一阶段版本，包含应用中心、流程中心、系统配置三大核心模块。

## 功能模块

### 应用中心
- 应用列表管理（增删改查）
- 应用创建与配置
- 应用能力组件选择

### 流程中心
- **流程设计** — 可视化审批流编排画布，支持拖拽节点、连线、网关，内置Agent节点（智能摘要、审批预测、合规校验、效率分析）和自然语言生成流程
- **表单设计** — 低代码表单搭建，拖拽生成录入表单，自动绑定实体字段与校验规则，支持自然语言生成表单
- **实体设计** — 数据库实体建模，自动生成建表语句与接口，支持自然语言生成实体
- **Agent审批助手** — 4个Agent能力卡片 + 辅助审批实例
- **流程监控** — 流程实例统计与实时监控

### 系统配置
- **租户管理** — 租户列表、配额管理、能力开关、主题配置
- **人员组织数据** — 组织架构树、人员列表搜索、新增人员
- **SSO配置** — 统一身份认证配置

## 技术栈

- React 18 + TypeScript
- Vite
- Ant Design 5
- React Router 6
- Zustand (状态管理)
- dayjs (日期处理)

## 开发

```bash
npm install
npm run dev    # 启动开发服务器 (默认端口 5174)
npm run build  # 构建生产版本
```

## 项目结构

```
src/
├── App.tsx                    # 路由配置
├── main.tsx                   # 应用入口
├── developer-center/          # 开发者中心
│   └── pages/
│       ├── AppsList.tsx       # 应用列表
│       ├── CreateApp.tsx      # 创建应用
│       ├── AppDetail.tsx      # 应用详情
│       ├── Admin.tsx          # 流程中心 + 系统配置 (section prop)
│       └── admin/
│           ├── ProcessDesigner.tsx  # 流程设计画布
│           ├── FormDesigner.tsx     # 表单设计画布
│           └── EntityDesigner.tsx   # 实体设计画布
├── workbench/                 # 工作台
│   ├── pages/
│   │   └── AppEntry.tsx       # 应用入口
│   └── components/            # 能力组件视图
├── shared/
│   ├── layouts/
│   │   ├── DeveloperLayout.tsx  # 顶部导航布局
│   │   └── WorkbenchLayout.tsx  # 工作台布局
│   └── components/            # 通用组件
├── mock/                      # Mock 数据
├── store/                     # Zustand 状态管理
└── types/                     # TypeScript 类型定义
```
