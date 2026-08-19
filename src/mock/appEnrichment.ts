import type { MenuNode, Role, CapabilityKey } from '@/types'
import { contractMenus, vehicleMenus, supplierMenus } from './menus'

// 根据应用编码返回菜单树（用于工作台侧栏与权限菜单展示）
export function getAppMenus(code: string): MenuNode[] {
  switch (code) {
    case 'contract-approval':
      return contractMenus
    case 'vehicle-dispatch':
      return vehicleMenus
    case 'supplier-portal':
      return supplierMenus
    default:
      // 通用占位菜单
      return [
        { key: `${code}-home`, title: '首页', icon: 'Dashboard', path: `/${code}/home` },
        { key: `${code}-list`, title: '业务列表', icon: 'Appstore', path: `/${code}/list` },
        { key: `${code}-settings`, title: '系统设置', icon: 'Setting', path: `/${code}/settings` },
      ]
  }
}

// 根据应用编码返回已注入能力列表
export function getAppCapabilities(code: string): CapabilityKey[] {
  const base: CapabilityKey[] = ['sso', 'permission', 'todo', 'notification']
  if (code === 'contract-approval' || code === 'vehicle-dispatch') {
    return [...base, 'process']
  }
  return base
}

// 扁平化菜单 key
function flatKeys(nodes: MenuNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? flatKeys(n.children) : [])])
}

// 根据应用编码返回角色列表（演示数据）
export function getAppRoles(code: string): Role[] {
  const menus = getAppMenus(code)
  const allMenuKeys = flatKeys(menus)
  return [
    {
      id: `${code}-role-admin`,
      name: '系统管理员',
      description: '拥有应用全部菜单与操作权限',
      menuKeys: allMenuKeys,
      userIds: ['U001'],
    },
    {
      id: `${code}-role-user`,
      name: '普通用户',
      description: '仅可查看业务列表与发起流程',
      menuKeys: menus.slice(0, 2).map((m) => m.key),
      userIds: ['U002', 'U003'],
    },
  ]
}
