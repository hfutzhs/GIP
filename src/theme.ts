import type { ThemeConfig } from 'antd'

// 光粒平台主题：白底 + 蓝色主色 #2563eb + 青色辅助 #06b6d4
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorInfo: '#2563eb',
    colorLink: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
    colorBgLayout: '#f5f7fa',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 60,
      headerPadding: '0 24px',
      bodyBg: '#f5f7fa',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
    },
    Menu: {
      itemSelectedBg: '#eaf1ff',
      itemSelectedColor: '#2563eb',
    },
  },
}

export const COLORS = {
  primary: '#2563eb',
  cyan: '#06b6d4',
  bg: '#f5f7fa',
  textSecondary: '#64748b',
}