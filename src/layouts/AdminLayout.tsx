import { Outlet } from 'react-router-dom';
import { DashboardShell } from '../components/layout/DashboardShell';

export function AdminLayout() {
  return (
    <DashboardShell
      role="admin"
      title="Admin dashboard"
      description="A government and platform operations view for monitoring verified tourism activity and alerts."
    >
      <Outlet />
    </DashboardShell>
  );
}

