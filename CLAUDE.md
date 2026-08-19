# GIP 项目开发约定

> 本文件是项目级开发约定，所有新页面/功能开发默认遵循以下规范，除非用户特殊说明。

## 全局交互规范

### 新建/编辑表单：默认使用抽屉模式（Drawer）

- **规则**：所有新建、编辑类表单页面，没有特殊说明的，一律使用 Antd `Drawer` 抽屉组件从右侧滑出，而不是独立页面路由。
- 抽屉宽度统一 `520px`（内容较多时可适当加宽）。
- 抽屉底部固定放置"取消"和"确认"按钮。
- 创建/编辑成功后关闭抽屉，可弹出后续提示或确认弹窗。
- 列表页通过按钮触发抽屉打开（`open` state），不再跳转独立路由。

### 统一设计 Token

- 圆角：小 4px / 中 8px / 大 12px
- 阴影：只用轻量柔和阴影
- 间距：以 4 为基数统一，留白充足
- 字体层级区分清晰，正文不使用过大字号

## 技术栈

- React 18 + Vite 5 + Antd 5.21 + Zustand 4 + react-router-dom 6 + dayjs
- 纯前端演示项目，无后端接口
- node_modules 为 junction link，不可修改

## 项目结构

- 开发者中心：`src/developer-center/`
- 工作台：`src/workbench/`
- 共享布局：`src/shared/layouts/`
- Mock 数据：`src/mock/`
- Store：`src/store/useAppStore.ts`
