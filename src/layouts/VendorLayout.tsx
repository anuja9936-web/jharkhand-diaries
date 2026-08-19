import { Outlet } from 'react-router-dom';
import { DashboardShell } from '../components/layout/DashboardShell';

export function VendorLayout() {
  return (
    <DashboardShell
      role="provider"
      title="Service provider dashboard"
      description="A workspace for local artisans, homestays, guides, transport providers, and local service operators."
    >
      <Outlet />
    </DashboardShell>
  );
}
