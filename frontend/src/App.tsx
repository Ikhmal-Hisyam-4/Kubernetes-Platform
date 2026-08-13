import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { AuthGuard } from './components/AuthGuard'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { DeployGpuPage } from './pages/DeployGpuPage'
import { DeployCpuPage } from './pages/DeployCpuPage'
import { ServersPage } from './pages/ServersPage'
import { SecretsPage } from './pages/SecretsPage'
import { DevelopersPage } from './pages/DevelopersPage'
import { AccountPage } from './pages/AccountPage'
import { BillingPage } from './pages/BillingPage'
import { UsagePage } from './pages/UsagePage'
import { InvoicesPage } from './pages/InvoicesPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/deploy/gpu" element={<DeployGpuPage />} />
            <Route path="/deploy/cpu" element={<DeployCpuPage />} />
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/secrets" element={<SecretsPage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
