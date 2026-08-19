import { useState, useEffect } from 'react'
import { Tree, Button, Modal, Form, Input, Select, Switch, Space, Empty, Tag, Popconfirm, App as AntdApp } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderAddOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import type { MenuNode } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import IconByName from '@/shared/components/IconByName'

const iconOptions = ['FileText', 'FileAdd', 'BarChart', 'Calendar', 'Setting', 'Home', 'Team', 'Profile', 'Plus', 'Monitor', 'Appstore', 'Dashboard']

let keySeq = 0
const genKey = () => `mk-${Date.now()}-${++keySeq}`

// 深拷贝菜单树
const clone = (nodes: MenuNode[]): MenuNode[] => nodes.map((n) => ({ ...n, children: n.children ? clone(n.children) : undefined }))

// 递归操作
function mapTree(nodes: MenuNode[], fn: (n: MenuNode) => MenuNode): MenuNode[] {
  return nodes.map((n) => ({ ...fn(n), children: n.children ? mapTree(n.children, fn) : undefined }))
}
function findNode(nodes: MenuNode[], key: string): MenuNode | undefined {
  for (const n of nodes) {
    if (n.key === key) return n
    if (n.children) {
      const f = findNode(n.children, key)
      if (f) return f
    }
  }
}

export default function MenuRegisterTab({ appId }: { appId: string }) {
  const { message } = AntdApp.useApp()
  const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const setAppMenus = useAppStore((s) => s.setAppMenus)
  const [menus, setMenus] = useState<MenuNode[]>(() => clone(app.menus))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [parentKey, setParentKey] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    setMenus(clone(app.menus))
  }, [app.id])

  const commit = (next: MenuNode[]) => {
    setMenus(next)
    setAppMenus(appId, next)
  }

  const openAdd = (pk: string | null) => {
    setEditingKey(null)
    setParentKey(pk)
    form.resetFields()
    form.setFieldsValue({ icon: 'FileText', hidden: false })
    setModalOpen(true)
  }

  const openEdit = (node: MenuNode) => {
    setEditingKey(node.key)
    setParentKey(null)
    form.setFieldsValue({ title: node.title, icon: node.icon, path: node.path, hidden: node.hidden })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then((v: { title: string; icon?: string; path?: string; hidden?: boolean }) => {
      if (editingKey) {
        const next = mapTree(menus, (n) => (n.key === editingKey ? { ...n, title: v.title, icon: v.icon, path: v.path, hidden: v.hidden } : n))
        commit(next)
        message.success('菜单已更新')
      } else {
        const newNode: MenuNode = { key: genKey(), title: v.title, icon: v.icon, path: v.path, hidden: v.hidden }
        if (parentKey) {
          const next = mapTree(menus, (n) => (n.key === parentKey ? { ...n, children: [...(n.children ?? []), newNode] } : n))
          commit(next)
        } else {
          commit([...menus, newNode])
        }
        message.success('菜单已新增')
      }
      setModalOpen(false)
    })
  }

  const handleDelete = (key: string) => {
    const next = menus
      .map((n) => (n.key === key ? null : { ...n, children: n.children ? handleDeleteInPlace(n.children, key) : undefined }))
      .filter(Boolean) as MenuNode[]
    commit(next)
    message.success('菜单已删除')
  }
  const handleDeleteInPlace = (nodes: MenuNode[], key: string): MenuNode[] =>
    nodes
      .map((n) => (n.key === key ? null : { ...n, children: n.children ? handleDeleteInPlace(n.children, key) : undefined }))
      .filter(Boolean) as MenuNode[]

  // 拖拽排序
  const onDrop = (info: any) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const data = clone(menus)
    let dragObj: MenuNode | undefined
    // 取出拖拽节点
    const loopRemove = (arr: MenuNode[], key: string): MenuNode | undefined => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key === key) {
          const [removed] = arr.splice(i, 1)
          return removed
        }
        if (arr[i].children) {
          const r = loopRemove(arr[i].children!, key)
          if (r) return r
        }
      }
    }
    dragObj = loopRemove(data, dragKey)
    if (!dragObj) return
    const loopInsert = (arr: MenuNode[], key: string, node: MenuNode, pos: number) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key === key) {
          if (pos === -1) arr.splice(i, 0, node)
          else if (pos === 1) arr.splice(i + 1, 0, node)
          else arr[i].children = [...(arr[i].children ?? []), node]
          return
        }
        if (arr[i].children) loopInsert(arr[i].children!, key, node, pos)
      }
    }
    if (!info.dropToGap) {
      loopInsert(data, dropKey, dragObj, 0)
    } else {
      loopInsert(data, dropKey, dragObj, dropPosition)
    }
    commit(data)
    message.success('菜单顺序已调整')
  }

  const titleRender = (node: MenuNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
      <Space size={6}>
        <IconByName name={node.icon} style={{ color: '#2563eb' }} />
        <span style={{ fontWeight: 500 }}>{node.title}</span>
        {node.path && <Tag style={{ margin: 0, fontSize: 11, fontFamily: 'monospace' }}>{node.path}</Tag>}
        {node.hidden && <Tag color="default" style={{ margin: 0, fontSize: 11 }}><EyeInvisibleOutlined /> 隐藏</Tag>}
      </Space>
      <Space size={4}>
        <Button size="small" type="text" icon={<FolderAddOutlined />} onClick={() => openAdd(node.key)} />
        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(node)} />
        <Popconfirm title="确认删除该菜单？" onConfirm={() => handleDelete(node.key)}>
          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#64748b', fontSize: 13 }}>注册应用菜单结构，支持新增 / 编辑 / 删除 / 拖拽排序，发布后将注入工作台左侧导航。</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd(null)}>新增顶级菜单</Button>
      </div>
      {menus.length === 0 ? (
        <Empty description="暂无菜单，点击右上角新增" />
      ) : (
        <Tree
          treeData={menus as any}
          titleRender={titleRender}
          draggable
          blockNode
          defaultExpandAll
          onDrop={onDrop}
        />
      )}

      <Modal
        title={editingKey ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="菜单名称" name="title" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="例如：合同列表" />
          </Form.Item>
          <Form.Item label="页面路由" name="path">
            <Input placeholder="例如：/contract/list" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item label="菜单图标" name="icon">
            <Select options={iconOptions.map((i) => ({ value: i, label: i }))} />
          </Form.Item>
          <Form.Item label="是否隐藏" name="hidden" valuePropName="checked">
            <Switch checkedChildren="隐藏" unCheckedChildren="显示" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}