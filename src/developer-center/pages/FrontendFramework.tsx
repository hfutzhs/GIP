import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { capabilityMap } from '@/mock/capabilities'
import FrontendFrameworkView from './FrontendFrameworkView'

export default function FrontendFramework() {
  const cap = capabilityMap.frontend
  return (
    <div className="page-container">
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          { title: <><HomeOutlined /> 首页</>, href: '/' },
          { title: '统一前端框架' },
        ]}
      />
      <FrontendFrameworkView cap={cap} />
    </div>
  )
}