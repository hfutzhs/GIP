import { Routes, Route, Navigate } from 'react-router-dom'
import DeveloperLayout from './shared/layouts/DeveloperLayout'
import WorkbenchLayout from './shared/layouts/WorkbenchLayout'
import AppsList from './developer-center/pages/AppsList'
import AppDetail from './developer-center/pages/AppDetail'
import Admin from './developer-center/pages/Admin'
import AppEntry from './workbench/pages/AppEntry'

export default function App() {
  return (
    <Routes>
      <Route element={<DeveloperLayout />}>
        <Route path="/" element={<Navigate to="/apps" replace />} />
        <Route path="/apps" element={<AppsList />} />
        <Route path="/apps/:id" element={<AppDetail />} />
        <Route path="/process" element={<Admin section="process" key="process" />} />
        <Route path="/system" element={<Admin section="system" key="system" />} />
      </Route>
      <Route path="/app/:code" element={<WorkbenchLayout />}>
        <Route index element={<AppEntry />} />
      </Route>
      <Route path="*" element={<Navigate to="/apps" replace />} />
    </Routes>
  )
}
