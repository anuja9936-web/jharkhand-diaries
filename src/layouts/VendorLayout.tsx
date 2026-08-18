import { Outlet } from 'react-router-dom';
import { DashboardShell } from '../components/layout/DashboardShell';

export function VendorLayout() {
  return (
    <DashboardShell
      role="vendor"
      title="Vendor dashboard"
      description="A workspace for local artisans, homestays, guides, transport providers, and service operators."
    >
      <Outlet />
    </DashboardShell>
  );
}

