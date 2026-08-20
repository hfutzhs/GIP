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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    colorBgLayout: '#f5f7fa',
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#eef2f7',
    fontSize: 14,
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 30,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 60,
      headerPadding: '0 24px',
      bodyBg: '#f5f7fa',
      siderBg: '#ffffff',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
      paddingLG: 20,
      colorBorderSecondary: '#eef2f7',
    },
    Menu: {
      itemBg: '#ffffff',
      subMenuItemBg: '#ffffff',
      itemSelectedBg: 'rgba(37, 99, 235, 0.08)',
      itemSelectedColor: '#1d4ed8',
      itemHoverBg: 'rgba(37, 99, 235, 0.05)',
      itemColor: '#475569',
      itemHeight: 38,
      iconSize: 16,
      itemMarginInline: 8,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 42,
      controlHeightSM: 30,
      paddingInline: 16,
      primaryShadow: '0 2px 6px rgba(37,99,235,0.22)',
      defaultBorderColor: '#e2e8f0',
      defaultBg: '#ffffff',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
      activeShadow: '0 0 0 2px rgba(37,99,235,0.12)',
      colorBorder: '#e2e8f0',
      hoverBorderColor: '#93c5fd',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      colorBorder: '#e2e8f0',
      optionSelectedBg: 'rgba(37,99,235,0.08)',
      optionSelectedColor: '#1d4ed8',
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#475569',
      headerSplitColor: '#eef2f7',
      rowHoverBg: '#f0f6ff',
      borderColor: '#eef2f7',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    Drawer: {
      borderRadiusLG: 12,
    },
    Tabs: {
      itemColor: '#64748b',
      itemSelectedColor: '#1d4ed8',
      inkBarColor: '#2563eb',
      itemHoverColor: '#2563eb',
      horizontalItemPadding: '8px 0',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Form: {
      itemMarginBottom: 20,
    },
    Statistic: {
      contentFontSize: 28,
    },
    Empty: {
      colorTextDescription: '#94a3b8',
    },
    Pagination: {
      itemSize: 32,
    },
    Dropdown: {
      borderRadiusLG: 12,
      controlItemBgHover: 'rgba(37,99,235,0.06)',
      controlItemBgActive: 'rgba(37,99,235,0.08)',
    },
    Tooltip: {
      borderRadius: 8,
      paddingXS: 8,
    },
    Badge: {
    },
  },
}

export const COLORS = {
  primary: '#2563eb',
  cyan: '#06b6d4',
  bg: '#f5f7fa',
  textSecondary: '#64748b',
}
