import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import HomePage from './pages/HomePage'
import '../styles/app.css'

const WorkspacePage = lazy(() => import('./pages/WorkspacePage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="workspace-shell">Loading workspace...</div>}>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<WorkspacePage />} path="/workspace" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
