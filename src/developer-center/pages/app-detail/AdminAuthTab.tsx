import { useState, useMemo } from 'react'
import { Card, List, Tree, Input, Button, Space, Tag, Avatar, Empty, Modal, Form, Popconfirm, App as AntdApp, Divider, theme as antdTheme } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import type { MenuNode, Role } from '@/types'
import { users as allUsers, userMap } from '@/mock/users'
import { useAppStore } from '@/store/useAppStore'

// 菜单树转 antd treeData

function toTreeData(nodes: MenuNode[]): any[] {
  return nodes.map((n) => ({
    key: n.key,
    title: n.title,
    children: n.children ? toTreeData(n.children) : undefined,
  }))
}
// 收集所有 key（含父子）
function allKeys(nodes: MenuNode[]): string[] {
  return nodes.flatMap((n) => [n.key, ...(n.children ? allKeys(n.children) : [])])
}

let roleSeq = 0
const genRoleId = () => `R-${Date.now()}-${++roleSeq}`

export default function AdminAuthTab({ appId }: { appId: string }) {
  const { message } = AntdApp.useApp()
  const { token } = antdTheme.useToken()
 const app = useAppStore((s) => s.apps.find((a) => a.id === appId))!
  const setAppRoles = useAppStore((s) => s.setAppRoles)
  const [selectedRoleId, setSelectedRoleId] = useState<string>(app.roles[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleForm] = Form.useForm()

  const selectedRole = app.roles.find((r) => r.id === selectedRoleId) ?? app.roles[0]
  const treeData = useMemo(() => toTreeData(app.menus), [app.menus])

  const commit = (roles: Role[]) => setAppRoles(appId, roles)

  const updateRole = (rid: string, patch: Partial<Role>) => {
    commit(app.roles.map((r) => (r.id === rid ? { ...r, ...patch } : r)))
  }

  const onCheck = (checked: any) => {
    if (!selectedRole) return
    const keys = Array.isArray(checked) ? checked : checked.checked
    updateRole(selectedRole.id, { menuKeys: keys })
  }

  const openAddRole = () => {
    setEditingRole(null)
    roleForm.resetFields()
    roleForm.setFieldsValue({ name: '', description: '' })
    setRoleModalOpen(true)
  }
  const openEditRole = (r: Role) => {
    setEditingRole(r)
    roleForm.setFieldsValue({ name: r.name, description: r.description })
    setRoleModalOpen(true)
  }
  const saveRole = () => {
    roleForm.validateFields().then((v: { name: string; description: string }) => {
      if (editingRole) {
        updateRole(editingRole.id, { name: v.name, description: v.description })
        message.success('角色已更新')
      } else {
        const newRole: Role = { id: genRoleId(), name: v.name, description: v.description, menuKeys: [], userIds: [] }
        commit([...app.roles, newRole])
        setSelectedRoleId(newRole.id)
        message.success('角色已新增')
      }
      setRoleModalOpen(false)
    })
  }
  const deleteRole = (r: Role) => {
    const rest = app.roles.filter((x) => x.id !== r.id)
    commit(rest)
    if (selectedRoleId === r.id) setSelectedRoleId(rest[0]?.id ?? '')
    message.success('角色已删除')
  }

  const assignUser = (uid: string) => {
    if (!selectedRole) return
    if (selectedRole.userIds.includes(uid)) return
    updateRole(selectedRole.id, { userIds: [...selectedRole.userIds, uid] })
    message.success(`已将 ${userMap[uid]?.name} 设为「${selectedRole.name}」`)
  }
  const removeUser = (uid: string) => {
    if (!selectedRole) return
    updateRole(selectedRole.id, { userIds: selectedRole.userIds.filter((x) => x !== uid) })
  }

  const filteredUsers = allUsers.filter(
    (u) => u.name.includes(search) || u.department.includes(search) || u.position.includes(search),
  )
  const assignedUsers = selectedRole ? selectedRole.userIds.map((uid) => userMap[uid]).filter(Boolean) : []

  return (
    <div>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 角色列表 */}
        <Card
          title={<span style={{ fontSize: 14 }}><TeamOutlined /> 角色列表</span>}
          style={{ borderRadius: 12, width: 280, flexShrink: 0, alignSelf: 'flex-start' }}
          extra={<Button size="small" type="primary" icon={<PlusOutlined />} onClick={openAddRole}>新增</Button>}
        >
          <List
            dataSource={app.roles}
            locale={{ emptyText: <Empty description="暂无角色" /> }}
            renderItem={(r) => (
              <List.Item
                style={{
                  padding: '10px 8px',
                  cursor: 'pointer',
                  borderRadius: 8,
                  background: selectedRole?.id === r.id ? '#eaf1ff' : 'transparent',
                  border: 'none',
                }}
                onClick={() => setSelectedRoleId(r.id)}
                actions={[
                  <Button key="edit" size="small" type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditRole(r) }} />,
                  <Popconfirm key="del" title="确认删除角色？" onConfirm={(e) => { e?.stopPropagation(); deleteRole(r) }}>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ background: selectedRole?.id === r.id ? token.colorPrimary : '#94a3b8' }} icon={<UserOutlined />} />}
                  title={<span style={{ fontSize: 13 }}>{r.name}</span>}
                  description={<span style={{ fontSize: 11 }}>{r.userIds.length} 人 · {r.menuKeys.length} 菜单</span>}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 右侧：权限 + 人员 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedRole ? (
            <>
              <Card
                title={<span style={{ fontSize: 14 }}>菜单权限 · {selectedRole.name}</span>}
                style={{ borderRadius: 12 }}
                extra={<Tag color="blue">{selectedRole.menuKeys.length} 项已授权</Tag>}
              >
                {app.menus.length === 0 ? (
                  <Empty description="请先在「菜单注册」中添加菜单" />
                ) : (
                  <Tree
                    checkable
                    defaultExpandAll
                    treeData={treeData}
                    checkedKeys={selectedRole.menuKeys}
                    onCheck={onCheck}
                  />
                )}
              </Card>

              <Card
                title={<span style={{ fontSize: 14 }}>人员授权 · {selectedRole.name}</span>}
                style={{ borderRadius: 12 }}
                extra={
                  <Input
                    size="small"
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="搜索人员"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 200 }}
                  />
                }
              >
                {assignedUsers.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', marginRight: 8 }}>已授权：</span>
                    {assignedUsers.map((u) => (
                      <Tag key={u.id} closable onClose={() => removeUser(u.id)} style={{ marginBottom: 4 }}>
                        {u.name} · {u.department}
                      </Tag>
                    ))}
                  </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <List
                  size="small"
                  dataSource={filteredUsers.filter((u) => !selectedRole.userIds.includes(u.id))}
                  locale={{ emptyText: <Empty description="无可添加人员" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                  renderItem={(u) => (
                    <List.Item
                      actions={[
                        <Button key="add" size="small" type="link" onClick={() => assignUser(u.id)}>分配</Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar size="small">{u.avatar}</Avatar>}
                        title={<span style={{ fontSize: 13 }}>{u.name} · <span style={{ color: '#94a3b8', fontWeight: 400 }}>{u.position}</span></span>}
                        description={<span style={{ fontSize: 11, color: '#94a3b8' }}>{u.department}</span>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </>
          ) : (
            <Empty description="请选择或新增角色" />
          )}
        </div>
      </div>

      <Modal title={editingRole ? '编辑角色' : '新增角色'} open={roleModalOpen} onOk={saveRole} onCancel={() => setRoleModalOpen(false)} destroyOnClose>
        <Form form={roleForm} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="例如：审批员" />
          </Form.Item>
          <Form.Item label="角色描述" name="description">
            <Input placeholder="角色的职责说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}